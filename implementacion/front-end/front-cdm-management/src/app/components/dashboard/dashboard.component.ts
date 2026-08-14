import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlarmService } from '../../services/alarm.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Alarm, AlarmFilterQuery, PaginatedAlarms } from '../../models/alarm.models';
import { Subscription } from 'rxjs';
import {
  ALERT_PRIORITY_CLASSES,
  ALERT_PRIORITY_LABELS,
  ALERT_TYPE_COLORS,
  ALERT_TYPE_ICONS,
  getAlertTypeBorderClass
} from '../../shared/alert-ui.config';
import { GoogleMapsService } from '../../services/google-maps.service';
import { Operator } from 'src/app/models/person.models';
import { CatalogueService } from 'src/app/services/catalogue.service';
import { EstadoAlarma, EstadoAsignacion, PrioridadAlarma } from 'src/app/models/catalogue.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  @ViewChild("map") mapElement!: ElementRef;

  currentUser!: Operator | null;
  alarms: Alarm[] = [];
  selectedAlarm: Alarm | null = null;
  drawerOpen = false;
  isLoading = true;
  currentPage = 0;
  currentPageSize = 20;
  totalPages = 0;
  socketConnected = false;
  mapReady = false;
  filterVisible = false;
  map: google.maps.Map | null = null;
  private alertMarkers: google.maps.Marker[] = [];
  private subscriptions = new Subscription();
  private pageSize = 20;

  alertTypeIcons = ALERT_TYPE_ICONS;
  alertTypeColors = ALERT_TYPE_COLORS;
  priorityColors = ALERT_PRIORITY_CLASSES;
  priorityLabels = ALERT_PRIORITY_LABELS;

  priorityList: PrioridadAlarma[] = [];
  assignmentStatusList: EstadoAsignacion[] = [];
  alarmStatusList: EstadoAlarma[] = [];

  alarmFilterQuery: AlarmFilterQuery = {};

  private zoomLevels = {
    MIN_VALUE: 11,
    MAX_VALUE: 19,
    INITIAL: 13,
    STEP: 1,
  };

  private readonly DEFAULT_MAP_CONFIG = {
    center: { lat: -31.38755, lng: -64.1799254 },
    zoom: this.zoomLevels.INITIAL,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#8ec3b9" }],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#1a3646" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#304a7d" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0e1626" }],
      },
    ],
  };

  constructor(
    private alarmService: AlarmService,
    private authService: AuthService,
    private socketService: SocketService,
    private googleMapsService: GoogleMapsService,
    private catalogueService: CatalogueService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.catalogueService.initializeCatalogs();

    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }
    this.resetAlarmFilterQuery();
    this.loadAlarms();
    //this.setupSocketListeners();
    this.loadCatalogs();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearMarkers();
  }

  resetAlarmFilterQuery(): void {
    this.alarmFilterQuery = {
      operadorId: this.currentUser?.esAdministrador
        ? undefined
        : (this.currentUser?.id ?? undefined),
      estadoId: 1,
    };
  }

  loadAlarms(): void {
    this.isLoading = true;

    let alertsObservable = this.alarmService.getAlarms(
      this.currentPage,
      this.pageSize,
      this.alarmFilterQuery,
    );

    alertsObservable.subscribe({
      next: (response: PaginatedAlarms) => {
        console.log("Alarms loaded:", response);
        this.alarms = response.content;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.isLoading = false;
        this.renderAlertMarkers();
      },
      error: (error) => {
        console.error("Error loading alerts:", error);
        this.alarms = [];

        this.isLoading = false;
      },
    });
  }

  private loadCatalogs(): void {
    this.catalogueService.prioridades$.subscribe((prioridades) => {
      if (prioridades) {
        this.priorityList = prioridades;
      }
    });

    this.catalogueService.estadosAsignacion$.subscribe((estadosAsignacion) => {
      if (estadosAsignacion) {
        this.assignmentStatusList = estadosAsignacion;
      }
    });

    this.catalogueService.estadosAlarma$.subscribe((estadosAlarma) => {
      if (estadosAlarma) {
        this.alarmStatusList = estadosAlarma;
      }
    });
  }

  private setupSocketListeners(): void {
    // Connect socket
    const token = this.authService.getToken();
    if (token) {
      this.socketService.connect(token);
    }

    // Listen for new alerts
    this.subscriptions.add(
      this.socketService.alertCreated$.subscribe((alarm) => {
        if (alarm) {
          this.alarmService.addOrUpdateAlarm(alarm);
          this.alarms = [alarm, ...this.alarms].slice(0, this.pageSize);
          this.renderAlertMarkers();
        }
      }),
    );

    // Listen for alert updates
    this.subscriptions.add(
      this.socketService.alertUpdated$.subscribe((alarm) => {
        if (alarm) {
          this.alarmService.addOrUpdateAlarm(alarm);
          const index = this.alarms.findIndex(
            (a) => a.alarmaId === alarm.alarmaId,
          );
          if (index >= 0) {
            this.alarms[index] = alarm;
            this.alarms = [...this.alarms];
            this.renderAlertMarkers();
          }
        }
      }),
    );

    // Listen for location updates
    this.subscriptions.add(
      this.socketService.locationUpdated$.subscribe((data) => {
        if (data && this.selectedAlarm?.alarmaId === data.alarmaId) {
          if (!this.selectedAlarm.ubicacionesAnteriores) {
            this.selectedAlarm.ubicacionesAnteriores = [];
          }
          if (this.selectedAlarm.ultimaUbicacion) {
            this.selectedAlarm.ubicacionesAnteriores.push(
              this.selectedAlarm.ultimaUbicacion,
            );
          }
          this.selectedAlarm.ultimaUbicacion = data.location;
          this.updateMapRoute();
          this.renderAlertMarkers(false);
        }
      }),
    );

    // Listen for connection status
    this.subscriptions.add(
      this.socketService.isConnected$.subscribe((connected) => {
        this.socketConnected = connected;
      }),
    );
  }

  private async initializeMap(): Promise<void> {
    if (this.mapReady || !this.mapElement?.nativeElement) {
      return;
    }

    try {
      this.map = await this.googleMapsService.createMap(
        this.mapElement.nativeElement,
        this.DEFAULT_MAP_CONFIG,
      );
      this.mapReady = true;
      this.renderAlertMarkers();
    } catch (error) {
      console.error("No se pudo inicializar Google Maps:", error);
    }
  }

  private updateMapRoute(): void {
    if (this.selectedAlarm?.ultimaUbicacion && this.map) {
      this.map.panTo({
        lat: this.selectedAlarm.ultimaUbicacion.latitud,
        lng: this.selectedAlarm.ultimaUbicacion.longitud,
      });
    }
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  selectAlert(alarm: Alarm): void {
    this.selectedAlarm = alarm;
    this.alarmService.setSelectedAlarm(alarm);
    if (this.map) {
      this.map.panTo({
        lat: alarm?.ultimaUbicacion?.latitud ?? 0,
        lng: alarm?.ultimaUbicacion?.longitud ?? 0,
      });
      this.map.setZoom(15);
    }
  }

  viewAlertDetail(alarm: Alarm, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alarm);
    this.router.navigate(["/alert-detail", alarm.alarmaId], {
      state: { mode: "view" },
    });
  }

  editAlert(alarm: Alarm, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alarm);
    this.router.navigate(["/alert-detail", alarm.alarmaId], {
      state: { mode: "edit" },
    });
  }

  verifyAlert(alarm: Alarm, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alarm);
    this.router.navigate(["/alert-detail", alarm.alarmaId], {
      state: { mode: "verify" },
    });
  }

  notifyAuthorities(alarm: Alarm, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alarm);
    this.router.navigate(["/alert-detail", alarm.alarmaId], {
      state: { mode: "notify" },
    });
  }

  getBorderClass(type: string): string {
    return getAlertTypeBorderClass(type);
  }

  trackByAlertId(_: number, alarm: Alarm): string {
    return alarm.alarmaId;
  }

  private renderAlertMarkers(fitBounds: boolean = true): void {
    if (!this.mapReady || !this.map) {
      return;
    }

    this.clearMarkers();

    if (this.alarms.length === 0) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    this.alertMarkers = this.alarms.map((alarm) => {
      const marker = new google.maps.Marker({
        position: {
          lat: alarm.ultimaUbicacion?.latitud ?? 0,
          lng: alarm.ultimaUbicacion?.longitud ?? 0,
        },
        map: this.map,
        title: `${alarm.usuario.apellido}, ${alarm.usuario.nombre}`, // - ${alarm.titulo}
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: this.getMarkerColor(alarm.prioridad?.id ?? 0),
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 1.5,
          scale: 8,
        },
      });

      marker.addListener("click", () => this.selectAlert(alarm));
      bounds.extend(marker.getPosition() as google.maps.LatLng);
      return marker;
    });

    if (fitBounds && !bounds.isEmpty()) {
      this.map.fitBounds(bounds, 50);
    }
  }

  private clearMarkers(): void {
    this.alertMarkers.forEach((marker) => marker.setMap(null));
    this.alertMarkers = [];
  }

  private getMarkerColor(priority: number): string {
    switch (priority) {
      case 3:
        return "#ef4444";
      case 2:
        return "#f97316";
      case 1:
        return "#eab308";
      case 0:
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAlarms();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAlarms();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadAlarms();
  }

  canRegisterUsers(): boolean {
    return this.authService.isAdmin();
  }

  goToRegister(): void {
    if (this.canRegisterUsers()) {
      this.router.navigate(["/register"]);
    }
  }

  logout(): void {
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  getAlarmCount(): number {
    return this.alarms.length;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  //Filter Methods
  resetFilters(): void {
    this.resetAlarmFilterQuery();
    this.loadAlarms();
  }

  toggleFilter(): void {
    this.filterVisible = !this.filterVisible;
  }

  applyFilters(): void {
    this.loadAlarms();
    this.filterVisible = false;
  }

  //Map functions
  zoomIn(): void {
    this.applyZoomLevel(true);
  }

  zoomOut(): void {
    this.applyZoomLevel(false);
  }

  private applyZoomLevel(plus: boolean = true): void {
    if (!this.map) return;
    let newZoom =
      (this.map.getZoom() ?? this.zoomLevels.INITIAL) +
      (plus ? this.zoomLevels.STEP : -this.zoomLevels.STEP);
    newZoom = this.clamp(
      newZoom,
      this.zoomLevels.MIN_VALUE,
      this.zoomLevels.MAX_VALUE,
    );
    this.map.setZoom(newZoom);
  }

  private clamp(val: number, min: number, minMax: number): number {
    return Math.min(Math.max(val, min), minMax);
  }
}
