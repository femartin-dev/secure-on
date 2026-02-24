import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { Alert, PaginatedAlerts } from '../models/alert.models';
import { ApiConfigService } from '../config/api-config.service';

interface DashboardAlertsResponseDto {
  contenido: DashboardAlertItemDto[];
  totalElementos: number;
  numeroPagina: number;
  tamanioPagina: number;
  totalPaginas: number;
}

interface DashboardAlertItemDto {
  id: string;
  usuarioId: string;
  estado: string;
  prioridad: number;
  fechaCreacion: string;
  ubicacionActual?: {
    latitud: number;
    longitud: number;
    precision?: number;
  };
  asignadoA?: {
    id: string;
    nombre?: string;
    apellido?: string;
  };
  detalles?: string;
}

interface AlertLocationsResponseDto {
  ubicaciones?: Array<{
    latitud: number;
    longitud: number;
    precision?: number;
    timestamp: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private selectedAlertSubject = new BehaviorSubject<Alert | null>(null);

  public alerts$ = this.alertsSubject.asObservable();
  public selectedAlert$ = this.selectedAlertSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  getAlerts(page: number = 1, pageSize: number = 20): Observable<PaginatedAlerts> {
    const backendPage = Math.max(0, page - 1);
    const url = this.apiConfig.getApiUrl(`/centro-de-monitoreo/v1/dashboard/filtrar-alarmas?page=${backendPage}&size=${pageSize}`);
    console.log('[AlertService] GET ALERTS →', url);
    return this.http
      .get<DashboardAlertsResponseDto>(url)
      .pipe(map((response) => this.mapDashboardPage(response)));
  }

  getAlertsByOperator(operatorId: string, page: number = 1, pageSize: number = 20): Observable<PaginatedAlerts> {
    const backendPage = Math.max(0, page - 1);
    const url = this.apiConfig.getApiUrl(
      `/centro-de-monitoreo/v1/dashboard/filtrar-alarmas?operadorId=${operatorId}&page=${backendPage}&size=${pageSize}`
    );
    console.log('[AlertService] GET ALERTS BY OPERATOR →', url);
    return this.http
      .get<DashboardAlertsResponseDto>(url)
      .pipe(map((response) => this.mapDashboardPage(response)));
  }

  getAlertById(id: string): Observable<Alert> {
    const detailUrl = this.apiConfig.getApiUrl(`/centro-de-monitoreo/v1/dashboard/alerta/${id}`);
    const locationsUrl = this.apiConfig.getApiUrl(`/centro-de-monitoreo/v1/dashboard/alerta/${id}/ubicaciones`);
    console.log('[AlertService] GET ALERT BY ID →', detailUrl);
    console.log('[AlertService] GET ALERT LOCATIONS →', locationsUrl);
    const detail$ = this.http.get<DashboardAlertItemDto>(detailUrl);
    const locations$ = this.http
      .get<AlertLocationsResponseDto>(locationsUrl)
      .pipe(catchError(() => of({ ubicaciones: [] })));

    return forkJoin([detail$, locations$]).pipe(
      map(([detail, locations]) => this.mapAlertDetail(detail, locations))
    );
  }

  updateAlert(id: string, data: Partial<Alert>): Observable<Alert> {
    return this.http.patch<Alert>(this.apiConfig.getApiUrl(`/alerts/${id}`), data).pipe(
      tap(() => console.log('[AlertService] UPDATE ALERT →', this.apiConfig.getApiUrl(`/alerts/${id}`), data))
    );
  }

  updateAlertStatus(id: string, status: Alert['status']): Observable<Alert> {
    return this.http.patch<Alert>(this.apiConfig.getApiUrl(`/alerts/${id}/status`), { status }).pipe(
      tap(() => console.log('[AlertService] UPDATE ALERT STATUS →', this.apiConfig.getApiUrl(`/alerts/${id}/status`), { status }))
    );
  }

  getActiveAlerts(): Observable<Alert[]> {
    const url = this.apiConfig.getApiUrl('/centro-de-monitoreo/v1/dashboard/filtrar-alarmas?estadoId=1&page=0&size=20');
    console.log('[AlertService] GET ACTIVE ALERTS →', url);
    return this.http
      .get<DashboardAlertsResponseDto>(url)
      .pipe(map((response) => this.mapDashboardPage(response).alerts));
  }

  setSelectedAlert(alert: Alert | null): void {
    this.selectedAlertSubject.next(alert);
  }

  updateLocalAlerts(alerts: Alert[]): void {
    this.alertsSubject.next(alerts);
  }

  addOrUpdateAlert(alert: Alert): void {
    const current = this.alertsSubject.value;
    const index = current.findIndex(a => a.id === alert.id);
    
    if (index >= 0) {
      current[index] = alert;
    } else {
      current.unshift(alert);
    }
    
    this.alertsSubject.next([...current]);
  }

  private mapDashboardPage(response: DashboardAlertsResponseDto): PaginatedAlerts {
    const alerts = (response.contenido || []).map((item) => this.mapAlertSummary(item));

    return {
      alerts,
      total: response.totalElementos ?? alerts.length,
      page: (response.numeroPagina ?? 0) + 1,
      pageSize: response.tamanioPagina ?? alerts.length,
      totalPages: response.totalPaginas ?? 1
    };
  }

  private mapAlertSummary(dto: DashboardAlertItemDto): Alert {
    const createdAt = dto.fechaCreacion ? new Date(dto.fechaCreacion) : new Date();
    const latitude = dto.ubicacionActual?.latitud ?? 0;
    const longitude = dto.ubicacionActual?.longitud ?? 0;

    return {
      id: dto.id,
      userId: dto.usuarioId,
      userName: `Usuario ${dto.usuarioId?.slice(0, 8) || ''}`,
      userPhone: 'N/D',
      type: 'panic',
      status: this.mapStatus(dto.estado),
      priority: this.mapPriority(dto.prioridad),
      title: 'Alarma activa',
      description: dto.detalles || 'Alarma reportada desde dispositivo móvil.',
      location: {
        latitude,
        longitude,
        timestamp: createdAt,
        accuracy: dto.ubicacionActual?.precision
      },
      locationHistory: [
        {
          latitude,
          longitude,
          timestamp: createdAt,
          accuracy: dto.ubicacionActual?.precision
        }
      ],
      createdAt,
      updatedAt: createdAt,
      operatorId: dto.asignadoA?.id,
      operatorName: [dto.asignadoA?.nombre, dto.asignadoA?.apellido].filter(Boolean).join(' ').trim() || dto.asignadoA?.nombre,
      evidenceUrls: [],
      emergencyContacts: [],
      nearbyAuthorities: [],
      notes: dto.detalles || ''
    };
  }

  private mapAlertDetail(dto: DashboardAlertItemDto, locationsResponse: AlertLocationsResponseDto): Alert {
    const base = this.mapAlertSummary(dto);
    const locations = (locationsResponse.ubicaciones || []).map((location) => ({
      latitude: location.latitud,
      longitude: location.longitud,
      timestamp: new Date(location.timestamp),
      accuracy: location.precision
    }));

    if (locations.length > 0) {
      const latest = locations[locations.length - 1];
      return {
        ...base,
        location: latest,
        locationHistory: locations,
        updatedAt: latest.timestamp
      };
    }

    return base;
  }

  private mapStatus(status: string): Alert['status'] {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVA':
        return 'active';
      case 'REVISION':
      case 'EN_REVISION':
      case 'EN REVISIÓN':
        return 'review';
      case 'DESPACHADA':
        return 'dispatched';
      case 'INACTIVA':
      case 'FINALIZADA':
      case 'RESUELTA':
        return 'resolved';
      default:
        return 'active';
    }
  }

  private mapPriority(priority: number): Alert['priority'] {
    switch (priority) {
      case 1:
        return 'low';
      case 2:
        return 'medium';
      case 3:
        return 'high';
      case 4:
        return 'critical';
      default:
        return 'high';
    }
  }
}
