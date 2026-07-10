import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, delay, retry } from 'rxjs/operators';
import { extractServerError } from '../utils/error-handler.util';

import { Preferences } from '@capacitor/preferences';

import { API_CONFIG } from '../config/api-config';
import { ConfigService } from './config.service';
import { DeviceService } from './device.service';
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
import { DeviceRegistration } from '../models/device.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();

  private deviceAppId: string | null = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private deviceService: DeviceService
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication from storage
   */
  private async initializeAuth(): Promise<void> {
    try {
      // Get device app ID
      this.deviceAppId = await this.getDeviceAppId();

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
    } finally {
      this.authReadySubject.next(true);
    }
  }

  /**
   * Register new user
   */
  registerUser(data: RegisterRequest): Observable<RegisterResponse> {
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
  registerDevice(deviceInfo: Partial<DeviceRegistration>): Observable<DeviceRegistration> {
    return this.http
      .post<DeviceRegistration>(
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
   * Login user
   */
  async login(
    usuario: string,
    tipo: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure device ID is available
      if (!this.deviceAppId) {
        this.deviceAppId = await this.getDeviceAppId();
      }

      const loginRequest: LoginRequest = {
        [tipo]: usuario,
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
          catchError((error: HttpErrorResponse) => {
            console.error('Login error:', error);
            return throwError(
              () => new Error(extractServerError(error, 'Error al iniciar sesión'))
            );
          })
        )
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta de login');
      }

      // Persist user/token before using auth state in the rest of the flow
      await this.handleLoginSuccess(response);
      try {
        await this.configService.loadConfigForUser(response.id, response.dispositivoId, true);
      } catch (cfgErr) {
        console.warn('Unable to load device config:', cfgErr);
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
   * GET /seguridad/v1/app/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const user = this.currentUserSubject.value;
      if (user) {
        // Call logout endpoint with Bearer token in Authorization header
        const headers = new HttpHeaders({
          Authorization: `Bearer ${user.token}`,
        });

        await this.http
          .get(`${API_CONFIG.MS_SECURITY.baseUrl}${API_CONFIG.ENDPOINTS.LOGOUT}`, { headers })
          .pipe(
            tap((mensaje) => {
              console.log(mensaje);
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('Logout API error:', error);
              // swallow errors to ensure logout proceeds
              return throwError(
                () => new Error(extractServerError(error, 'Error al cerrar sesión'))
              );
            })
          );
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
  private async getDeviceAppId(): Promise<string> {
    try {
      // Try to get from storage
      /*
      const result = await Preferences.get({ key: API_CONFIG.DEVICE_ID_KEY });
      console.log('result:', result);
      if (result.value) {
        return result.value;
      }
      const deviceId = (await this.deviceService.getDeviceIdentifier()) ?? '';
      */
      /*
      const isWeb = typeof window !== 'undefined' && !!window.document;
      if (!deviceId && isWeb) {
        const clipboardText = await getClipboard();
        console.log('clipboardText:', clipboardText);
        if (clipboardText) {
          await Preferences.set({ key: API_CONFIG.DEVICE_ID_KEY, value: clipboardText });
          return clipboardText;
        }
      }
      */
      // Save to storage
      //await Preferences.set({ key: API_CONFIG.DEVICE_ID_KEY, value: deviceId });

      return (await this.deviceService.getDeviceIdentifier()) ?? '';
    } catch (error) {
      console.error('Error getting device ID, using mock UUID for browser:', error);
      return '';
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
