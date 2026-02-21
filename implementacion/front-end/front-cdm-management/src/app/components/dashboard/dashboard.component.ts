import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Alert, PaginatedAlerts } from '../../models/alert.models';
import { User } from '../../models/auth.models';

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
  map: any;

  alertTypeIcons: { [key: string]: string } = {
    'panic': 'warning',
    'intrusion': 'motion_sensor_active',
    'medical': 'medical_services',
    'supervision': 'visibility',
    'system': 'router',
    'device': 'signal_disconnected'
  };

  alertTypeColors: { [key: string]: { bg: string; text: string; border: string } } = {
    'panic': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
    'intrusion': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' },
    'medical': { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400' },
    'supervision': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
    'system': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
    'device': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' }
  };

  priorityColors: { [key: string]: string } = {
    'critical': 'bg-red-500/20 text-red-500 border-red-500/20',
    'high': 'bg-orange-500/20 text-orange-500 border-orange-500/20',
    'medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
    'low': 'bg-green-500/20 text-green-500 border-green-500/20'
  };

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private socketService: SocketService,
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
        this.initializeMap();
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
    this.socketService.alertCreated$.subscribe(alert => {
      if (alert) {
        this.alertService.addOrUpdateAlert(alert);
        this.alerts = [alert, ...this.alerts].slice(0, this.pageSize);
      }
    });

    // Listen for alert updates
    this.socketService.alertUpdated$.subscribe(alert => {
      if (alert) {
        this.alertService.addOrUpdateAlert(alert);
        const index = this.alerts.findIndex(a => a.id === alert.id);
        if (index >= 0) {
          this.alerts[index] = alert;
          this.alerts = [...this.alerts];
        }
      }
    });

    // Listen for location updates
    this.socketService.locationUpdated$.subscribe(data => {
      if (data && this.selectedAlert?.id === data.alertId) {
        if (!this.selectedAlert.locationHistory) {
          this.selectedAlert.locationHistory = [];
        }
        this.selectedAlert.locationHistory.push(data.location);
        this.updateMapRoute();
      }
    });

    // Listen for connection status
    this.socketService.isConnected$.subscribe(connected => {
      this.socketConnected = connected;
    });
  }

  private initializeMap(): void {
    if (this.mapReady) return;
    
    // Map initialization will be handled in the template using Google Maps API
    // We'll pass the alerts data to render markers
    this.mapReady = true;
  }

  private updateMapRoute(): void {
    // This will update the polyline showing the route based on location history
    if (this.selectedAlert?.locationHistory) {
      // Update map with new route
      console.log('Updating map route with:', this.selectedAlert.locationHistory);
    }
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  selectAlert(alert: Alert): void {
    this.selectedAlert = alert;
    this.alertService.setSelectedAlert(alert);
  }

  viewAlertDetail(alert: Alert): void {
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'view' } });
  }

  editAlert(alert: Alert): void {
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'edit' } });
  }

  verifyAlert(alert: Alert): void {
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'verify' } });
  }

  notifyAuthorities(alert: Alert): void {
    this.selectAlert(alert);
    this.router.navigate(['/alert-detail', alert.id], { state: { mode: 'notify' } });
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
