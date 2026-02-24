import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Alert, PaginatedAlerts } from '../../models/alert.models';
import { User } from '../../models/auth.models';
import { Subscription } from 'rxjs';
import {
  ALERT_PRIORITY_CLASSES,
  ALERT_PRIORITY_LABELS,
  ALERT_TYPE_COLORS,
  ALERT_TYPE_ICONS,
  getAlertTypeBorderClass
} from '../../shared/alert-ui.config';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('map') mapElement!: ElementRef;

  currentUser!: User | null;
  alerts: Alert[] = [];
  selectedAlert: Alert | null = null;
  drawerOpen = false;
  isLoading = true;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  socketConnected = false;
  mapReady = false;
  map: google.maps.Map | null = null;
  private alertMarkers: google.maps.Marker[] = [];
  private subscriptions = new Subscription();

  alertTypeIcons = ALERT_TYPE_ICONS;
  alertTypeColors = ALERT_TYPE_COLORS;
  priorityColors = ALERT_PRIORITY_CLASSES;
  priorityLabels = ALERT_PRIORITY_LABELS;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private socketService: SocketService,
    private googleMapsService: GoogleMapsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAlerts();
    this.setupSocketListeners();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearMarkers();
  }

  private loadAlerts(): void {
    this.isLoading = true;
    let alertsObservable = this.alertService.getAlerts(this.currentPage, this.pageSize);

    // If not admin, only get assigned alerts
    if (this.currentUser?.role === 'operator') {
      alertsObservable = this.alertService.getAlertsByOperator(
        this.currentUser.id,
        this.currentPage,
        this.pageSize
      );
    }

    alertsObservable.subscribe({
      next: (response: PaginatedAlerts) => {
        this.alerts = response.alerts;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.renderAlertMarkers();
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        this.isLoading = false;
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
    this.subscriptions.add(this.socketService.alertCreated$.subscribe(alert => {
      if (alert) {
        this.alertService.addOrUpdateAlert(alert);
        this.alerts = [alert, ...this.alerts].slice(0, this.pageSize);
        this.renderAlertMarkers();
      }
    }));

    // Listen for alert updates
    this.subscriptions.add(this.socketService.alertUpdated$.subscribe(alert => {
      if (alert) {
        this.alertService.addOrUpdateAlert(alert);
        const index = this.alerts.findIndex(a => a.id === alert.id);
        if (index >= 0) {
          this.alerts[index] = alert;
          this.alerts = [...this.alerts];
          this.renderAlertMarkers();
        }
      }
    }));

    // Listen for location updates
    this.subscriptions.add(this.socketService.locationUpdated$.subscribe(data => {
      if (data && this.selectedAlert?.id === data.alertId) {
        if (!this.selectedAlert.locationHistory) {
          this.selectedAlert.locationHistory = [];
        }
        this.selectedAlert.locationHistory.push(data.location);
        this.updateMapRoute();
        this.renderAlertMarkers(false);
      }
    }));

    // Listen for connection status
    this.subscriptions.add(this.socketService.isConnected$.subscribe(connected => {
      this.socketConnected = connected;
    }));
  }

  private async initializeMap(): Promise<void> {
    if (this.mapReady || !this.mapElement?.nativeElement) {
      return;
    }

    try {
      this.map = await this.googleMapsService.createMap(this.mapElement.nativeElement, {
        center: { lat: -31.38755, lng: -64.1799254 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
        ]
      });
      this.mapReady = true;
      this.renderAlertMarkers();
    } catch (error) {
      console.error('No se pudo inicializar Google Maps:', error);
    }
  }

  private updateMapRoute(): void {
    if (this.selectedAlert?.location && this.map) {
      this.map.panTo({
        lat: this.selectedAlert.location.latitude,
        lng: this.selectedAlert.location.longitude
      });
    }
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  selectAlert(alert: Alert): void {
    this.selectedAlert = alert;
    this.alertService.setSelectedAlert(alert);
    if (this.map) {
      this.map.panTo({ lat: alert.location.latitude, lng: alert.location.longitude });
      this.map.setZoom(15);
    }
  }

  viewAlertDetail(alert: Alert, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'view' } });
  }

  editAlert(alert: Alert, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'edit' } });
  }

  verifyAlert(alert: Alert, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'verify' } });
  }

  notifyAuthorities(alert: Alert, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'notify' } });
  }

  getBorderClass(type: Alert['type']): string {
    return getAlertTypeBorderClass(type);
  }

  trackByAlertId(_: number, alert: Alert): string {
    return alert.id;
  }

  private renderAlertMarkers(fitBounds: boolean = true): void {
    if (!this.mapReady || !this.map) {
      return;
    }

    this.clearMarkers();

    if (this.alerts.length === 0) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    this.alertMarkers = this.alerts.map((alert) => {
      const marker = new google.maps.Marker({
        position: { lat: alert.location.latitude, lng: alert.location.longitude },
        map: this.map,
        title: `${alert.userName} - ${alert.title}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: this.getMarkerColor(alert.priority),
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1.5,
          scale: 8
        }
      });

      marker.addListener('click', () => this.selectAlert(alert));
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

  private getMarkerColor(priority: Alert['priority']): string {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAlerts();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAlerts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadAlerts();
  }

  canRegisterUsers(): boolean {
    return this.authService.isAdmin();
  }

  goToRegister(): void {
    if (this.canRegisterUsers()) {
      this.router.navigate(['/register']);
    }
  }

  logout(): void {
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getAlertCount(): number {
    return this.alerts.filter(a => a.status === 'active').length;
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
}
