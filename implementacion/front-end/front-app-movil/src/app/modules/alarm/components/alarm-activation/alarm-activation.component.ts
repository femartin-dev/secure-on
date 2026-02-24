import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlarmService } from '../../../../services/alarm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alarm-activation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarm-activation.component.html',
  styleUrls: ['./alarm-activation.component.css']
})
export class AlarmActivationComponent implements OnInit, OnDestroy {
  /** Total seconds for cancellation countdown */
  totalSeconds = 15;
  /** Remaining seconds */
  remainingSeconds = 15;
  /** SVG circle circumference for r=45 */
  circumference = 2 * Math.PI * 45; // ~283
  cancelled = false;

  private countdownSub?: Subscription;

  constructor(
    private alarmService: AlarmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to the service-level pre-alarm countdown
    // so the timer keeps running even if the user navigates to the cancel screen
    this.countdownSub = this.alarmService.preAlarmCountdown$.subscribe((remaining) => {
      this.remainingSeconds = remaining;
      if (remaining <= 0 && !this.cancelled) {
        this.onTimeExpired();
      }
    });
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  /** SVG stroke-dashoffset based on remaining time */
  get strokeDashoffset(): number {
    const progress = (this.totalSeconds - Math.max(0, this.remainingSeconds)) / this.totalSeconds;
    return this.circumference * (1 - progress);
  }

  /** Format mm:ss */
  get formattedTime(): string {
    const seconds = Math.max(0, this.remainingSeconds);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /** User cancels alarm – navigate to credentials screen (countdown keeps running in service) */
  cancelAlarm(): void {
    if (this.cancelled) return;
    this.cancelled = true;
    // Do NOT stop the service countdown — it keeps ticking
    this.router.navigate(['/alarm/cancel']);
  }

  /** Timer expired — alarm confirmed, navigate to lock screen */
  private onTimeExpired(): void {
    this.alarmService.confirmAlarm();
    this.router.navigate(['/alarm/lock']);
  }
}
