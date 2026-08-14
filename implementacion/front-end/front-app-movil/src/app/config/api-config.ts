/**
 * API Configuration
 * Based on: secureon-endpoints-payload.txt v1.0
 *
 * Gateway routes:
 *   /api/secure-on/seguridad/**           -> ms-seguridad:8093/api/seguridad/v1/**
 *   /api/secure-on/servicios-moviles/**    -> ms-app-movil:8091/api/app-movil/v1/**
 *   /api/secure-on/centro-de-monitoreo/** -> ms-cdm-control:8092/api/cdm-control/v1/**
 */
export const isDevelopment = true; // Set to false in production
const BASE_URL = isDevelopment ? '' : 'https://secure-on-dev.loca.lt'; // API Gateway base URL

export const API_CONFIG = {
  // API Gateway - Single entry point (Port 8090)
  // Microservice base URLs (all routed through API Gateway)
  MS_SECURITY: {
    baseUrl: BASE_URL + '/api/secure-on/seguridad/v1', // Replace 'VERSION' with the actual version if needed
    version: 'v1',
  },
  MS_APP_MOVIL: {
    baseUrl: BASE_URL + '/api/secure-on/servicios-moviles/v1',
    version: 'v1',
  },
  MS_CDM_CONTROL: {
    baseUrl: BASE_URL + '/api/secure-on/centro-de-monitoreo/v1',
    version: 'v1',
  },

  // Endpoints paths (all through API Gateway)
  ENDPOINTS: {
    // ──────────────────────────────────────────────
    // MS-SEGURIDAD - AppController
    // ──────────────────────────────────────────────

    // Auth - POST /api/seguridad/v1/app/...
    REGISTER: '/app/usuario/registrar', // POST - No auth
    LOGIN: '/app/auth/login', // POST - No auth
    LOGOUT: '/app/auth/logout', // GET - Auth (Authorization: Bearer <token>)
    REFRESH_TOKEN: '/app/auth/refresh', // POST - Auth
    FORGOT_PASSWORD: '/app/auth/olvide-password', // POST - No auth
    RESET_PASSWORD: '/app/auth/resetear-password', // POST - Auth

    // User profile - /seguridad/v1/app/usuario/...
    GET_USER_DATA: '/app/usuario/mis-datos', // GET - Auth
    UPDATE_USER_DATA: '/app/usuario/actualizar-datos', // PUT - Auth

    // Device - /seguridad/v1/app/dispositivo/...
    REGISTER_DEVICE: '/app/dispositivo/registrar', // POST - Auth

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - AlarmaController
    // ──────────────────────────────────────────────

    // Alarms - /servicios-moviles/v1/alarma/...
    NEW_ALARM: '/alarma/nueva', // POST - Auth
    ALARM_BASE: '/alarma', // Base for path-param endpoints:
    // POST /{alarmaId}/ubicacion   - Update alarm location
    // PUT  /{alarmaId}/finalizar   - Finalize alarm
    // POST /{alarmaId}/reactivar   - Reactivate alarm

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - ContactoController
    // ──────────────────────────────────────────────

    // Contacts - /servicios-moviles/v1/contacto/...
    ADD_CONTACT: '/contacto/nuevo', // POST - Auth
    CONTACT_BASE: '/contacto', // Base for path-param endpoints:
    // POST /{contactoId}/editar    - Edit contact
    // PUT  /{contactoId}/eliminar  - Delete contact

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - ConfiguracionController
    // ──────────────────────────────────────────────

    // Configuration - /servicios-moviles/v1/config/...
    CREATE_CONFIG: '/config/nueva', // POST - Auth
    GET_CONFIG: '/config/obtener', // POST - Auth (fetch local config)
    CONFIG_BASE: '/config', // Base for path-param endpoints:
    // POST /{configId}/editar      - Edit config

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - CatalogoController
    // ──────────────────────────────────────────────

    // Catalogs - /servicios-moviles/v1/catalogo/... (all GET, no auth, paginated)
    CATALOG_ALARM_STATES: '/catalogo/estados-alarma',
    CATALOG_NOTIFICATION_CHANNELS: '/catalogo/canales-notificacion',
    CATALOG_SEND_STATES: '/catalogo/estados-envio',
    CATALOG_LANGUAGES: '/catalogo/idiomas',
    CATALOG_ACTIVATION_METHODS: '/catalogo/metodos-activacion',
    CATALOG_LOCATION_METHODS: '/catalogo/metodos-ubicacion',
    CATALOG_ALARM_PRIORITIES: '/catalogo/prioridades-alarma',
    CATALOG_RELATIONSHIPS: '/catalogo/relaciones',
  },

  // WebSocket STOMP (MS-CDM-CONTROL Port 8092, through gateway)
  WEBSOCKET_URL: BASE_URL + '/ws/secure-on',
  WEBSOCKET_STOMP: '/api/secure-on',

  // WebSocket STOMP Topics
  WS_TOPICS: {
    ALARM_NEW: '/app/topic/alarma/nueva',
    ALARM_UPDATED: '/app/topic/alarma/actualizada',
    LOCATION_UPDATED: '/app/topic/ubicacion/actualizada',
    LOCATION_REALTIME: '/app/topic/ubicacion/realtime',
    OPERATOR_CONNECTED: '/app/topic/operador/conectado',
    OPERATOR_DISCONNECTED: '/app/topic/operador/desconectado',
    NOTIFICATIONS_QUEUE: '/app/queue/notificaciones',
    ASSIGNMENTS_QUEUE: '/app/queue/asignaciones',
  },

  // Timeouts
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Token
  TOKEN_STORAGE_KEY: 'auth_token',
  USER_STORAGE_KEY: 'user_data',
  DEVICE_ID_KEY: 'device_app_id',
  LOCATION_QUEUE_KEY: 'location_queue',
  PHOTO_QUEUE_KEY: 'photo_queue',
  AUDIO_QUEUE_KEY: 'audio_queue',
  ALARM_STATUS_KEY: 'alarm_status',
};


