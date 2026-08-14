import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmService } from '../../services/alarm.service';
import { Alarm, Location } from '../../models/alarm.models';
import { ALERT_PRIORITY_LABELS, ALERT_STATUS_LABELS } from '../../shared/alert-ui.config';
import { GoogleMapsService } from '../../services/google-maps.service';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-alert-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./alert-detail.component.html",
  styleUrls: ["./alert-detail.component.css"],
})
export class AlertDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("map") mapElement!: ElementRef;

  alarm: Alarm | null = null;
  mode: "view" | "edit" | "verify" | "notify" = "view";
  isLoading = true;
  mapReady = false;
  map: google.maps.Map | null = null;
  private routePolyline: google.maps.Polyline | null = null;
  private routeMarkers: google.maps.Marker[] = [];
  private subscriptions = new Subscription();
  readonly statusLabels = ALERT_STATUS_LABELS;
  readonly priorityLabels = ALERT_PRIORITY_LABELS;

  // Field disable states based on mode
  fieldsDisabled = {
    status: false,
    priority: false,
    notes: false,
  };

  constructor(
    private alarmService: AlarmService,
    private googleMapsService: GoogleMapsService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const alertId = this.route.snapshot.paramMap.get("id");
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.mode = state?.["mode"] || "view";

    if (alertId) {
      this.loadAlert(alertId);
    }

    this.setFieldsDisabledState();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearRouteOverlays();
  }

  private setFieldsDisabledState(): void {
    switch (this.mode) {
      case "view":
        this.fieldsDisabled = { status: true, priority: true, notes: true };
        break;
      case "verify":
        this.fieldsDisabled = { status: false, priority: true, notes: true };
        break;
      case "notify":
        this.fieldsDisabled = { status: true, priority: true, notes: false };
        break;
      case "edit":
        this.fieldsDisabled = { status: false, priority: false, notes: false };
        break;
    }
  }

  private loadAlert(id: string): void {
    this.subscriptions.add(
      this.alarmService.getAlarmById(id).subscribe({
        next: (alarm) => {
          this.alarm = alarm;
          this.isLoading = false;
          this.cdr.detectChanges();
          this.initializeMap();
        },
        error: (error) => {
          console.error("Error loading alert:", error);
          this.isLoading = false;
        },
      }),
    );
  }

  private async initializeMap(): Promise<void> {
    if (!this.alarm || !this.mapElement?.nativeElement) {
      return;
    }

    if (!this.mapReady) {
      try {
        this.map = await this.googleMapsService.createMap(
          this.mapElement.nativeElement,
          {
            center: {
              lat: this.alarm.ultimaUbicacion?.latitud || 0,
              lng: this.alarm.ultimaUbicacion?.longitud || 0,
            },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          },
        );
        this.mapReady = true;
      } catch (error) {
        console.error("No se pudo inicializar Google Maps:", error);
        return;
      }
    }

    this.drawRoute();
  }

  private drawRoute(): void {
    if (!this.map || !this.alarm) {
      return;
    }

    this.clearRouteOverlays();

    const sortedHistory = [...(this.alarm.ubicacionesAnteriores || [])].sort(
      (a, b) =>
        new Date(a.fechaToma).getTime() - new Date(b.fechaToma).getTime(),
    );

    if (sortedHistory.length === 0) {
      const marker = new google.maps.Marker({
        map: this.map,
        position: {
          lat: this.alarm.ultimaUbicacion?.latitud || 0,
          lng: this.alarm.ultimaUbicacion?.longitud || 0,
        },
        title: `Alerta ${this.alarm.estadoAlarma.descripcion}`,
      });
      this.routeMarkers.push(marker);
      return;
    }

    const routePath = sortedHistory.map((loc) => ({
      lat: loc.latitud,
      lng: loc.longitud,
    }));
    const bounds = new google.maps.LatLngBounds();
    routePath.forEach((point) => bounds.extend(point));

    this.routePolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map: this.map,
    });

    const start = routePath[0];
    const end = routePath[routePath.length - 1];

    const startMarker = new google.maps.Marker({
      map: this.map,
      position: start,
      title: "Inicio de la alerta",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#22c55e",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 1.5,
        scale: 7,
      },
    });

    const endMarker = new google.maps.Marker({
      map: this.map,
      position: end,
      title:
        this.alarm.estadoAlarma.id !== 1
          ? this.alarm.estadoAlarma.descripcion
          : "Última ubicación",
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: this.alarm.estadoAlarma.id === 1 ? "#ef4444" : "#f59e0b",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 1,
        scale: 6,
      },
    });

    this.routeMarkers.push(startMarker, endMarker);
    this.map.fitBounds(bounds, 50);
  }

  private clearRouteOverlays(): void {
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
      this.routePolyline = null;
    }

    this.routeMarkers.forEach((marker) => marker.setMap(null));
    this.routeMarkers = [];
  }

  getStatusColor(): string {
    if (!this.alarm) return "";
    switch (this.alarm.estadoAlarma.descripcion.toLowerCase()) {
      case "active":
        return "🔴 Activo";
      case "review":
        return "🟡 En Revisión";
      case "dispatched":
        return "🔵 Despachado";
      case "resolved":
        return "🟢 Resuelto";
      default:
        return "";
    }
  }

  getPriorityColor(): string {
    if (!this.alarm) return "";
    switch (this.alarm.prioridad.id) {
      case 3:
        return `🔴 ${this.alarm.prioridad.descripcion}`;
      case 2:
        return `🟠 ${this.alarm.prioridad.descripcion}`;
      case 1:
        return `🟡 ${this.alarm.prioridad.descripcion}`;
      case 0:
        return `🟢 ${this.alarm.prioridad.descripcion}`;
      default:
        return "";
    }
  }

  updateAlertStatus(status: number): void {
    if (!this.alarm || this.fieldsDisabled.status) return;

    this.alarmService.updateAlarmStatus(this.alarm.alarmaId, status).subscribe({
      next: (updated) => {
        this.alarm = updated;
      },
      error: (error) => {
        console.error("Error updating status:", error);
      },
    });
  }

  updateAlertPriority(priority: number): void {
    if (!this.alarm) return;

    this.alarmService
      .updateAlarmPriority(this.alarm.alarmaId, priority)
      .subscribe({
        next: (updated) => {
          this.alarm = updated;
        },
        error: (error) => {
          console.error("Error updating alarm:", error);
        },
      });
  }

  goBack(): void {
    this.router.navigate(["/dashboard"]);
  }

  getModeTitle(): string {
    switch (this.mode) {
      case "view":
        return "Ver Detalle";
      case "edit":
        return "Editar Alarma";
      case "verify":
        return "Verificar Alarma";
      case "notify":
        return "Notificar Autoridades";
      default:
        return "Detalle de Alarma";
    }
  }

  getLocationHistory(): Location[] {
    const locations = this.alarm?.ubicacionesAnteriores || [];
    if (!!this.alarm?.ultimaUbicacion) {
      locations.push(this.alarm.ultimaUbicacion);
    }
    return locations;
  }

  hasEvidence(): boolean {
    return (this.alarm?.evidencias?.length || 0) > 0;
  }

  getNearbyAuthorities() {
    return this.alarm?.autoridades || [];
  }

  getStatusLabel(status: number): string {
    return this.statusLabels[status];
  }

  getPriorityLabel(priority: number): string {
    return this.priorityLabels[priority];
  }
}
