import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

import { API_CONFIG } from '../config/api-config';
import {
  AppSettings,
  Configuracion,
  toAppSettings,
  toConfiguracion,
} from '../models/config.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppSettings | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load configuration for an authenticated user session.
   */
  async loadConfigForUser(usuarioId: string, dispositivoId: string, reload: boolean): Promise<void> {
    console.log('Loading config for user:', usuarioId, 'device:', dispositivoId);
    let config;
    try {
      config = await this.getLocalConfig();
      if (config === null || reload) {
        config = await firstValueFrom(this.getConfig(usuarioId, dispositivoId));
      }
      this.configSubject.next(config);
      console.log('Config loaded:', config);
      await this.persistConfig(config);
    } catch (error) {
      console.error('Error loading config from server:', error);
    }
  }

  async getLocalConfig(): Promise<AppSettings | null> {
    try {
      const result = await Preferences.get({ key: 'app_config' })
      return JSON.parse(result?.value ?? '') as AppSettings;
    } catch (error) {
      console.error('Error loading local config:', error);
      return null;
    }
  }

  /**
   * Get configuration from server
   * Note: No GET endpoint documented - using local fallback
   */
  getConfig(usuarioId: string, dispositivoId: string): Observable<AppSettings> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('dispositivoId', dispositivoId);

    return this.http
      .get<Configuracion>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONFIG_BASE}/obtener`,
        { params }
      )
      .pipe(
        map((config) => toAppSettings(config)),
        catchError((error) => {
          console.error('Error getting config:', error);
          return throwError(() => new Error('Error al obtener configuración'));
        })
      );
  }

  /**
   * Create new configuration
   * POST /servicios-moviles/v1/config/nuevo
   */
  createConfig(usuarioId: string, dispositivoId: string): Observable<AppSettings> {
    const payload = {
      usuarioId,
      dispositivoId
    };
    return this.http
      .post<Configuracion>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CREATE_CONFIG}`,
        payload
      )
      .pipe(
        map((config) => toAppSettings(config)),
        tap((createdConfig) => {
          this.configSubject.next(createdConfig);
          this.persistConfig(createdConfig);
        }),
        catchError((error) => {
          console.error('Error creating config:', error);
          return throwError(() => new Error('Error al crear configuración'));
        })
      );
  }

  /**
   * Update configuration
   * POST /servicios-moviles/v1/config/{configId}/editar
   */
  updateConfig(config: AppSettings): Observable<AppSettings> {
    const payload = toConfiguracion(config);
    console.log('Updating config with payload:', payload);
    return this.http
      .post<Configuracion>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONFIG_BASE}/${config.id}/editar`,
        payload
      )
      .pipe(
        map((config) => toAppSettings(config)),
        tap((updatedConfig) => {
          this.configSubject.next(updatedConfig);
          this.persistConfig(updatedConfig);
        }),
        catchError((error) => {
          console.error('Error updating config:', error);
          return throwError(() => new Error('Error al actualizar configuración'));
        })
      );
  }

  /**
   * Get current config
   */
  getCurrentConfig(): AppSettings | null {
    return this.configSubject.value;
  }

  /**
   * Persist config to local storage
   */
  private async persistConfig(config: AppSettings): Promise<void> {
    try {
      await Preferences.set({ key: 'app_config', value: JSON.stringify(config) });
    } catch (error) {
      console.error('Error persisting config:', error);
    }
  }

}
