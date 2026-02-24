import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { AlarmService } from '../../../../services/alarm.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser: any;
  pressing = false;
  panicProgress = 302; // full offset = circle not drawn
  private panicTimer: any;
  private animationFrame: any;

  @ViewChild('drawerToggle') drawerToggle!: ElementRef;
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private authService: AuthService,
    private alarmService: AlarmService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngAfterViewInit(): void {
    this.bgVideo?.nativeElement?.play().catch(() => {});
  }

  ngOnDestroy(): void {
    this.clearPanicTimer();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  /**
   * Panic button press start — begin 3-second countdown
   */
  onPanicStart(): void {
    this.pressing = true;
    this.panicProgress = 0; // animate to full circle over 3s (CSS transition handles it)

    this.panicTimer = setTimeout(() => {
      // 3 seconds elapsed — trigger alarm
      this.triggerAlarm();
    }, 3000);
  }

  /**
   * Panic button released before 3 seconds — cancel
   */
  onPanicEnd(): void {
    if (!this.pressing) return;
    this.pressing = false;
    this.panicProgress = 302; // reset circle
    this.clearPanicTimer();
  }

  private clearPanicTimer(): void {
    if (this.panicTimer) {
      clearTimeout(this.panicTimer);
      this.panicTimer = null;
    }
  }

  /**
   * Alarm triggered after 3-second hold
   */
  private async triggerAlarm(): Promise<void> {
    this.pressing = false;
    this.panicProgress = 302;

    // Start 15-second pre-alarm countdown
    this.alarmService.triggerAlarmCountdown();

    // Navigate directly to the cancellation screen (countdown + credentials)
    this.router.navigate(['/alarm/cancel']);
  }

  /**
   * Close drawer and navigate
   */
  closeDrawerAndNavigate(route: string): void {
    // Uncheck the drawer toggle
    const checkbox = document.getElementById('drawer-toggle') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;

    this.router.navigate([route]);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const checkbox = document.getElementById('drawer-toggle') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;

      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      this.notificationService.showError('Error al cerrar sesión');
    }
  }
}
