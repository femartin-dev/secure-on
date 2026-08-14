import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { Alarm, PaginatedAlarms } from '../models/alarm.models';
import { API_CONFIG, ApiConfigService } from '../config/api-config.service';

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
  providedIn: "root",
})
export class AlarmService {
  private alarmSubject = new BehaviorSubject<Alarm[]>([]);
  private selectedAlarmSubject = new BehaviorSubject<Alarm | null>(null);

  public alarms$ = this.alarmSubject.asObservable();
  public selectedAlarm$ = this.selectedAlarmSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  getAlarms(
    page?: number,
    pageSize?: number,
    queryparams?: Record<string, any>,
  ): Observable<PaginatedAlarms> {
    pageSize = pageSize ?? 20;
    const backendPage = Math.max(0, (page = page ?? 1) - 1);
    const queryString = this.apiConfig.buildQueryParams(queryparams || {});
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${API_CONFIG.ENDPOINTS.FILTER_ALARMS}?page=${backendPage}&size=${pageSize}&${queryString}`,
    );
    console.log("[AlarmService] GET ALERTS →", url);
    return this.http.get<PaginatedAlarms>(url);
  }

  getAlarmsByOperator(
    operatorId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginatedAlarms> {
    return this.getAlarms(page, pageSize, {
      operadorId: operatorId,
      estadoId: 1,
    });
  }

  getAlarmById(id: string): Observable<Alarm> {
    const endpoint = this.apiConfig.buildEndpointPathVar(
      API_CONFIG.ENDPOINTS.GET_ALARM,
      { alarmaId: id },
    );
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${endpoint}`,
    );
    return this.http.get<Alarm>(url);
  }

  private updateAlarmData(
    id: string,
    baseEndpoint: string,
    data: Record<string, any>,
  ): Observable<Alarm> {
    const endpoint = this.apiConfig.buildEndpointPathVar(baseEndpoint, {
      alarmaId: id,
    });
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${endpoint}`,
    );
    return this.http.put<Alarm>(url, data).pipe(
      tap(() =>
        console.log("[AlarmService] UPDATE ALARM →", url, {
          data,
        }),
      ),
    );
  }

  updateAlarmStatus(id: string, estadoAlarmaId: number): Observable<Alarm> {
    return this.updateAlarmData(id, API_CONFIG.ENDPOINTS.ALARM_STATE_CHANGE, {
      estadoAlarmaId,
    });
  }

  updateAlarmPriority(
    id: string,
    prioridadAlarmaId: number,
  ): Observable<Alarm> {
    return this.updateAlarmData(
      id,
      API_CONFIG.ENDPOINTS.ALARM_PRIORITY_CHANGE,
      {
        prioridadAlarmaId,
      },
    );
  }

  getActiveAlarms(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginatedAlarms> {
    return this.getAlarms(page, pageSize, { estadoId: 1 });
  }

  setSelectedAlarm(alarm: Alarm | null): void {
    this.selectedAlarmSubject.next(alarm);
  }

  updateLocalAlarms(alarms: Alarm[]): void {
    this.alarmSubject.next(alarms);
  }

  addOrUpdateAlarm(alarm: Alarm): void {
    const current = this.alarmSubject.value;
    const index = current.findIndex((a) => a.alarmaId === alarm.alarmaId);
    if (index >= 0) {
      current[index] = alarm;
    } else {
      current.unshift(alarm);
    }
    this.alarmSubject.next([...current]);
  }


}
