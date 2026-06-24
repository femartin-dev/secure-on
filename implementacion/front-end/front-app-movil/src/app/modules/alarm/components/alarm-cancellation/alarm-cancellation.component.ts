import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlarmService } from '../../../../services/alarm.service';
import { NotificationService } from '../../../../services/notification-toast.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '@app/services/config.service';
import { AttempsCheckComponent } from '../../../common/components/attemps-check/attemps-check.component';
import { PinCheckComponent } from '../../../common/components/pin-check/pin-check.component';
import { PasswordCheckComponent } from '../../../common/components/password-check/password-check.component';
import { ActivationConfigComponent } from "@app/modules/settings/components/activation-config/activation-config.component";

@Component({
  selector: 'app-alarm-cancellation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AttempsCheckComponent,
    PinCheckComponent,
    PasswordCheckComponent,
    ActivationConfigComponent,
  ],
  templateUrl: './alarm-cancellation.component.html',
  styleUrl: './alarm-cancellation.component.css',
})
export class AlarmCancellationComponent implements OnInit, OnDestroy {
  // ─── Credential fields ─────────────
  cancelMethod: 'password' | 'pin' | 'pattern' = 'password';
  password = '';
  pin = '';
  pattern = '';
  loading = false;
  error = '';
  attempts = 0;
  maxAttempts = 3;
  pinLength = 4;
  showPassword = false;

  // ─── View state ────────────────────
  /** Show credentials panel (true) or circle countdown (false) */
  showCredentials = false;

  /** Edge-case: alarm already sent (navigated here from external deep link) */
  isAlarmActive = false;

  // ─── Countdown circle ──────────────
  totalSeconds = 15;
  countdownRemaining = 15;
  circumference = 2 * Math.PI * 45; // ≈283

  private countdownSub?: Subscription;

  constructor(
    private alarmService: AlarmService,
    private notificationService: NotificationService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.isAlarmActive = this.alarmService.isAlarmActive();

    // Subscribe to the service-level pre-alarm countdown
    this.countdownSub = this.alarmService.preAlarmCountdown$.subscribe((remaining) => {
      this.countdownRemaining = remaining;
      if (remaining <= 0 && !this.isAlarmActive) {
        console.log('Alarm-cancellation: Pre-alarm countdown expired, confirming alarm');
        this.alarmService.confirmAlarm();
        this.router.navigate(['/alarm/lock']);
      }
    });
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  private loadConfig(): void {
    const config = this.configService.getCurrentConfig();
    if (config?.activation) {
      this.totalSeconds = config.activation.tiempoCancelacionSeg;
      this.countdownRemaining = config.activation.tiempoCancelacionSeg;
      this.maxAttempts = config.security.nroIntentosFallidos;
    }
  }

  // ─── Circle countdown getters ──────

  get strokeDashoffset(): number {
    const progress = (this.totalSeconds - Math.max(0, this.countdownRemaining)) / this.totalSeconds;
    return this.circumference * (1 - progress);
  }

  get formattedTime(): string {
    const s = Math.max(0, this.countdownRemaining);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  get formattedCountdown(): string {
    return this.formattedTime;
  }

  get countdownProgress(): number {
    return Math.max(0, (this.countdownRemaining / this.totalSeconds) * 100);
  }

  // ─── View navigation ──────────────

  /** Show the credentials panel */
  openCredentials(): void {
    this.showCredentials = true;
  }

  /** Back button logic:
   *  - From credentials → back to circle (pre-alarm)
   *  - From circle → cancel pre-alarm + go home
   *  - Deactivation mode → back to lock screen
   */
  goBack(): void {
    if (this.showCredentials && !this.isAlarmActive) {
      this.showCredentials = false;
      this.error = '';
      this.password = '';
      this.pin = '';
    } else if (this.isAlarmActive) {
      this.router.navigate(['/alarm/lock']);
    } else {
      this.alarmService.cancelPreAlarm();
      this.router.navigate(['/main']);
    }
  }

  // ─── Authentication ───────────────

  async cancelWithPassword(): Promise<void> {
    if (!this.password.trim()) {
      this.error = 'Ingresa tu contraseña';
      return;
    }
    this.cancelAlarm('PASSWORD');
  }

  async cancelWithPin(): Promise<void> {
    if (!this.pin.trim() || this.pin.length !== 4) {
      this.error = 'PIN debe ser de 4 dígitos';
      return;
    }
    this.cancelAlarm('PIN');
  }

  async cancelAlarm(tipoCancel: 'PIN' | 'PASSWORD'): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      if (this.isAlarmActive) {
        const result = await this.alarmService.finalizeAlarm(
          tipoCancel,
          tipoCancel === 'PIN' ? this.pin : this.password
        );
        if (result) {
          this.router.navigate(['/main']);
        } else {
          this.handleFailedAttempt(
            tipoCancel === 'PIN' ? 'PIN incorrecto' : 'Contraseña incorrecta'
          );
        }
      } else {
        this.alarmService.cancelPreAlarm();
        this.router.navigate(['/main']);
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
    if (this.attempts >= this.maxAttempts) {
      this.notificationService.showError('Demasiados intentos.');
      if (!this.isAlarmActive) {
        console.log('Alarm-cancellation: handleFailedAttempt');
        this.alarmService.confirmAlarm();
      }
      //this.router.navigate(['/alarm/lock']);
      setTimeout(() => this.router.navigate(['/alarm/lock']), 1500);
    }
  }

  addPinDigit(digit: string): void {
    if (this.pin.length < 4) {
      this.pin += digit;
      if (this.pin.length === 4) {
        setTimeout(() => this.cancelWithPin(), 200);
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

  onPinSubmit(pin: { pin: number; complete: boolean; valid: boolean }): void {
    if (pin.complete && pin.valid) {
      if (pin.valid) {
        this.cancelAlarm('PIN');
      } else {
        this.handleFailedAttempt('PIN incorrecto');
      }
    }
  }

  onPasswordSubmit(pass: string): void {
    //validar el password con la función de validación de credenciales
    this.password = pass;
    if (pass.trim().length >= 6 && pass.trim().length <= 20) {
      this.cancelAlarm('PASSWORD');
    } else {
      this.handleFailedAttempt('Contraseña incorrecta');
    }
  }
}
