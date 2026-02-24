import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, delay, retry } from 'rxjs/operators';
import { extractServerError } from '../utils/error-handler.util';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

import { API_CONFIG } from '../config/api-config';
import { pegarDesdeClipboard } from '../utils/clipboard-util.util';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  PasswordRecoveryRequest,
  ResetPasswordRequest,
  AuthUser,
  TokenResponse
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private configSubject = new BehaviorSubject<any>(null);
  public config$ = this.configSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private deviceAppId: string | null = null;

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication from storage
   */
  private async initializeAuth(): Promise<void> {
    try {
      // Get device app ID
      this.deviceAppId = await this.getOrCreateDeviceId();

      // Try to restore session from storage
      const result = await Preferences.get({ key: API_CONFIG.TOKEN_STORAGE_KEY });
      const userResult = await Preferences.get({ key: API_CONFIG.USER_STORAGE_KEY });

      if (result.value && userResult.value) {
        const user: AuthUser = JSON.parse(userResult.value);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // Check if token is still valid
        this.checkTokenExpiration(user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(
        `${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER}`,
        data
      )
      .pipe(
        retry(API_CONFIG.RETRY_ATTEMPTS),
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          return throwError(
            () => new Error(extractServerError(error, 'Error al registrar usuario'))
          );
        })
      );
  }

  /**
   * Register device for the authenticated user.
   * POST /seguridad/v1/app/dispositivo/registrar
   */
  /**
   * Register device using authenticated user
   */
  registerDevice(deviceInfo: {
    modelo: string;
    numeroSerie: string;
    versionSO: string;
    tipoDispositivo: string;
  }): Observable<any> {
    return this.http
      .post<any>(
        `${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_DEVICE}`,
        deviceInfo
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Device registration error:', error);
          return throwError(
            () => new Error(extractServerError(error, 'Error al registrar dispositivo'))
          );
        })
      );
  }

  /**
   * Register device by user id without requiring a bearer token.
   * Used immediately after account creation so login can succeed.
   */
  registerDeviceForUser(usuarioId: string, dispositivoAppId: string, numero: string): Observable<any> {
    return this.http
      .post<any>(`${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_DEVICE}`, {
        usuarioId,
        dispositivoAppId,
        numero,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Device registration (unauth) error:', error);
          // swallow errors so registration can continue
          return throwError(
            () => new Error(extractServerError(error, 'Error al registrar dispositivo'))
          );
        })
      );
  }

  /**
   * Register default configuration for the newly created device.
   * POST /servicios-moviles/v1/config/nueva
   */
  registerDefaultConfig(usuarioId: string, dispositivoId: string): Observable<any> {
    return this.http
      .post<any>(`${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.NEW_CONFIG}`, {
        usuarioId,
        dispositivoId,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Default config registration error:', error);
          return throwError(
            () => new Error(extractServerError(error, 'Error al registrar configuración'))
          );
        })
      );
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure device ID is available
      if (!this.deviceAppId) {
        this.deviceAppId = await this.getDeviceAppId();
      }

      const loginRequest: LoginRequest = {
        email,
        password,
        dispositivoAppId: this.deviceAppId,
      };

      console.log('Login request payload:', JSON.stringify(loginRequest));

      const response = await this.http
        .post<LoginResponse>(
          `${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.LOGIN}`,
          loginRequest
        )
        .pipe(
          retry(API_CONFIG.RETRY_ATTEMPTS),
          tap((res) => this.handleLoginSuccess(res)),
          catchError((error: HttpErrorResponse) => {
            console.error('Login error:', error);
            return throwError(
              () => new Error(extractServerError(error, 'Error al iniciar sesión'))
            );
          })
        )
        .toPromise();

      // after successful login, fetch configuration
      const user = this.currentUserSubject.value;
      if (user) {
        try {
          await this.loadDeviceConfig(user.id, user.dispositivoId);
        } catch (cfgErr) {
          console.warn('Unable to load device config:', cfgErr);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error?.message || 'Error al iniciar sesión',
      };
    }
  }

  /**
   * Handle successful login
   */
  private async handleLoginSuccess(response: LoginResponse): Promise<void> {
    const user: AuthUser = {
      id: response.id,
      email: response.email,
      nombre: response.nombre,
      apellido: response.apellido,
      dispositivoId: response.dispositivoId,
      token: response.token,
      expiracion: response.expiracion,
    };

    // Save to storage
    await Preferences.set({ key: API_CONFIG.TOKEN_STORAGE_KEY, value: response.token });
    await Preferences.set({ key: API_CONFIG.USER_STORAGE_KEY, value: JSON.stringify(user) });

    // Update state
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Logout user
   * POST /seguridad/v1/app/auth/logout?dispositivoAppId=...
   */
  async logout(): Promise<void> {
    try {
      const user = this.currentUserSubject.value;
      if (user) {
        // Call logout endpoint with dispositivoAppId as query param
        await this.http
          .post(
            `${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.LOGOUT}?dispositivoAppId=${this.deviceAppId}`,
            {}
          )
          .toPromise();
      }

      // Clear storage
      await Preferences.remove({ key: API_CONFIG.TOKEN_STORAGE_KEY });
      await Preferences.remove({ key: API_CONFIG.USER_STORAGE_KEY });

      // Update state
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Request password recovery
   */
  requestPasswordRecovery(data: PasswordRecoveryRequest): Observable<{ codigo: string }> {
    return this.http
      .post<{
        codigo: string;
      }>(`${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Password recovery error:', error);
          return throwError(
            () => new Error(extractServerError(error, 'Error al solicitar recuperación'))
          );
        })
      );
  }

  /**
   * Reset password
   */
  resetPassword(data: ResetPasswordRequest): Observable<{ mensaje: string }> {
    return this.http
      .post<{
        mensaje: string;
      }>(`${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Reset password error:', error);
          return throwError(
            () => new Error(extractServerError(error, 'Error al restablecer contraseña'))
          );
        })
      );
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await this.http
        .post<TokenResponse>(
          `${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
          {}
        )
        .toPromise();

      if (response && response.nuevoToken) {
        await Preferences.set({ key: API_CONFIG.TOKEN_STORAGE_KEY, value: response.nuevoToken });
        const user = this.currentUserSubject.value;
        if (user) {
          user.token = response.nuevoToken;
          this.currentUserSubject.next(user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get or create device ID
   */
  private async getOrCreateDeviceId(): Promise<string> {
    try {
      // Try to get from storage
      const result = await Preferences.get({ key: API_CONFIG.DEVICE_ID_KEY });
      if (result.value) {
        return result.value;
      }

      // Get device info
      const info = await Device.getId();
      const deviceId = info.identifier;

      // Get from clipboard if on web (for testing multiple browser sessions)
      const isWeb = typeof window !== 'undefined' && !!window.document;
      if (!deviceId && isWeb) {
        const clipboardText = await pegarDesdeClipboard();
        if (clipboardText) {
          await Preferences.set({ key: API_CONFIG.DEVICE_ID_KEY, value: clipboardText });
          return clipboardText;
        }
      }

      // Save to storage
      await Preferences.set({ key: API_CONFIG.DEVICE_ID_KEY, value: deviceId });

      return deviceId;
    } catch (error) {
      console.error('Error getting device ID, using mock UUID for browser:', error);
      // Mock UUID for browser testing
      return '';
    }
  }

  /**
   * Get device app ID
   */
  async getDeviceAppId() {
    return this.deviceAppId || pegarDesdeClipboard();
  }

  /**
   * Load configuration from server for the specified user/device
   */
  private async loadDeviceConfig(usuarioId: string, dispositivoId: string): Promise<void> {
    try {
      const config = await this.http
        .post<any>(`${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.GET_CONFIG}`, {
          usuarioId: usuarioId,
          dispositivoId: dispositivoId,
        })
        .toPromise();

      if (config) {
        this.configSubject.next(config);
        return;
      }
      // no config returned -> create default
      console.warn('No device config found, creating default');
    } catch (error: any) {
      console.warn('Error fetching device config, creating default', error);
      // fall through to create default
    }

    try {
      const newCfg = await this.registerDefaultConfig(usuarioId, dispositivoId).toPromise();
      this.configSubject.next(newCfg || {});
    } catch (regErr) {
      console.error('Error creating default config:', regErr);
    }
  }

  /**
   * Check token expiration and refresh if needed
   */
  private checkTokenExpiration(user: AuthUser): void {
    const expirationTime = new Date(user.expiracion).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiration = expirationTime - currentTime;

    if (timeUntilExpiration > 0) {
      // Refresh token 5 minutes before expiration
      const refreshTime = timeUntilExpiration - 5 * 60 * 1000;
      setTimeout(
        () => {
          this.refreshToken();
        },
        Math.max(0, refreshTime)
      );
    } else {
      // Token already expired
      this.logout();
    }
  }
}
