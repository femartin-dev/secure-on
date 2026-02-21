# Testing Guide - Dashboard Secure-On

## Quick Testing Without Backend

### 1. Mock Data Setup

Si no tienes un backend disponible, puedes usar los mocks para testing:

```typescript
// En dashboard.component.ts
import { MOCK_ALERTS, getMockPaginatedAlerts } from '../mocks/mock-data';

// En lugar de:
// this.alertService.getAlerts().subscribe(...)

// Usa:
this.alerts = MOCK_ALERTS;
this.totalAlerts = MOCK_ALERTS.length;
```

### 2. Login Credentials (Testing)

```
Admin:
- Username: admin
- Password: admin123
- Role: admin (puede registrar usuarios)

Operator:
- Username: operator
- Password: operator123
- Role: operator (ve solo sus alertas)

Supervisor:
- Username: supervisor
- Password: supervisor123
- Role: supervisor
```

### 3. Testing Scenarios

#### Escenario 1: Admin Login
1. Abre `http://localhost:4200/login`
2. Ingresa credencial admin
3. Verás acceso a `/register` en menú
4. Dashboard muestra todas las alertas

#### Escenario 2: Operator Login
1. Login como operator
2. Dashboard solo muestra alertas asignadas a su ID
3. Sin acceso a `/register`

#### Escenario 3: Alert Detail Modes

**Mode: View (Solo lectura)**
```
- Status: deshabilitado ❌
- Priority: deshabilitado ❌
- Notes: deshabilitado ❌
- Botón: "Editar" habilitado ✓
```

**Mode: Edit (Editar detalles)**
```
- Status: habilitado ✓
- Priority: habilitado ✓
- Notes: deshabilitado ❌
- Botón: "Guardar" y "Verificar" habilitados ✓
```

**Mode: Verify (Verificación)**
```
- Status: habilitado ✓
- Priority: deshabilitado ❌
- Notes: deshabilitado ❌
- Botón: "Notificar" habilitado ✓
```

**Mode: Notify (Notificación a autoridades)**
```
- Status: deshabilitado ❌
- Priority: deshabilitado ❌
- Notes: habilitado ✓ (para agregar notas)
- Sección: "Autoridades" visible
- Botón: "Enviar Notificación" habilitado ✓
```

## Backend Integration Testing

### 1. Endpoints Necesarios

Asegúrate que tu backend implemente estos endpoints:

#### Authentication
```
POST /auth/login
- Body: { username: string, password: string }
- Response: { token: string, user: User }

POST /auth/register
- Body: { username, password, email, ... }
- Headers: { Authorization: "Bearer {token}" }
- Response: { user: User }
```

#### Alerts
```
GET /alerts?page=1&pageSize=20
- Headers: { Authorization: "Bearer {token}" }
- Response: PaginatedAlerts

GET /alerts/operator/:operatorId?page=1
- Response: Alertas filtradas por operador

GET /alerts/:id
- Response: Alert completa con historia

PUT /alerts/:id
- Body: { status, priority, notes }
- Response: Alert actualizada
```

### 2. Socket.IO Events

Configura estos eventos en tu backend:

```javascript
// Server-side socket events
socket.on('alert:subscribe', (userId) => {
  // Usuario se suscribe a actualizaciones
});

socket.emit('alert:created', {
  id, userId, type, status, priority, location, ...
});

socket.emit('alert:updated', {
  id, status, priority, updatedAt, ...
});

socket.emit('alert:location', {
  alertId, location: { latitude, longitude, timestamp }
});
```

### 3. CORS Configuration

Backend debe permitir requests desde frontend:

```javascript
// Express example
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

## Component Testing

### Dashboard Component Tests

```bash
# Ejecutar tests
npm run test

