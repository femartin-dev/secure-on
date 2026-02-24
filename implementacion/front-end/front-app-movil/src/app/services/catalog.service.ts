import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { API_CONFIG } from '../config/api-config';
import {
  PaginatedResponse,
  EstadoAlarma,
  CanalNotificacion,
  EstadoEnvio,
  Idioma,
  MetodoActivacion,
  MetodoUbicacion,
  PrioridadAlarma
} from '../models/catalog.models';

/**
 * Catalog Service
 * MS-APP-MOVIL - CatalogoController
 *
 * All endpoints: GET, no auth required, paginated
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private http: HttpClient) {}

  /**
   * Build pagination params
   */
  private buildParams(page?: number, size?: number): HttpParams {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    return params;
  }

  /**
   * GET /servicios-moviles/v1/catalogo/estados-alarma
   * Alarm states catalog (ACTIVA, INACTIVA, PENDIENTE)
   */
  getEstadosAlarma(page?: number, size?: number): Observable<PaginatedResponse<EstadoAlarma>> {
    return this.http
      .get<PaginatedResponse<EstadoAlarma>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_STATES}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching alarm states:', error);
          return throwError(() => new Error('Error al obtener estados de alarma'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/canales-notificacion
   * Notification channels catalog (SMS, EMAIL, PUSH)
   */
  getCanalesNotificacion(page?: number, size?: number): Observable<PaginatedResponse<CanalNotificacion>> {
    return this.http
      .get<PaginatedResponse<CanalNotificacion>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_NOTIFICATION_CHANNELS}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching notification channels:', error);
          return throwError(() => new Error('Error al obtener canales de notificación'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/estados-envio
   * Send states catalog (PENDIENTE, ENVIADA, ENTREGADA, FALLIDA)
   */
  getEstadosEnvio(page?: number, size?: number): Observable<PaginatedResponse<EstadoEnvio>> {
    return this.http
      .get<PaginatedResponse<EstadoEnvio>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_SEND_STATES}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching send states:', error);
          return throwError(() => new Error('Error al obtener estados de envío'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/idiomas
   * Languages catalog (es, en, pt)
   */
  getIdiomas(page?: number, size?: number): Observable<PaginatedResponse<Idioma>> {
    return this.http
      .get<PaginatedResponse<Idioma>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_LANGUAGES}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching languages:', error);
          return throwError(() => new Error('Error al obtener idiomas'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/metodos-activacion
   * Activation methods catalog (BOTÓN DE PÁNICO, MICRÓFONO, DETECCIÓN CAÍDA)
   */
  getMetodosActivacion(page?: number, size?: number): Observable<PaginatedResponse<MetodoActivacion>> {
    return this.http
      .get<PaginatedResponse<MetodoActivacion>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ACTIVATION_METHODS}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching activation methods:', error);
          return throwError(() => new Error('Error al obtener métodos de activación'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/metodos-ubicacion
   * Location methods catalog (GPS, WIFI, CELL ID)
   */
  getMetodosUbicacion(page?: number, size?: number): Observable<PaginatedResponse<MetodoUbicacion>> {
    return this.http
      .get<PaginatedResponse<MetodoUbicacion>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_LOCATION_METHODS}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching location methods:', error);
          return throwError(() => new Error('Error al obtener métodos de ubicación'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/prioridades-alarma
   * Alarm priorities catalog (CRÍTICA, ALTA, MEDIA, BAJA)
   */
  getPrioridadesAlarma(page?: number, size?: number): Observable<PaginatedResponse<PrioridadAlarma>> {
    return this.http
      .get<PaginatedResponse<PrioridadAlarma>>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_PRIORITIES}`,
        { params: this.buildParams(page, size) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching alarm priorities:', error);
          return throwError(() => new Error('Error al obtener prioridades de alarma'));
        })
      );
  }
}
