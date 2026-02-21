# Arquitectura del Proyecto - Secureon Monitoring Dashboard

## 📋 Resumen Ejecutivo

**Secureon** es un dashboard frontend de monitoreo de alarmas en tiempo real, construido con **Angular 18**, **Tailwind CSS**, y **Socket.IO**. El sistema permite:

- Autenticación de usuarios con roles (Admin, Operador, Supervisor)
- Visualización en tiempo real de alertas en un mapa de Google Maps
- Gestión completa de incidentes (crear, editar, verificar, notificar)
- Actualizaciones instantáneas mediante WebSocket
- Control de acceso basado en roles

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────┐
│         APLICACIÓN ANGULAR 18               │
├─────────────────────────────────────────────┤
│  Componentes          │  Servicios          │
│  ├── Login            │  ├── AuthService    │
│  ├── Register         │  ├── AlertService   │
│  ├── Dashboard        │  ├── SocketService  │
│  └── AlertDetail      │  └── ApiConfig      │
├─────────────────────────────────────────────┤
│  HTTP Client + Interceptors                 │
│  Socket.IO Client                           │
├─────────────────────────────────────────────┤
│  Google Maps API      Tailwind CSS          │
└─────────────────────────────────────────────┘
         ↓                  ↓
    ┌─────────────────────────────┐
    │  Microservicios Backend     │
    │  - Auth MS                  │
    │  - Alerts MS                │
    │  - Notifications MS         │
    └─────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
front-end/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── register/
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── register.component.css
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.css
│   │   │   └── alert-detail/
│   │   │       ├── alert-detail.component.ts
│   │   │       ├── alert-detail.component.html
│   │   │       └── alert-detail.component.css
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Autenticación
│   │   │   ├── alert.service.ts       # Gestión de alertas
│   │   │   └── socket.service.ts      # WebSocket eventos
│   │   │
│   │   ├── models/
│   │   │   ├── auth.models.ts         # Interfaces de auth
│   │   │   └── alert.models.ts        # Interfaces de alertas
│   │   │
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Protección de rutas
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Inyectar token JWT
│   │   │
│   │   ├── config/
│   │   │   └── api-config.service.ts  # URLs de API
│   │   │
│   │   ├── app.routes.ts              # Routing
│   │   └── app.component.ts           # Component raíz
│   │
│   ├── environments/
│   │   ├── environment.ts             # Dev config
│   │   └── environment.prod.ts        # Prod config
│   │
│   ├── styles.css                     # Estilos globales
│   ├── index.html                     # HTML principal
│   └── main.ts                        # Entry point
│
├── angular.json                       # Configuración Angular
├── tsconfig.json                      # Configuración TypeScript
├── tsconfig.app.json                  # App-specific TypeScript
├── tailwind.config.js                 # Configuración Tailwind
├── postcss.config.js                  # Configuración PostCSS
├── package.json                       # Dependencias
├── .env.example                       # Template variables
├── .gitignore                         # Git ignore rules
│
├── README.md                          # Documentación principal
└── QUICKSTART.md                      # Guía rápida
```

## 🔄 Flujo de Autenticación

```
Usuario
  ↓
Login Form
  ↓
AuthService.login()
  ↓
HTTP POST /api/auth/login
  ↓
Backend valida credenciales
  ↓
Retorna JWT Token + User
  ↓
AuthService almacena (localStorage)
  ↓
AuthGuard permite acceso
  ↓
Dashboard
```

## 🔌 Flujo de Alertas en Tiempo Real

```
Backend Event
  ↓
Socket.IO Emit: 'alert:created'
  ↓
SocketService.alertCreated$
  ↓
DashboardComponent.subscribe()
  ↓
AlertService.addOrUpdateAlert()
  ↓
UI Re-render
```

## 📊 Modelos de Datos

### User (Autenticación)
```typescript
{
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'operator' | 'supervisor';
  phone?: string;
  address?: string;
  isActive: boolean;
}
```

### Alert (Alarma)
```typescript
{
  id: string;
  userId: string;
  userName: string;
  type: 'panic' | 'intrusion' | 'medical' | 'supervision' | 'system' | 'device';
  status: 'active' | 'review' | 'dispatched' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  location: { latitude, longitude, timestamp, accuracy };
  locationHistory: Location[];
  createdAt: Date;
  operatorId?: string;
  evidenceUrls?: string[];
  nearbyAuthorities?: Authority[];
}
```

## 🔐 Seguridad

### JWT Tokens
- Almacenado en `localStorage`
- Enviado en header `Authorization: Bearer <token>`
- Validación en Backend requerida

### Auth Interceptor
- Inyecta token en cada request HTTP
- Maneja errores 401 → Redirige a login
- Mantiene sesión actual

### Role-Based Access Control (RBAC)
```
Admin      → Puede registrar usuarios, ver todas las alertas
Supervisor → Puede gestionar alertas, ver todas las alertas
Operator   → Solo ve sus alertas asignadas
```

## 🔄 State Management

### BehaviorSubjects (Observables)
```typescript
// Autenticación
authService.currentUser$  // Usuario actual
authService.isAuthenticated$

