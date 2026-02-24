import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlarmService } from '../../../../services/alarm.service';
import { NotificationService } from '../../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alarm-cancellation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alarm-cancellation.component.html',
  styleUrl: './alarm-cancellation.component.css'
})
export class AlarmCancellationComponent implements OnInit, OnDestroy {
  // ─── Credential fields ─────────────
  cancelMethod: 'password' | 'pin' = 'password';
  password = '';
  pin = '';
  loading = false;
  error = '';
  attempts = 0;
  maxAttempts = 3;
  showPassword = false;

  // ─── View state ────────────────────
  /** Show credentials panel (true) or circle countdown (false) */
  showCredentials = false;

  /** Edge-case: alarm already sent (navigated here from external deep link) */
  isDeactivation = false;

  // ─── Countdown circle ──────────────
  totalSeconds = 15;
  countdownRemaining = 15;
  circumference = 2 * Math.PI * 45; // ≈283

  private countdownSub?: Subscription;

  constructor(
    private alarmService: AlarmService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDeactivation = this.alarmService.isAlarmActive();

    // Subscribe to the service-level pre-alarm countdown
    this.countdownSub = this.alarmService.preAlarmCountdown$.subscribe((remaining) => {
      this.countdownRemaining = remaining;
      if (remaining <= 0 && !this.isDeactivation) {
        this.alarmService.confirmAlarm();
        this.router.navigate(['/alarm/lock']);
      }
    });
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
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
    if (this.showCredentials && !this.isDeactivation) {
      this.showCredentials = false;
      this.error = '';
      this.password = '';
      this.pin = '';
    } else if (this.isDeactivation) {
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
    this.loading = true;
    this.error = '';
    try {
      if (this.isDeactivation) {
        const result = await this.alarmService.finalizeAlarm('PASSWORD', this.password);
        if (result) {
          this.router.navigate(['/main']);
        } else {
          this.handleFailedAttempt('Contraseña incorrecta');
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

  async cancelWithPin(): Promise<void> {
    if (!this.pin.trim() || this.pin.length !== 4) {
      this.error = 'PIN debe ser de 4 dígitos';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      if (this.isDeactivation) {
        const result = await this.alarmService.finalizeAlarm('PIN', this.pin);
        if (result) {
          this.router.navigate(['/main']);
        } else {
          this.handleFailedAttempt('PIN incorrecto');
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
      this.notificationService.showError('Demasiados intentos. Alarma bloqueada.');
      if (!this.isDeactivation) {
        this.alarmService.confirmAlarm();
      }
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
}
