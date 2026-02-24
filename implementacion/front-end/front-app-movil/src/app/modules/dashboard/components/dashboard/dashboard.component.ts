import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { AlarmService } from '../../../../services/alarm.service';
import { GeolocationService } from '../../../../services/geolocation.service';
import { NotificationService } from '../../../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationData } from '../../../../models/alarm.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  alarmActive = false;
  deviceStatus = {
    battery: 85,
    signal: 3,
    gps: true,
    network: true
  };
  lastLocation: any;
  menuOpen = false;
  loadingAlarm = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private alarmService: AlarmService,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.checkAlarmStatus();
    this.updateDeviceStatus();
    this.setupLocationTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  private checkAlarmStatus(): void {
    // V1.0: Check if alarm is currently active
    // This would typically come from the backend or local state
    this.alarmActive = this.alarmService.isAlarmActive();
  }

  private setupLocationTracking(): void {
    // Subscribe to location updates
    this.geolocationService.getLocationUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (location: LocationData) => {
          this.lastLocation = location;
        },
        error: (error: unknown) => {
          console.warn('GPS tracking error:', error);
        }
      });
  }

  private updateDeviceStatus(): void {
    // V1.0: Simulate device status updates
    // In production, this would query actual device status
    setInterval(() => {
      this.deviceStatus.battery = Math.max(0, this.deviceStatus.battery - Math.random() * 2);
    }, 30000);
  }

  async activateAlarm(): Promise<void> {
    if (this.loadingAlarm) return;

    this.loadingAlarm = true;

    try {
      // Get current location
      const location = await this.geolocationService.getCurrentLocation();

      // Trigger alarm countdown (3 seconds)
      this.alarmService.triggerAlarmCountdown();
      this.notificationService.showSuccess('Alarma activada. Presiona cancelar para detenerla.');

      // Navigate to cancellation screen (countdown + credentials)
      setTimeout(() => {
        this.router.navigate(['/alarm/cancel']);
      }, 500);
    } catch (error: any) {
      this.notificationService.showError('Error al activar la alarma: ' + error.message);
    } finally {
      this.loadingAlarm = false;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  goToSettings(): void {
    this.menuOpen = false;
    this.router.navigate(['/settings']);
  }

  goToContacts(): void {
    this.menuOpen = false;
    this.router.navigate(['/settings/contacts']);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.notificationService.showError('Error al cerrar sesión');
    }
  }

  getSignalBars(): number[] {
    return Array(this.deviceStatus.signal).fill(0);
  }

  getSignalEmptyBars(): number[] {
    return Array(4 - this.deviceStatus.signal).fill(0);
  }

  getUserGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getLocationDisplay(): string {
    if (!this.lastLocation) {
      return 'GPS desactivado';
    }
    return `${this.lastLocation.latitude.toFixed(4)}, ${this.lastLocation.longitude.toFixed(4)}`;
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'text-green-400' : 'text-red-400';
  }
}
