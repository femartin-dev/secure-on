import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, Supervisor } from '../models/auth.models';
import { ApiConfigService } from '../config/api-config.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUserSubject.asObservable().pipe(
    tap(user => user !== null)
  );

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = this.apiConfig.getApiUrl('/seguridad/v1/cdm/auth/login');
    // Detectar si es web y agregar appId mock

    const payload: any = {
      email: `${credentials.username ?? ''}`.trim(),
      password: credentials.password
    };
    console.log(
      '[AuthService] LOGIN →',
      url,
      environment.logSensitiveData ? payload : { email: payload.email, password: '[REDACTED]' }
    );
    return this.http.post<AuthResponse>(url, payload).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap(({ token, user }) => this.storeAuth(token, user)),
      catchError((error) => {
        console.error('[AuthService] LOGIN error ←', {
          url,
          status: (error as { status?: unknown })?.status,
          error: (error as { error?: unknown })?.error
        });
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const supervisorId = `${data.supervisorId ?? ''}`.trim();
    const esAdministrador = supervisorId.length === 0;
    const endpoint = esAdministrador
      ? '/seguridad/v1/cdm/administrador/registrar'
      : '/seguridad/v1/cdm/operador/registrar';
    const url = this.apiConfig.getApiUrl(endpoint);

    const legajoRaw = (data as unknown as { legajo?: unknown }).legajo;
    const legajoParsed =
      legajoRaw === null || legajoRaw === undefined || `${legajoRaw}`.trim().length === 0
        ? undefined
        : Number(legajoRaw);

    const payload: Record<string, unknown> = {
      nombre: `${data.firstName ?? ''}`.trim(),
      apellido: `${data.lastName ?? ''}`.trim(),
      email: `${data.email ?? ''}`.trim(),
      telefono: `${data.phone ?? ''}`.trim(),
      direccion: `${data.address ?? ''}`.trim(),
      password: data.password,
      esAdministrador
    };

    if (legajoParsed !== undefined && Number.isFinite(legajoParsed)) {
      payload['legajo'] = legajoParsed;
    }

    if (!esAdministrador) {
      payload['supervisorId'] = supervisorId;
    }

    console.log('[AuthService] REGISTER →', url);
    console.log('[AuthService] REGISTER payload →', payload);
    return this.http.post<AuthResponse>(url, payload).pipe(
      map((response) => this.normalizeRegisterResponse(response))
    );
  }

  /**
   * Normalize register response which may or may not include a token.
   * If the backend returns a token we delegate to normalizeAuthResponse.
   * Otherwise we map the returned operador object into a User and
   * return an AuthResponse-like object with an empty token (caller
   * should not rely on token being present after registration).
   */
  private normalizeRegisterResponse(response: unknown): AuthResponse {
    const record = response as Record<string, unknown>;

    // If token present, keep existing normalization (and validation).
    const maybeToken = `${record?.['token'] ?? ''}`.trim();
    if (maybeToken) {
      return this.normalizeAuthResponse(response);
    }

    // Example flat register response may contain operadorId, usuario, nombre, apellido, legajo, email, esAdministrador
    const operadorId = `${record['operadorId'] ?? record['id'] ?? ''}`.trim();
    const email = `${record['email'] ?? ''}`.trim();
    const firstName = `${record['nombre'] ?? record['firstName'] ?? ''}`.trim();
    const lastName = `${record['apellido'] ?? record['lastName'] ?? ''}`.trim();
    const username = `${record['usuario'] ?? record['username'] ?? email}`.trim() || email;
    const esAdministrador = Boolean(record['esAdministrador']);

    const user: User = {
      id: operadorId || crypto.randomUUID(),
      username,
      email,
      firstName: firstName || 'Usuario',
      lastName: lastName || '',
      role: esAdministrador ? 'admin' : 'operator',
      phone: `${record['telefono'] ?? record['phone'] ?? ''}`.trim() || undefined,
      address: `${record['direccion'] ?? record['address'] ?? ''}`.trim() || undefined,
      isActive: (record['isActive'] as boolean | undefined) ?? true,
      lastLogin: undefined
    };

    console.log('[AuthService] REGISTER response normalized (no token) →', user);
    return { token: '', user };
  }

  private normalizeAuthResponse(response: unknown): AuthResponse {
    if (!response || typeof response !== 'object') {
      throw new Error('Respuesta de autenticación inválida');
    }

    const record = response as Record<string, unknown>;
    const token = `${record['token'] ?? ''}`.trim();
    if (!token) {
      throw new Error('Respuesta de autenticación sin token');
    }

    // If backend already returns the expected shape, accept it.
    const nestedUser = record['user'] as unknown;
    if (nestedUser && typeof nestedUser === 'object') {
      return {
        token,
        user: nestedUser as User
      };
    }

    // Flat backend shape example:
    // { token, type, id, email, nombre, apellido, dispositivoId, expiracion }
    const email = `${record['email'] ?? ''}`.trim();
    const firstName = `${record['nombre'] ?? record['firstName'] ?? ''}`.trim();
    const lastName = `${record['apellido'] ?? record['lastName'] ?? ''}`.trim();

    const resolvedRole = this.inferRole(record, token);

    const user: User = {
      id: `${record['id'] ?? ''}`.trim() || crypto.randomUUID(),
      username: `${record['username'] ?? email}`.trim() || email,
      email,
      firstName: firstName || 'Usuario',
      lastName: lastName || '',
      role: resolvedRole,
      phone: `${record['telefono'] ?? record['phone'] ?? ''}`.trim() || undefined,
      address: `${record['address'] ?? ''}`.trim() || undefined,
      isActive: (record['isActive'] as boolean | undefined) ?? true,
      lastLogin: new Date()
    };

    return { token, user };
  }

  private inferRole(record: Record<string, unknown>, token: string): User['role'] {
    const roleFromResponse = `${record['role'] ?? ''}`.trim();
    if (roleFromResponse === 'admin' || roleFromResponse === 'operator' || roleFromResponse === 'supervisor') {
      return roleFromResponse;
    }

    const jwtPayload = this.tryDecodeJwtPayload(token);
    if (jwtPayload && typeof jwtPayload === 'object') {
      const jwtRecord = jwtPayload as Record<string, unknown>;

      const directRole = `${jwtRecord['role'] ?? ''}`.trim();
      if (directRole === 'admin' || directRole === 'operator' || directRole === 'supervisor') {
        return directRole;
      }

      const roles = jwtRecord['roles'] ?? jwtRecord['authorities'] ?? jwtRecord['scopes'] ?? jwtRecord['scope'];
      const roleStrings: string[] = Array.isArray(roles)
        ? roles.map((r) => `${r}`)
        : typeof roles === 'string'
          ? roles.split(/[\s,]+/).filter(Boolean)
          : [];

      const normalized = roleStrings.map((r) => r.toUpperCase());
      if (normalized.some((r) => r.includes('ADMIN'))) {
        return 'admin';
      }
      if (normalized.some((r) => r.includes('SUPERVISOR'))) {
        return 'supervisor';
      }
      if (normalized.some((r) => r.includes('OPERATOR') || r.includes('OPERADOR'))) {
        return 'operator';
      }
    }

    // Fallback (backend response shown does not include role)
    return 'operator';
  }

  private tryDecodeJwtPayload(token: string): unknown | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = decodeURIComponent(
        Array.from(atob(padded))
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getSupervisors(): Observable<Supervisor[]> {
    const url = this.apiConfig.getApiUrl('/centro-de-monitoreo/v1/catalogo/supervisores');
    console.log('[AuthService] GET SUPERVISORS →', url);
    return this.http.get<Supervisor[]>(url);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  private storeAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
