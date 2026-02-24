import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SecureOn';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit(): void {
    this.checkAuthStatus();
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
          this.router.navigate(['/dashboard']);
        }
      });
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  checkAuthStatus(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
}
