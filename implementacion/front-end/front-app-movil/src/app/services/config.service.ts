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

  private defaultConfig: AppSettings = {
    id: '',
    usuarioId: '',
    dispositivoId: '',
    general: { idiomaId: 'es', modoSigilosoActivo: false, modoDarkActivo: false },
    activation: { comandosVozActivo: false, fraseActivacionVoz: null, patronActivo: false, patronActivacion: null, movimientoActivo: false, sensibilidadMovimiento: null, tiempoCancelacionSeg: 0, tiempoActivacionSeg: 0 },
    security: { patronDesbloqueo: null, pinDesbloqueo: null, passDesbloqueo: null, nroIntentosFallidos: 0 },
    notifications: { frecuenciaUbicacion: 0, frecuenciaCapturaFotos: 0, frecuenciaGrabaAudio: 0, notificarSiempreSms: false, templateMensaje: null },
    media: { compresionAudio: '', resolucionFotosDpi: 0, umbralMinimoLux: null, usarFiltrosRuido: false },
    location: { precisionRed: 0, ubicacionWifi: false },
    storage: { conservarEvidencias: false, retencionEvidenciasDias: 0, limiteEspacioEvidencias: 0, borrarAntiguas: false, borrarEnviadas: false, espacioCriticoPct: 0, conservarHistorialLocal: 0 },
    network: { usarDatosMoviles: false, limiteDatos: 0, envioSoloWifi: false },
    battery: { umbralBateriaMedia: 50, umbralBateriaBaja: 20, umbralBateriaCritica: 5 }
  };

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


  private async clearLocalConfig(): Promise<void> {
    try {
      await Preferences.remove({ key: 'app_config' });
    } catch (error) {
      console.error('Error clearing local config:', error);
    }
  }

  /**
   * Reset to default config
   */
  async resetToDefault(): Promise<void> {
    this.configSubject.next(this.defaultConfig);
    await this.persistConfig(this.defaultConfig);
  }

  validarCredencialDesbloqueo(method: string, value: any) : boolean {
    const config = this.getCurrentConfig();
    if (!config)
      return false;
    switch (method) {
      case 'PASSWORD':
        return (config.security.passDesbloqueoActivo || false) && value === config.security.passDesbloqueo;
      case 'PIN':
        return (config.security.pinDesbloqueoActivo || false) && value === config.security.pinDesbloqueo;
      case 'PATRON':
        return (config.security.patronDesbloqueoActivo || false) && value === config.security.patronDesbloqueo;
      default:
        return false;
    }
  }

  validarCredencialActivacion(method: string, value: any) : boolean {
    const config = this.getCurrentConfig();
    if (!config)
      return false;
    switch (method) {
      case 'FRASE_VOZ':
        return (config.activation.comandosVozActivo || false) && value === config.activation.fraseActivacionVoz;
      case 'PATRON':
        return (config.activation.patronActivo || false) && value === config.activation.patronActivacion;
      case 'MOVIMIENTO':
        return config.activation.movimientoActivo || false;
      case 'REACTIVACION':
        return true; // No credential, just reactivation flow
      case 'MANUAL':
        return true; // No credential, just manual activation
      default:
        return false;
    }
  }
}
