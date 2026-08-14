import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable } from "rxjs";
import { Operator } from "../models/person.models";
import { API_CONFIG, ApiConfigService } from "../config/api-config.service";
import { HttpClient } from "@angular/common/http";
import { Catalogue, CatalogsResponse, PrioridadAlarma, EstadoAsignacion, EstadoAlarma } from "../models/catalogue.models";

@Injectable({
  providedIn: "root",
})
export class CatalogueService {
  private supervisorsSubject = new BehaviorSubject<Operator[] | null>(null);
  private prioridadesSubject = new BehaviorSubject<PrioridadAlarma[] | null>(null);
  private estadosAsignacionSubject = new BehaviorSubject<Catalogue[] | null>(null);
  private estadosAlarmaSubject = new BehaviorSubject<EstadoAlarma[] | null>(null);

    public supervisors$ = this.supervisorsSubject.asObservable();
    public prioridades$ = this.prioridadesSubject.asObservable();
    public estadosAsignacion$ = this.estadosAsignacionSubject.asObservable();
    public estadosAlarma$ = this.estadosAlarmaSubject.asObservable(); 

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  initializeCatalogs(reload?: boolean): void {
    reload = reload ?? false;
    if (this.supervisorsSubject.value == null || reload) {
        this.getSupervisors().subscribe((supervisors) => {
        this.supervisorsSubject.next(supervisors);
        });
    }
    if (this.prioridadesSubject.value == null || reload) {
        this.getPrioridades().subscribe((prioridades) => {
        this.prioridadesSubject.next(prioridades);
        });
    }
    if (this.estadosAsignacionSubject.value == null || reload) {
        this.getEstadosAsignacion().subscribe((estadosAsignacion) => {
        this.estadosAsignacionSubject.next(estadosAsignacion);
        });
    }
    if (this.estadosAlarmaSubject.value == null || reload) {
        this.getEstadosAlarma().subscribe((estadosAlarma) => {
        this.estadosAlarmaSubject.next(estadosAlarma);
        }); 
    }
  }

  getSupervisors(): Observable<Operator[]> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${API_CONFIG.ENDPOINTS.CATALOG_SUPERVISORS}`,
    );
    console.log("[CatalogueService] GET SUPERVISORS →", url);
    return this.http.get<Operator[]>(url);
  }

  getPrioridades(): Observable<PrioridadAlarma[]> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_APP_MOVIL}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_PRIORITIES}`,
    );
    console.log("[CatalogueService] GET PRIORIDADES →", url);
    return this.http
      .get<CatalogsResponse>(url)
      .pipe(map((response: CatalogsResponse) => response.prioridades || []));
  }

  getEstadosAsignacion(): Observable<EstadoAsignacion[]> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${API_CONFIG.ENDPOINTS.CATALOG_ASSIGNMENT_STATES}`,
    );
    console.log("[CatalogueService] GET ESTADOS ASIGNACION →", url);
    return this.http
      .get<CatalogsResponse>(url)
      .pipe(
        map((response: CatalogsResponse) => response.estadosAsignacion || []),
      );
  }

  getEstadosAlarma(): Observable<EstadoAlarma[]> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_APP_MOVIL}${API_CONFIG.ENDPOINTS.CATALOG_ALARM_STATES}`,
    );
    console.log("[CatalogueService] GET ESTADOS ALARMA →", url);
    return this.http
      .get<CatalogsResponse>(url)
      .pipe(map((response: CatalogsResponse) => response.estadosAlarma || []));
  }

}