# Con coverage
npm run test:coverage
```

### Manual Component Verification

1. **Header & Navigation**
   - [ ] Logo visible
   - [ ] Botón menú funciona
   - [ ] Drawer abre/cierra
   - [ ] Información de usuario visible
   - [ ] Botón logout funciona

2. **Map Container**
   - [ ] Google Maps carga
   - [ ] Zoom y pan funcionan
   - [ ] Marcadores de alertas visibles

3. **Alert List**
   - [ ] Alertas se muestran correctamente
   - [ ] Colores de tipo y prioridad correctos
   - [ ] Click en alerta abre detalle

4. **Pagination**
   - [ ] Botones next/prev funcionan
   - [ ] Input de página funciona
   - [ ] Total de páginas calcula bien

5. **Real-time Updates**
   - [ ] Nueva alerta aparece en lista
   - [ ] Marcador se agrega al mapa
   - [ ] Status Update actualiza UI
   - [ ] Location Update actualiza ruta

### Alert Detail Component Tests

1. **View Mode**
   - [ ] Solo lectura todos los campos
   - [ ] Botón "Editar" visible

2. **Edit Mode**
   - [ ] Campos status y priority editables
   - [ ] Cambios se reflejan
   - [ ] Botón "Guardar" funciona

3. **Map with Route**
   - [ ] Location history dibuja ruta
   - [ ] Markers en inicio/fin
   - [ ] Route visualmente clara

4. **Authorities Section**
   - [ ] Solo visible en modo Notify
   - [ ] Información de autoridades correcta
   - [ ] Distancia y ETA calculos

## Debugging Tips

### LocalStorage
```javascript
// En browser console
localStorage.getItem('token'); // Ver JWT
localStorage.getItem('user'); // Ver datos usuario
localStorage.clear(); // Limpiar todo (logout forzado)
```

### Network Requests
```
DevTools > Network tab:
- Filtrar por "Fetch/XHR"
- Ver Headers: Authorization: "Bearer {token}"
- Ver Response: JSON data
```

### Socket.IO Connection
```javascript
// En console
window.io; // Verificar Socket.IO cliente cargado
// Socket connection logs en Components
```

### RxJS Debugging
```typescript
// En service/component
this.alerts$.pipe(
  tap(alerts => console.log('Alerts updated:', alerts))
).subscribe(alerts => {
  // UI update
});
```

## Performance Testing

### Bundle Size
```bash
npm run build
# Check dist/ folder size
# Debe ser < 500KB
```

### Page Load Time
```
DevTools > Lighthouse:
1. Auditar en Mobile
2. Verificar Performance > 80
```

### Real-time Performance
```
DevTools > Performance tab:
1. Grabar 10 segundos
2. Buscar "long tasks"
3. Verificar FPS > 30
```

## Checklist Pre-Deployment

- [ ] Google Maps API key configurada
- [ ] API_URL en environment apunta a backend
- [ ] SOCKET_URL en environment apunta a Socket.IO server
- [ ] JWT token manejo funcionando
- [ ] Logout limpia localStorage
- [ ] No hay console errors
- [ ] Responsive design en mobile
- [ ] Dark mode se ve correcto
- [ ] Todos los endpoints respondiendo
- [ ] Socket.IO eventos fluyendo

## Common Issues & Solutions

### "Google Maps failed to load"
```typescript
// Verifica en environment.ts
GOOGLE_MAPS_API_KEY: 'tu-api-key-actual'
```

### "401 Unauthorized"
```typescript
// Token expirado o inválido
// Interceptor debe hacer logout automático
localStorage.clear();
// Redirect a /login
```

### "Cannot read property 'latitude' of undefined"
```typescript
// Location es null/undefined
// En alert service, verificar que location existe
if (alert.location && alert.location.latitude) {
  // Procesar
}
```

### "Socket not connecting"
```javascript
// Verificar:
// 1. Backend Socket.IO escuchando
// 2. CORS habilitado
// 3. URL correcta en environment
// 4. Token pasado en auth
```

## Contact & Support

Para más información:
- Ver ARCHITECTURE.md - Detalles técnicos
- Ver BACKEND_INTEGRATION.md - Especificaciones API
- Ver README.md - Información general
