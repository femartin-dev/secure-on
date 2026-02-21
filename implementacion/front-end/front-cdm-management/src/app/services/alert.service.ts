import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert, PaginatedAlerts } from '../models/alert.models';
import { ApiConfigService } from '../config/api-config.service';

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
    return this.http.get<PaginatedAlerts>(
      this.apiConfig.getApiUrl(`/alerts?page=${page}&pageSize=${pageSize}`)
    );
  }

  getAlertsByOperator(operatorId: string, page: number = 1, pageSize: number = 20): Observable<PaginatedAlerts> {
    return this.http.get<PaginatedAlerts>(
      this.apiConfig.getApiUrl(`/alerts/operator/${operatorId}?page=${page}&pageSize=${pageSize}`)
    );
  }

  getAlertById(id: string): Observable<Alert> {
    return this.http.get<Alert>(this.apiConfig.getApiUrl(`/alerts/${id}`));
  }

  updateAlert(id: string, data: Partial<Alert>): Observable<Alert> {
    return this.http.patch<Alert>(this.apiConfig.getApiUrl(`/alerts/${id}`), data);
  }

  updateAlertStatus(id: string, status: Alert['status']): Observable<Alert> {
    return this.http.patch<Alert>(this.apiConfig.getApiUrl(`/alerts/${id}/status`), { status });
  }

  getActiveAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.apiConfig.getApiUrl('/alerts/active'));
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
}