// Alertas
alertService.alerts$      // Lista de alertas
alertService.selectedAlert$

// Socket
socketService.isConnected$
socketService.alertCreated$
socketService.alertUpdated$
socketService.locationUpdated$
```

## 📡 Integración con APIs

### Endpoints Esperados

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/alerts?page=1&pageSize=20
GET    /api/alerts/:id
GET    /api/alerts/operator/:operatorId
PATCH  /api/alerts/:id
PATCH  /api/alerts/:id/status
GET    /api/alerts/active
```

### Socket.IO Events

```
// Cliente escucha
alert:created         → Nueva alarma
alert:updated         → Alarma modificada
alert:location        → Componentes de ubicación

// Cliente emite
alert:acknowledge     → Confirmar recepción
```

## 🎯 Componentes Detallados

### 1. LoginComponent
- Formulario de autenticación
- Validación en cliente
- Manejo de errores
- Redirección post-login

### 2. RegisterComponent
- Registro de nuevos operadores
- Solo accesible por admins
- Validación de contraseñas
- Confirmación de campos

### 3. DashboardComponent
- Panel principal
- Mapa con marcadores
- Lista paginable de alertas
- Menú lateral
- Actualizaciones en tiempo real
- Socket.IO conectado

### 4. AlertDetailComponent
- Cuatro modos de visualización
- Edit/Verify/Notify/View
- Mapa expandido
- Historial de ubicaciones
- Mostrar ruta en mapa
- Autoridades cercanas
- Evidencia capturada

## 🎨 Diseño UI/UX

### Tema
- **Modo Oscuro**: Optimizado para monitoreo 24/7
- **Colores Primarios**: Azul (#183daa), Rojo (alertas), Verde (activo)
- **Tailwind CSS**: Utilidades de diseño responsivo

### Responsive
- Mobile (320px - 640px)
- Tablet (641px - 1024px)
- Desktop (1025px+)

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^18.0.0",
  "@angular/forms": "^18.0.0",
  "@angular/router": "^18.0.0",
  "socket.io-client": "^4.7.2",
  "@googlemaps/js-api-loader": "^1.16.2",
  "tailwindcss": "^3.4.1",
  "rxjs": "^7.8.1"
}
```

## 🚀 Ciclo de Vida

```
ng serve (Development)
    ↓
compilación TypeScript → JavaScript
    ↓
Tailwind CSS → CSS compilado
    ↓
Angular Bootstrap en index.html
    ↓
AppComponent
    ↓
Router → Login o Dashboard
```

## 🔄 Flujo CI/CD Recomendado

```
Git Push
  ↓
npm install
  ↓
ng lint
  ↓
ng test
  ↓
ng build --prod
  ↓
Deploy a servidor
```

## 📊 Rendimiento

### Optimizaciones Implementadas
- Lazy loading de rutas (futuro)
- Change Detection OnPush (futuro)
- Tree-shaking con AOT compilation
- Minificación CSS/JS en producción
- Production mode habilitado

## 🔍 Debugging

### Chrome DevTools
```javascript
// En la consola
ng.getComponent(document.querySelector('app-dashboard'))
localStorage.getItem('token')
localStorage.getItem('user')
```

### Angular Devtools Extension
- Instalable desde Chrome Web Store
- Inspeccionar componentes
- Ver cambios de estado
- Profiling de rendimiento

## 📝 Logs Implementados

```typescript
// Socket.IO
console.log('Socket connected')
console.log('Socket disconnected')

// Alertas
console.log('Alert loaded')
console.log('Error loading alert')

// Autenticación
console.log('User logged in')
console.log('User logged out')
```

## 🎯 Próximas Mejoras

- [ ] Lazy loading de componentes
- [ ] Paginación lazy en lista
- [ ] Caché de alertas
- [ ] Filtros avanzados
- [ ] Exportación de reportes
- [ ] Multi-idioma (i18n)
- [ ] PWA offline support
- [ ] Push notifications
- [ ] Analytics
- [ ] Dark/Light mode toggle

---

**Versión**: 1.0.0
**Última actualización**: Febrero 2026
**Autor**: Securitas Group
