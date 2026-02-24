import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../../../../services/geolocation.service';
import { AlarmService } from '../../../../services/alarm.service';
import { NotificationService } from '../../../../services/notification.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationData } from '../../../../models/alarm.models';

@Component({
  selector: 'app-device-lock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-lock.component.html',
  styleUrls: ['./device-lock.component.css']
})
export class DeviceLockComponent implements OnInit, OnDestroy {
  // ─── Lock screen state ─────────────
  elapsedMinutes = 0;
  elapsedSeconds = 0;
  currentLocation: LocationData | null = null;
  currentTime = '';
  currentDate = '';
  address = 'Obteniendo ubicación...';
  city = '';
  mapUrl: SafeResourceUrl | null = null;

  // ─── Embedded credentials ──────────
  showCredentials = false;
  cancelMethod: 'password' | 'pin' = 'password';
  password = '';
  pin = '';
  showPassword = false;
  loadingAuth = false;
  authError = '';
  attempts = 0;
  maxAttempts = 3;

  private destroy$ = new Subject<void>();
  private lockStartTime: number = 0;

  constructor(
    private geolocationService: GeolocationService,
    private alarmService: AlarmService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.lockStartTime = Date.now();
    this.updateClock();
    this.updateElapsedTime();
    this.getLocation();
    this.preventNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Clock & elapsed ───────────────

  private updateClock(): void {
    const update = () => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      this.currentDate = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
    };
    update();
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(update);
  }

  private updateElapsedTime(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const total = Math.floor((Date.now() - this.lockStartTime) / 1000);
      this.elapsedMinutes = Math.floor(total / 60);
      this.elapsedSeconds = total % 60;
    });
  }

  // ─── Location ──────────────────────

  private async getLocation(): Promise<void> {
    try {
      const loc = await this.geolocationService.getCurrentLocation();
      if (loc) {
        this.currentLocation = loc;
        const mapsEmbedUrl = `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=16&output=embed`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapsEmbedUrl);
        this.reverseGeocode(loc.latitude, loc.longitude);
      }
    } catch {
      this.address = 'GPS no disponible';
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const result: any = await this.http.get(url, {
        headers: { 'Accept-Language': 'es' }
      }).toPromise();

      if (result && result.address) {
        const addr = result.address;
        const road = addr.road || addr.pedestrian || addr.footway || '';
        const number = addr.house_number || '';
        this.address = number ? `${road} ${number}` : road || result.display_name?.split(',')[0] || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const cityName = addr.city || addr.town || addr.village || addr.municipality || '';
        const state = addr.state || '';
        const country = addr.country || '';
        this.city = [cityName, state, country].filter(Boolean).join(', ');
      } else {
        this.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        this.city = 'Ubicación obtenida';
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      this.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      this.city = 'Ubicación obtenida';
    }
  }

  private preventNavigation(): void {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);
  }

  // ─── Deactivation (embedded credentials) ─────

  openDeactivation(): void {
    this.showCredentials = true;
    this.authError = '';
    this.password = '';
    this.pin = '';
  }

  closeDeactivation(): void {
    this.showCredentials = false;
    this.authError = '';
    this.password = '';
    this.pin = '';
  }

  async deactivateWithPassword(): Promise<void> {
    if (!this.password.trim()) {
      this.authError = 'Ingresa tu contraseña';
      return;
    }
    this.loadingAuth = true;
    this.authError = '';
    try {
      const result = await this.alarmService.finalizeAlarm('PASSWORD', this.password);
      if (result) {
        this.router.navigate(['/main']);
      } else {
        this.handleFailedAttempt('Contraseña incorrecta');
      }
    } catch {
      this.handleFailedAttempt('Error al verificar credenciales');
    } finally {
      this.loadingAuth = false;
    }
  }

  async deactivateWithPin(): Promise<void> {
    if (!this.pin.trim() || this.pin.length !== 4) {
      this.authError = 'PIN debe ser de 4 dígitos';
      return;
    }
    this.loadingAuth = true;
    this.authError = '';
    try {
      const result = await this.alarmService.finalizeAlarm('PIN', this.pin);
      if (result) {
        this.router.navigate(['/main']);
      } else {
        this.handleFailedAttempt('PIN incorrecto');
      }
    } catch {
      this.handleFailedAttempt('Error al verificar credenciales');
    } finally {
      this.loadingAuth = false;
    }
  }

  private handleFailedAttempt(message: string): void {
    this.attempts++;
    this.authError = message;
    this.password = '';
    this.pin = '';
    if (this.attempts >= this.maxAttempts) {
      this.notificationService.showError('Demasiados intentos fallidos.');
      this.showCredentials = false;
      setTimeout(() => { this.attempts = 0; }, 30000);
    }
  }

  addPinDigit(digit: string): void {
    if (this.pin.length < 4) {
      this.pin += digit;
      if (this.pin.length === 4) {
        setTimeout(() => this.deactivateWithPin(), 200);
      }
    }
  }

  removePinDigit(): void {
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
    }
  }

  switchMethod(): void {
    this.cancelMethod = this.cancelMethod === 'password' ? 'pin' : 'password';
    this.authError = '';
    this.password = '';
    this.pin = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getRemainingAttempts(): number {
    return this.maxAttempts - this.attempts;
  }

  get formattedMinutes(): string {
    return this.elapsedMinutes.toString().padStart(2, '0');
  }

  get formattedSeconds(): string {
    return this.elapsedSeconds.toString().padStart(2, '0');
  }
}
