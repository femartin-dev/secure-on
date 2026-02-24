/**
 * API Configuration
 * Based on: secureon-endpoints-payload.txt v1.0
 *
 * Gateway routes:
 *   /api/secure-on/seguridad/**           -> ms-seguridad:8093/api/seguridad/v1/**
 *   /api/secure-on/servicios-moviles/**    -> ms-app-movil:8091/api/app-movil/v1/**
 *   /api/secure-on/centro-de-monitoreo/** -> ms-cdm-control:8092/api/cdm-control/v1/**
 */

export const API_CONFIG = {
  // API Gateway - Single entry point (Port 8090)
  API_GATEWAY: {
    baseUrl: 'http://localhost:8090/api/secure-on',
  },

  // Microservice base URLs (all routed through API Gateway)
  MS_SECURITY: {
    baseUrl: 'http://localhost:8090/api/secure-on',
    version: 'v1'
  },
  MS_APP_MOVIL: {
    baseUrl: 'http://localhost:8090/api/secure-on',
    version: 'v1'
  },
  MS_CDM_CONTROL: {
    baseUrl: 'http://localhost:8090/api/secure-on',
    version: 'v1'
  },
  MS_API_GATEWAY: {
    baseUrl: 'http://localhost:8090/api/secure-on',
    version: 'v1'
  },

  // Endpoints paths (all through API Gateway)
  ENDPOINTS: {
    // ──────────────────────────────────────────────
    // MS-SEGURIDAD - AppController
    // ──────────────────────────────────────────────

    // Auth - POST /api/seguridad/v1/app/...
    REGISTER: '/seguridad/v1/app/usuario/registrar',           // POST - No auth
    LOGIN: '/seguridad/v1/app/auth/login',                     // POST - No auth
    LOGOUT: '/seguridad/v1/app/auth/logout',                   // POST - Auth (query: dispositivoAppId)
    REFRESH_TOKEN: '/seguridad/v1/app/auth/refrescar-token',   // POST - Auth
    FORGOT_PASSWORD: '/seguridad/v1/app/auth/olvide-password', // POST - No auth
    RESET_PASSWORD: '/seguridad/v1/app/auth/resetear-password',// POST - Auth

    // User profile - /seguridad/v1/app/usuario/...
    GET_USER_DATA: '/seguridad/v1/app/usuario/mis-datos',      // GET - Auth
    UPDATE_USER_DATA: '/seguridad/v1/app/usuario/actualizar-datos', // PUT - Auth

    // Device - /seguridad/v1/app/dispositivo/...
    REGISTER_DEVICE: '/seguridad/v1/app/dispositivo/registrar', // POST - Auth

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - AlarmaController
    // ──────────────────────────────────────────────

    // Alarms - /servicios-moviles/v1/alarma/...
    NEW_ALARM: '/servicios-moviles/v1/alarma/nueva',           // POST - Auth
    ALARM_BASE: '/servicios-moviles/v1/alarma',                // Base for path-param endpoints:
    // POST /{alarmaId}/ubicacion   - Update alarm location
    // PUT  /{alarmaId}/finalizar   - Finalize alarm
    // POST /{alarmaId}/reactivar   - Reactivate alarm

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - ContactoController
    // ──────────────────────────────────────────────

    // Contacts - /servicios-moviles/v1/contacto/...
    ADD_CONTACT: '/servicios-moviles/v1/contacto/nuevo',       // POST - Auth
    CONTACT_BASE: '/servicios-moviles/v1/contacto',            // Base for path-param endpoints:
    // POST /{contactoId}/editar    - Edit contact
    // PUT  /{contactoId}/eliminar  - Delete contact

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - ConfiguracionController
    // ──────────────────────────────────────────────

    // Configuration - /servicios-moviles/v1/config/...
    CREATE_CONFIG: '/servicios-moviles/v1/config/nuevo',       // POST - Auth
    NEW_CONFIG: '/servicios-moviles/v1/config/nueva',          // POST - Auth (default config)
    GET_CONFIG: '/servicios-moviles/v1/config/obtener',        // POST - Auth (fetch local config)
    CONFIG_BASE: '/servicios-moviles/v1/config',               // Base for path-param endpoints:
    // POST /{configId}/editar      - Edit config

    // ──────────────────────────────────────────────
    // MS-APP-MOVIL - CatalogoController
    // ──────────────────────────────────────────────

    // Catalogs - /servicios-moviles/v1/catalogo/... (all GET, no auth, paginated)
    CATALOG_ALARM_STATES: '/servicios-moviles/v1/catalogo/estados-alarma',
    CATALOG_NOTIFICATION_CHANNELS: '/servicios-moviles/v1/catalogo/canales-notificacion',
    CATALOG_SEND_STATES: '/servicios-moviles/v1/catalogo/estados-envio',
    CATALOG_LANGUAGES: '/servicios-moviles/v1/catalogo/idiomas',
    CATALOG_ACTIVATION_METHODS: '/servicios-moviles/v1/catalogo/metodos-activacion',
    CATALOG_LOCATION_METHODS: '/servicios-moviles/v1/catalogo/metodos-ubicacion',
    CATALOG_ALARM_PRIORITIES: '/servicios-moviles/v1/catalogo/prioridades-alarma',
  },

  // WebSocket STOMP (MS-CDM-CONTROL Port 8092, through gateway)
  WEBSOCKET_URL: 'ws://localhost:8090/ws/secure-on',
  WEBSOCKET_STOMP: '/api/secure-on',

  // WebSocket STOMP Topics
  WS_TOPICS: {
    ALARM_NEW: '/app/topic/alarma/nueva',
    ALARM_UPDATED: '/app/topic/alarma/actualizada',
    LOCATION_UPDATED: '/app/topic/ubicacion/actualizada',
    LOCATION_REALTIME: '/topic/ubicacion/realtime',
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
  DEVICE_ID_KEY: 'device_app_id'
};

export const isDevelopment = true; // Set to false in production
