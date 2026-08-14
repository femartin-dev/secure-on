import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../../../../services/geolocation.service';
import { AlarmService } from '../../../../services/alarm.service';
import { NotificationService } from '../../../../services/notification-toast.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationData } from '../../../../models/evidence.models';
import { SecuritySettings } from '@app/models/config.models';
import { AttempsCheckComponent } from '@app/modules/common/components/attemps-check/attemps-check.component';
import { PinCheckComponent, PinCheckOutput } from '@app/modules/common/components/pin-check/pin-check.component';
import { PasswordCheckComponent } from '@app/modules/common/components/password-check/password-check.component';
import { PatternTouchComponent } from '@app/modules/common/components/pattern-touch/pattern-touch.component';
import { ConfigService } from '@app/services/config.service';
import { ValidationService } from '@app/services/validation.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-device-lock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AttempsCheckComponent,
    PinCheckComponent,
    PasswordCheckComponent,
    PatternTouchComponent,
  ],
  templateUrl: './device-lock.component.html',
  styleUrls: ['./device-lock.component.css'],
})
export class DeviceLockComponent implements OnInit, OnDestroy {
  // ─── Component Binding ─────────────
  @ViewChild(PatternTouchComponent) patternTouch?: PatternTouchComponent;
  @ViewChild(PinCheckComponent) pinCheckComponent?: PinCheckComponent;
  @ViewChild(PasswordCheckComponent) passwordCheckComponent?: PasswordCheckComponent;

  // ─── Lock screen state ─────────────
  elapsedHours = 0;
  elapsedMinutes = 0;
  elapsedSeconds = 0;
  currentLocation: LocationData | null = null;
  currentTime = '';
  currentDate = '';
  address = 'Obteniendo ubicación...';
  city = '';
  mapUrl: SafeResourceUrl | null = null;
  mapLoadState: 'loading' | 'ready' | 'error' = 'loading';

  // ─── Embedded credentials ──────────
  showCredentials = false;
  cancelMethodSelected: string = '';
  cancelMethod: string[] = []; //'password' | 'pin' = 'password';
  password = '';
  pin = '';
  pinLength = 4;
  pattern: number[] = [];
  showPassword = false;
  loading = false;
  error = '';
  attempts = 0;
  maxAttempts = 3;
  timeBetweenFailedAttemptsMin = 3;

  private destroy$ = new Subject<void>();
  private lockStartTime: number = 0;

