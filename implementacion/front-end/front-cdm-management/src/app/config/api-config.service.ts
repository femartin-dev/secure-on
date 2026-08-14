import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class ApiConfigService {
  baseUrl = environment.apiUrl;
  socketUrl = environment.socketUrl;
  googleMapsApiKey = environment.googleMapsApiKey;

  constructor() {}

  getApiUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  getSocketUrl(wsEndpoint?: string): string {
    return `${this.socketUrl}${wsEndpoint ?? ''}`;
  }

  getGoogleMapsKey(): string {
    return this.googleMapsApiKey;
  }

  buildEndpointPathVar(endpoint: string, params: Record<string, string>): string {
    return endpoint.replace(/\{(\w+)\}/g, (_, key) => params[key]);
  }

  buildQueryParams(params: Record<string, any>): string {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return queryString ? `${queryString}` : '';
  }

}

export const API_CONFIG = {
  // API Gateway - Single entry point (Port 8090)
  // Microservice base URLs (all routed through API Gateway)
  MS_SECURITY: "/api/secure-on/seguridad/v1",
  MS_APP_MOVIL: "/api/secure-on/servicios-moviles/v1",
  MS_CDM_CONTROL: "/api/secure-on/centro-de-monitoreo/v1",

  ENDPOINTS: {
    // ──────────────────────────────────────────────
    // MS-SEGURIDAD - AppController
    // ──────────────────────────────────────────────

    // Auth - POST /api/seguridad/v1/app/...
    REGISTER_OPERATOR: "/cdm/operador/registrar", // POST - No auth
    REGISTER_ADMIN: "/cdm/administrador/registrar", // POST - No auth
    LOGIN: "/cdm/auth/login", // POST - No auth
    LOGOUT: "/cdm/auth/logout", // GET - Auth (Authorization: Bearer <token>)
    REFRESH_TOKEN: "/cdm/auth/refresh", // POST - Auth
    FORGOT_PASSWORD: "/cdm/auth/olvide-password", // POST - No auth
    RESET_PASSWORD: "/cdm/auth/resetear-password", // POST - Auth

    GET_USER_DATA: "/cdm/operador/mis-datos", // GET - Auth
    UPDATE_USER_DATA: "/cdm/operador/actualizar-datos", // PUT - Auth

    // Alarms
    FILTER_ALARMS: "/dashboard/alarma/filtrar", // POST - Auth
    GET_ALARM: "/dashboard/alarma/{alarmaId}/obtener", // Base for path-param endpoints:
    ALARM_LOCATIONS: "/dashboard/alarma/{alarmaId}/ubicaciones", // GET -
    ALARM_EVIDENCES: "/dashboard/alarma/{alarmaId}/evidencias", // GET -
    ALARM_STATE_CHANGE: "/dashboard/alarma/{alarmaId}/cambiar-estado", // PUT - Auth
    ALARM_PRIORITY_CHANGE: "/dashboard/alarma/{alarmaId}/cambiar-prioridad", // PUT - Auth
    ALARM_ASSIGN_TO: "/dashboard/alarma/{alarmaId}/asignar/{operadorId}", // PUT - Auth

    // Catalogs
    CATALOG_ASSIGNMENT_STATES: "/catalogo/estados-asignacion",
    CATALOG_AUTHORITIES_TYPE: "/catalogo/tipos-autoridad",
    CATALOG_SUPERVISORS: "/catalogo/supervisores",
    CATALOG_ALARM_STATES: "/catalogo/estados-alarma",
    CATALOG_ALARM_PRIORITIES: "/catalogo/prioridades-alarma",
  },

  // WebSocket STOMP (MS-CDM-CONTROL Port 8092, through gateway)
  WEBSOCKET_URL: "/ws/secure-on",
  WEBSOCKET_STOMP: "/api/secure-on",

  // WebSocket STOMP Topics
  WS_TOPICS: {
    ALARM_NEW: "/app/topic/alarma/nueva",
    ALARM_UPDATED: "/app/topic/alarma/actualizada",
    LOCATION_UPDATED: "/app/topic/ubicacion/actualizada",
    LOCATION_REALTIME: "/app/topic/ubicacion/realtime",
    OPERATOR_CONNECTED: "/app/topic/operador/conectado",
    OPERATOR_DISCONNECTED: "/app/topic/operador/desconectado",
    NOTIFICATIONS_QUEUE: "/app/queue/notificaciones",
    ASSIGNMENTS_QUEUE: "/app/queue/asignaciones",
  },

  // Timeouts
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Token
  TOKEN_STORAGE_KEY: "auth_token",
  USER_STORAGE_KEY: "user_data",
  DEVICE_ID_KEY: "device_app_id",
  LOCATION_QUEUE_KEY: "location_queue",
  PHOTO_QUEUE_KEY: "photo_queue",
  AUDIO_QUEUE_KEY: "audio_queue",
  ALARM_STATUS_KEY: "alarm_status",
};