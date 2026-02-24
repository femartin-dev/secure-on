import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

import { API_CONFIG } from '../config/api-config';
import { AppConfig, GeneralSettings, ActivationSettings, SecuritySettings, PerformanceSettings, NotificationSettings } from '../models/config.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private defaultConfig: AppConfig = {
    general: {
      nombreDispositivo: 'Mi Dispositivo',
      numeroTelefono: '',
      correoEmergencia: '',
      idioma: 'es',
      zonaHoraria: 'America/Argentina/Buenos_Aires'
    },
    activation: {
      tiempoActivacion: 3000, // 3 seconds
      tiempoCancelacion: 15000, // 15 seconds
      vibracionHabilitada: true,
      sonoroHabilitado: true,
      volumenSonoro: 80
    },
    security: {
      metodosDesbloqueo: ['PASSWORD', 'PIN'],
      requerirHuellaPrimero: false,
      cambiarContrasenaAuto: false,
      diasParaCambio: 90
    },
    performance: {
      actualizarGPS: 5000, // 5 seconds
      callidadGPS: 'ALTA',
      registrosLocales: true,
      borrarDatos: 30 // 30 days
    },
    notifications: {
      notificacionesHabilitadas: true,
      notificacionesVoz: true,
      vibracionalEnable: true
    }
  };

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  /**
   * Load configuration
   */
  private loadConfig(): void {
    this.getConfig().subscribe(
      (config) => {
        this.configSubject.next(config);
        this.persistConfig(config);
      },
      (error) => {
        console.error('Error loading config from server:', error);
        // Try to load from local storage
        this.loadLocalConfig();
      }
    );
  }

  /**
   * Get configuration from server
   * Note: No GET endpoint documented - using local fallback
   */
  getConfig(): Observable<AppConfig> {
    return this.http
      .get<AppConfig>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONFIG_BASE}`
      )
      .pipe(
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
  createConfig(config: AppConfig): Observable<AppConfig> {
    return this.http
      .post<AppConfig>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CREATE_CONFIG}`,
        config
      )
      .pipe(
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
  updateConfig(config: AppConfig, configId?: string): Observable<AppConfig> {
    const url = configId
      ? `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONFIG_BASE}/${configId}/editar`
      : `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CREATE_CONFIG}`;

    return this.http
      .post<AppConfig>(url, config)
      .pipe(
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
  getCurrentConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  /**
   * Update specific section
   */
  async updateSection(
    section: keyof AppConfig,
    data: any
  ): Promise<void> {
    const current = this.configSubject.value || this.defaultConfig;
    const updated = {
      ...current,
      [section]: { ...current[section], ...data }
    };

    return new Promise((resolve, reject) => {
      this.updateConfig(updated).subscribe(
        () => resolve(),
        (error) => reject(error)
      );
    });
  }

  /**
   * Persist config to local storage
   */
  private async persistConfig(config: AppConfig): Promise<void> {
    try {
      await Preferences.set({ key: 'app_config', value: JSON.stringify(config) });
    } catch (error) {
      console.error('Error persisting config:', error);
    }
  }

  /**
   * Load config from local storage
   */
  private async loadLocalConfig(): Promise<void> {
    try {
      const result = await Preferences.get({ key: 'app_config' });
      if (result.value) {
        const config = JSON.parse(result.value) as AppConfig;
        this.configSubject.next(config);
      } else {
        // Use default config
        this.configSubject.next(this.defaultConfig);
      }
    } catch (error) {
      console.error('Error loading local config:', error);
      this.configSubject.next(this.defaultConfig);
    }
  }

  /**
   * Reset to default config
   */
  async resetToDefault(): Promise<void> {
    this.configSubject.next(this.defaultConfig);
    await this.persistConfig(this.defaultConfig);
  }
}