  constructor(
    private geolocationService: GeolocationService,
    private alarmService: AlarmService,
    private notificationService: NotificationService,
    private configService: ConfigService,
    private validationService: ValidationService,
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
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Clock & elapsed ───────────────

  private updateClock(): void {
    const update = () => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ];
      this.currentDate = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
    };
    update();
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(update);
  }

  private updateElapsedTime(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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
        const mapsEmbedUrl = this.buildMapEmbedUrl(loc.latitude, loc.longitude);
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapsEmbedUrl);
        this.mapLoadState = 'ready';
        this.reverseGeocode(loc.latitude, loc.longitude);
      } else {
        this.mapLoadState = 'error';
        this.address = 'GPS no disponible';
        this.city = 'Activa permisos de ubicación';
      }
    } catch {
      this.address = 'GPS no disponible';
      this.city = 'Activa permisos de ubicación';
      this.mapLoadState = 'error';
    }
  }

  private buildMapEmbedUrl(lat: number, lng: number): string {
    if (Capacitor.isNativePlatform()) {
      // OSM embed is generally more reliable than Google iframe inside mobile WebViews.
      const delta = 0.003;
      const left = lng - delta;
      const right = lng + delta;
      const top = lat + delta;
      const bottom = lat - delta;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
    }

    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const result: any = await this.http
        .get(url, {
          headers: { 'Accept-Language': 'es' },
        })
        .toPromise();

      if (result && result.address) {
        const addr = result.address;
        const road = addr.road || addr.pedestrian || addr.footway || '';
        const number = addr.house_number || '';
        this.address = number
          ? `${road} ${number}`
          : road || result.display_name?.split(',')[0] || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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

  private loadConfig(): void {
    const config = this.configService.getCurrentConfig();
    if (config?.security) {
      this.maxAttempts = config.security.nroIntentosFallidos;
      this.setCancelMethods(config.security);
    }
  }

  private setCancelMethods(secConfig: SecuritySettings): void {
    if (secConfig.passDesbloqueoActivo) {
      this.cancelMethod.push('password');
    }
    if (secConfig.pinDesbloqueoActivo) {
      this.cancelMethod.push('pin');
    }
    if (secConfig.patronDesbloqueoActivo) {
      this.cancelMethod.push('pattern');
    }
    if (this.cancelMethod.length > 0) {
      this.cancelMethodSelected = this.cancelMethod[0];
    }
  }

  openCredentials(): void {
    if (this.getRemainingAttempts() === 0) {
      this.notificationService.showError(
        `Demasiados intentos fallidos. Intenta nuevamente en ${this.timeBetweenFailedAttemptsMin} minutos.`
      );
      return;
    }
    this.showCredentials = true;
    this.error = '';
    this.password = '';
    this.pin = '';
  }

  closeCredentials(): void {
    this.showCredentials = false;
    this.error = '';
    this.password = '';
    this.pin = '';
  }

  async deactivateWithPassword(): Promise<void> {
    if (!this.password.trim()) {
      this.error = 'Ingresa tu contraseña';
      return;
    }
    this.cancelAlarm('PASSWORD');
  }

  async deactivateWithPin(): Promise<void> {
    if (!this.pin.trim() || this.pin.length !== 4) {
      this.error = 'PIN debe ser de 4 dígitos';
      return;
    }
    this.cancelAlarm('PIN');
  }

  async cancelAlarm(tipoCancel: 'PIN' | 'PASSWORD' | 'PATTERN'): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const result = await this.alarmService.finalizeAlarm(tipoCancel, '');
      if (result) {
        this.router.navigate(['/alarm/post-cuestionario']);
      } else {
        this.handleFailedAttempt(
          tipoCancel === 'PIN'
            ? 'PIN incorrecto'
            : tipoCancel === 'PASSWORD'
              ? 'Contraseña incorrecta'
              : tipoCancel === 'PATTERN'
                ? 'Patrón incorrecto'
                : 'Credenciales incorrectas'
        );
      }
    } catch {
      this.handleFailedAttempt('Error al verificar credenciales');
    } finally {
      this.loading = false;
    }
  }

  private handleFailedAttempt(message: string): void {
    this.attempts++;
    this.error = message;
    this.password = '';
    this.pin = '';
    this.pattern = [];
    if (this.attempts >= this.maxAttempts) {
      this.notificationService.showError('Demasiados intentos fallidos.');
      this.showCredentials = false;
      setTimeout(() => {
        this.attempts = 0;
      }, this.timeBetweenFailedAttemptsMin * 60000);
    }
  }

  switchMethods(value: string): void {
    this.cancelMethodSelected = value;
    this.error = '';
    this.password = '';
    this.pin = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getRemainingAttempts(): number {
    return this.maxAttempts - this.attempts;
  }

  get formattedHours(): string {
    return this.elapsedHours.toString().padStart(2, '0');
  }

  get formattedMinutes(): string {
    return this.elapsedMinutes.toString().padStart(2, '0');
  }

  get formattedSeconds(): string {
    return this.elapsedSeconds.toString().padStart(2, '0');
  }

  onPinSubmit(pin: PinCheckOutput): void {
    if (!pin.complete) return;
    //let validationError = this.validationService.validatePinFormat(pin.pin, this.pinLength);
    let validationResult = this.validationService.validatePin(pin.pin);
    if (validationResult) {
      this.cancelAlarm('PIN');
    } else {
      this.handleFailedAttempt('PIN incorrecto');
      setTimeout(() => this.resetOnFail('PIN'), 1000);
    }
  }

  onPasswordSubmit(pass: string): void {
    //validar el password con la función de validación de credenciales
    //const validationErrors = this.validationService.validatePasswordFormat(pass);
    this.password = pass;
    if (this.validationService.validatePassword(pass)) {
      this.cancelAlarm('PASSWORD');
    } else {
      this.handleFailedAttempt('Contraseña incorrecta');
      setTimeout(() => this.resetOnFail('PASSWORD'), 1000);
    }
  }

  onPatternSubmit(pattern: number[]): void {
    this.pattern = pattern;
    if (!!pattern && pattern.length > 0 && this.validationService.validatePattern(pattern)) {
      this.cancelAlarm('PATTERN');
    } else {
      this.handleFailedAttempt('Patrón incorrecto');
      setTimeout(() => this.resetOnFail('PATTERN'), 1000);
    }
  }

  private resetOnFail(tipoCancel: 'PIN' | 'PASSWORD' | 'PATTERN'): void {
    switch (tipoCancel) {
      case 'PIN':
        this.pinCheckComponent?.clearPin();
        break;
      case 'PASSWORD':
        this.passwordCheckComponent?.clearPassword();
        break;
      case 'PATTERN':
        this.patternTouch?.clearPattern();
        break;
      default:
        break;
    }
    this.error = '';
  }
}
