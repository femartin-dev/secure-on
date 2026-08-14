import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { filter, take } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { DeviceService } from './services/device.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'SecureOn';
  isLoading = false;
  isNativePlatform = true;//Capacitor.isNativePlatform();

  constructor(private authService: AuthService, private router: Router) {
    this.initializeApp();
  }

  ngOnInit(): void {
    // Wait until the auth state has been restored from storage before checking
    this.authService.authReady$
      .pipe(
        filter((ready) => ready),
        take(1)
      )
      .subscribe(() => {
        if (!this.authService.getToken()) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/main']);
        }
      });
  }

  async initializeApp(): Promise<void> {
    try {
      // Native-only plugins (skip on browser)
      if (Capacitor.isNativePlatform()) {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });

        const { Keyboard } = await import('@capacitor/keyboard');
        await Keyboard.hide();
      }

      // Handle app pause/resume
      App.addListener('appStateChange', async (state) => {
        if (!state.isActive) {
          console.log('App went to background');
        } else {
          console.log('App came to foreground');
          this.checkAuthStatus();
        }
      });

      // Handle back button
      App.addListener('backButton', async () => {
        const currentUrl = this.router.url;
        if (currentUrl === '/login' || currentUrl === '/') {
          App.exitApp();
        } else {
          this.router.navigate(['/main']);
        }
      });
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  checkAuthStatus(): void {
    // Used when the app returns to foreground (auth is already initialized)
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
}
