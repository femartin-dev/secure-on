import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { API_CONFIG } from '../config/api-config';
import {
  EstadoAlarma,
  CanalNotificacion,
  EstadoEnvio,
  Idioma,
  MetodoActivacion,
  MetodoUbicacion,
  PrioridadAlarma,
  CatalogsResponse
} from '../models/catalog.models';
import { notificationChannelsConfig } from '../utils/constants.util';
import { CatalogType } from '../models/catalog.models';
/**
 * Catalog Service
 * MS-APP-MOVIL - CatalogoController
 *
 * All endpoints: GET, no auth required
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private estadosAlarmaSubject = new BehaviorSubject<EstadoAlarma[] | null>(null);
  public estadosAlarma$ = this.estadosAlarmaSubject.asObservable();
  private canalesNotificacionSubject = new BehaviorSubject<CanalNotificacion[] | null>(null);
  public canalesNotificacion$ = this.canalesNotificacionSubject.asObservable();
  private estadosEnvioSubject = new BehaviorSubject<EstadoEnvio[] | null>(null);
  public estadosEnvio$ = this.estadosEnvioSubject.asObservable();
  private idiomasSubject = new BehaviorSubject<Idioma[] | null>(null);
  public idiomas$ = this.idiomasSubject.asObservable();
  private metodosActivacionSubject = new BehaviorSubject<MetodoActivacion[] | null>(null);
  public metodosActivacion$ = this.metodosActivacionSubject.asObservable();
  private metodosUbicacionSubject = new BehaviorSubject<MetodoUbicacion[] | null>(null);
  public metodosUbicacion$ = this.metodosUbicacionSubject.asObservable();
  private prioridadAlarmaSubject = new BehaviorSubject<PrioridadAlarma[] | null>(null);
  public prioridadAlarma$ = this.prioridadAlarmaSubject.asObservable();
  private relacionSubject = new BehaviorSubject<string[] | null>(null);
  public relacion$ = this.relacionSubject.asObservable();

  private isLoaded = false;

  constructor(private http: HttpClient) {}


  async loadCatalogs(): Promise<void> {
    try {
      console.log('Loading catalogs...');
      if (this.isLoaded) {
        return;
      }
      await this.getEstadosAlarma().toPromise();
      await this.getCanalesNotificacionHabilitados().toPromise();
      await this.getEstadosEnvio().toPromise();
      await this.getIdiomas().toPromise();
      await this.getMetodosActivacion().toPromise();
      await this.getMetodosUbicacion().toPromise();
      await this.getPrioridadesAlarma().toPromise();
      await this.getRelaciones().toPromise();
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  }

  /**
   * GET /servicios-moviles/v1/catalogo/estados-alarma
   * Alarm states catalog (ACTIVA, INACTIVA, PENDIENTE)
   */
  getEstadosAlarma(): Observable<EstadoAlarma[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_STATES}`
      )
      .pipe(
        map((response) => {
          const items: CatalogType[] = response?.estadosAlarma ?? [];
          return items.map(
            (item: CatalogType) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                color: '',
                icono: '',
              }) as EstadoAlarma
          );
        }),
        tap((estadosAlarma: EstadoAlarma[]) => {
          this.estadosAlarmaSubject.next(estadosAlarma);
        }),
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

  getCanalesNotificacionHabilitados(): Observable<CanalNotificacion[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_NOTIFICATION_CHANNELS}`
      )
      .pipe(
        map((response: CatalogsResponse) => {
          // Backend returns { canalesNotificacion: [...] }
          const items: any[] = response?.canalesNotificacion ?? [];
          return items
            .filter((item: any) => item.habilitada !== false && item.habilitada !== 0)
            .map((item: any) => {
              const cfg = notificationChannelsConfig[item.id] ?? notificationChannelsConfig[0];
              return {
                id: item.id,
                descripcion: item.descripcion,
                icono: cfg.icon,
                svgIcono: cfg.svgIcon,
                color: cfg.color,
                orden: item.orden ?? item.id,
              } as CanalNotificacion;
            });
        }),
        tap((canalesNotificacion: CanalNotificacion[]) => {
          this.canalesNotificacionSubject.next(canalesNotificacion);
        }),
        catchError((error) => {
          console.error('Error getting notification channels:', error);
          return throwError(() => new Error('Error al obtener canales de notificación'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/estados-envio
   * Send states catalog (PENDIENTE, ENVIADA, ENTREGADA, FALLIDA)
   */
  getEstadosEnvio(): Observable<EstadoEnvio[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_SEND_STATES}`
      )
      .pipe(
        map((response) => {
          const items: CatalogType[] = response?.estadosEnvio ?? [];
          return items.map(
            (item: CatalogType) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                icono: '',
              }) as EstadoEnvio
          );
        }),
        tap((estadosEnvio: EstadoEnvio[]) => {
          this.estadosEnvioSubject.next(estadosEnvio);
        }),
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
  getIdiomas(): Observable<Idioma[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_LANGUAGES}`
      )
      .pipe(
        map((response) => {
          const items: any[] = response?.idiomas ?? [];
          return items.map(
            (item) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                icono: '',
                color: '',
                habilitada: item.habilitada,
              }) as Idioma
          );
        }),
        tap((idiomas: Idioma[]) => {
          this.idiomasSubject.next(idiomas);
        }),
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
  getMetodosActivacion(): Observable<MetodoActivacion[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ACTIVATION_METHODS}`
      )
      .pipe(
        map((response) => {
          const items: CatalogType[] = response?.metodosActivacion ?? [];
          return items.map(
            (item: CatalogType) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                icono: '',
                orden: item.id,
              }) as MetodoActivacion
          );
        }),
        tap((metodosActivacion: MetodoActivacion[]) => {
          this.metodosActivacionSubject.next(metodosActivacion);
        }),
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
  getMetodosUbicacion(): Observable<MetodoUbicacion[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_LOCATION_METHODS}`
      )
      .pipe(
        map((response) => {
          const items: CatalogType[] = response?.metodosUbicacion ?? [];
          return items.map(
            (item: CatalogType) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                precision: 0,
              }) as MetodoUbicacion
          );
        }),
        tap((metodosUbicacion: MetodoUbicacion[]) => {
          this.metodosUbicacionSubject.next(metodosUbicacion);
        }),
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
  getPrioridadesAlarma(): Observable<PrioridadAlarma[]> {
    return this.http
      .get<CatalogsResponse>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_PRIORITIES}`
      )
      .pipe(
        map((response) => {
          const items: CatalogType[] = response?.prioridades ?? [];
          return items.map(
            (item: CatalogType) =>
              ({
                id: item.id,
                descripcion: item.descripcion,
                nivel: 0,
                color: '',
              }) as PrioridadAlarma
          );
        }),
        tap((prioridadesAlarma: PrioridadAlarma[]) => {
          this.prioridadAlarmaSubject.next(prioridadesAlarma);
        }),
        catchError((error) => {
          console.error('Error fetching alarm priorities:', error);
          return throwError(() => new Error('Error al obtener prioridades de alarma'));
        })
      );
  }

  /**
   * GET /servicios-moviles/v1/catalogo/relaciones
   * Relationships catalog (Padre, Madre, Amigo, Pareja, Hermano/a, Hijo/a, Otro)
   */
  getRelaciones(): Observable<string[]> {
    return this.http
      .get<
        string[]
      >(`${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_RELATIONSHIPS}`)
      .pipe(
        tap((relaciones: string[]) => {
          this.relacionSubject.next(relaciones);
        }),
        catchError((error) => {
          console.error('Error fetching relationships:', error);
          return throwError(() => new Error('Error al obtener relaciones'));
        })
      );
  }
}
