import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse} from '../models/auth.models';
import { ApiConfigService, API_CONFIG } from '../config/api-config.service';
import { environment } from '../../environments/environment';
import { Operator, TipoUsuario, User } from '../models/person.models';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Operator | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUserSubject
    .asObservable()
    .pipe(tap((user) => user !== null));

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string, tipo: string): Observable<LoginResponse> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_SECURITY}${API_CONFIG.ENDPOINTS.LOGIN}`,
    );
    const payload: any = {
      [tipo]: username,
      password: password,
    };
    let logPayload: any = environment.logSensitiveData
      ? payload
      : { [tipo]: payload[tipo], password: "*".repeat(8) };
    console.log("[AuthService] LOGIN →", url, logPayload);
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => this.storeAuth(response)),
      catchError((error) => {
        console.error("[AuthService] LOGIN error ←", {
          url,
          status: (error as { status?: unknown })?.status,
          error: (error as { error?: unknown })?.error,
        });
        return throwError(() => error);
      }),
    );
  }

  register(data: RegisterRequest): Observable<Operator> {
    const endpoint = data.esAdministrador
      ? API_CONFIG.ENDPOINTS.REGISTER_ADMIN
      : API_CONFIG.ENDPOINTS.REGISTER_OPERATOR;
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_SECURITY}${endpoint}`,
    );

    console.log("[AuthService] REGISTER →", url);
    console.log("[AuthService] REGISTER payload →", data);
    return this.http.post<RegisterResponse>(url, data).pipe(
      map((response) => {
        const user: Operator = {
          id: response.operadorId,
          nombre: response.nombre,
          apellido: response.apellido,
          email: response.email,
          activo: true,
          esAdministrador: response.esAdministrador,
          legajo: response.legajo,
          tipo: response.tipo || TipoUsuario.OPERADOR,
        };
        return user;
      }),
      catchError((error) => {
        console.error("[AuthService] REGISTER error ←", {
          url,
          status: (error as { status?: unknown })?.status,
          error: (error as { error?: unknown })?.error,
        });
        return throwError(() => error);
      }),
    );
  }

  getSupervisors(): Observable<Operator[]> {
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_CDM_CONTROL}${API_CONFIG.ENDPOINTS.CATALOG_SUPERVISORS}`,
    );
    console.log("[AuthService] GET SUPERVISORS →", url);
    return this.http.get<Operator[]>(url);
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    const url = this.apiConfig.getApiUrl(
      `${API_CONFIG.MS_SECURITY}${API_CONFIG.ENDPOINTS.LOGOUT}`,
    );
    this.http.get<string>(url);
  }

  private storeAuth(response: LoginResponse): void {
    localStorage.setItem("token", response.token);
    localStorage.setItem("expiration", response.expiracion);
    const user: Operator = {
      id: response.id,
      nombre: response.nombre,
      apellido: response.apellido,
      email: response.email,
      activo: true,
      esAdministrador: response.esAdministrador,
      legajo: response.legajo,
    };
    localStorage.setItem("user", JSON.stringify(user));
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.esAdministrador === true;
  }

  getCurrentUser(): Operator | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
