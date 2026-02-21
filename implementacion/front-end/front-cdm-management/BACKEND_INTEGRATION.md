# Guía de Implementación - Backend Integration

## 🔗 Conectar con tu Backend

Esta guía te ayudará a integrar el dashboard con tu microservicio backend.

## 1️⃣ Configurar URLs de API

### Archivo: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // ← Cambia este valor
  socketUrl: 'http://localhost:3000',   // ← Cambia este valor
  googleMapsApiKey: 'YOUR_KEY_HERE'
};
```

### Archivo: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/api',  // ← URL en producción
  socketUrl: 'https://tu-dominio.com',   // ← URL en producción
  googleMapsApiKey: 'YOUR_KEY_HERE'
};
```

## 2️⃣ Endpoints de Backend Requeridos

### 🔐 Autenticación

**POST** `/api/auth/login`
```json
Request:
{
  "username": "operator@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "username": "operator@example.com",
    "email": "operator@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "operator",
    "phone": "+54 11 1234 5678",
    "address": "Calle Falsa 123",
    "isActive": true
  }
}
```

**POST** `/api/auth/register`
```json
Request:
{
  "firstName": "Carlos",
  "lastName": "López",
  "email": "carlos@example.com",
  "username": "carlos",
  "phone": "+54 11 9876 5432",
  "address": "Avenida Principal 456",
  "password": "SecurePassword123"
}

Response: (mismo que login)
```

### 📍 Alertas

**GET** `/api/alerts?page=1&pageSize=20`
```json
Response:
{
  "alerts": [
    {
      "id": "alert_id_1",
      "userId": "user_id",
      "userName": "Juan Pérez",
      "userPhone": "+54 11 1234 5678",
      "type": "panic",
      "status": "active",
      "priority": "critical",
      "title": "Botón Pánico Activado",
      "description": "Usuario presionó botón de pánico",
      "location": {
        "latitude": -31.38755,
        "longitude": -64.1799254,
        "timestamp": "2026-02-20T14:05:00Z",
        "accuracy": 5
      },
      "locationHistory": [
        {
          "latitude": -31.38750,
          "longitude": -64.17990,
          "timestamp": "2026-02-20T14:04:50Z",
          "accuracy": 8
        }
      ],
      "createdAt": "2026-02-20T14:05:00Z",
      "updatedAt": "2026-02-20T14:05:30Z",
      "operatorId": "operator_id",
      "operatorName": "Carlos López",
      "evidenceUrls": ["https://..."],
      "emergencyContacts": [
        {
          "name": "María Pérez",
          "relationship": "Esposa",
          "phone": "+54 11 9876 5432"
        }
      ],
      "nearbyAuthorities": [
        {
          "id": "police_1",
          "type": "police",
          "name": "Policía Municipal",
          "unit": "Unidad 502",
          "phone": "+54 11 1234 5678",
          "eta": 4,
          "distance": 2.5
        }
      ],
      "notes": "Cliente reporta sospechoso en propiedad"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

**GET** `/api/alerts/:id`
```json
Response: (mismo objeto de alert individual)
```

**GET** `/api/alerts/operator/:operatorId?page=1&pageSize=20`
```json
Response: (same as /alerts endpoint)
```

**PATCH** `/api/alerts/:id`
```json
Request:
{
  "status": "review",
  "priority": "high",
  "notes": "Verificado por operador"
}

Response: (alert actualizado)
```

**PATCH** `/api/alerts/:id/status`
```json
Request:
{
  "status": "resolved"
}

Response: (alert con nuevo status)
```

## 3️⃣ Eventos Socket.IO

Tu backend debe emitir estos eventos a través de Socket.IO:

### Servidor → Cliente

```javascript
// Nueva alerta creada
socket.emit('alert:created', {
  id: 'alert_id',
  title: 'Nueva Alerta',
  // ... resto de datos
});

// Alerta actualizada
socket.emit('alert:updated', {
  id: 'alert_id',
  status: 'review',
  // ... datos actualizados
});

// Nueva ubicación de alerta
socket.emit('alert:location', {
  alertId: 'alert_id',
  location: {
    latitude: -31.38755,
    longitude: -64.1799254,
    timestamp: '2026-02-20T14:05:00Z'
  }
});
```

### Cliente → Servidor (opcional)

```javascript
// El cliente puede emitir eventos si es necesario
socket.emit('alert:acknowledge', { alertId: 'id' });
```

## 4️⃣ Autenticación JWT

### Header esperado
```
GET /api/alerts
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Implementación en Express/Node

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Usar en rutas
app.get('/api/alerts', authMiddleware, getAlerts);
```

## 5️⃣ CORS Configuración

Tu backend debe permitir requests desde el frontend:

```javascript
// Express CORS
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:4200',        // Development
    'https://tu-dominio.com'         // Production
  ],
  credentials: true
}));
```

## 6️⃣ Validación de Roles

El frontend valida roles, pero **siempre valida en backend también**:

```javascript
// Backend
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Usar
app.post('/api/auth/register', authMiddleware, adminOnly, registerUser);
```

## 7️⃣ Socket.IO Setup

### Backend (Express + Socket.IO)

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:4200', 'https://tu-dominio.com'],
    credentials: true
  }
});

// Middleware de autenticación
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Conexión
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.userId}`);
  
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.userId}`);
  });
});

// Emitir alerta
io.emit('alert:created', alertData);

server.listen(3000);
```

## 8️⃣ Manejo de Errores

### Errores HTTP
```json
400 - Bad Request
{
  "error": "Invalid input",
  "message": "El campo 'email' es requerido"
}

401 - Unauthorized
{
  "error": "Invalid credentials"
}

403 - Forbidden (no permisos)
{
  "error": "You don't have permission to perform this action"
}

404 - Not Found
{
  "error": "Alert not found"
}

500 - Server Error
{
  "error": "Internal server error",
  "message": "Contacta al administrador"
}
```

## 9️⃣ Testing de Endpoints

### Usando cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"pass123"}'

# Get Alerts
curl -X GET http://localhost:3000/api/alerts \
  -H "Authorization: Bearer TOKEN_HERE"

# Update Alert
curl -X PATCH http://localhost:3000/api/alerts/alert_id \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status":"review"}'
```

### Usando Postman

1. Importar colección
2. Configurar variables de entorno:
   - `base_url`: http://localhost:3000
   - `token`: (se obtiene de login)
3. Ejecutar requests

## 🔟 Debugging

### Ver requests en navegador
```javascript
// En console.log del navegador
// Instalar intercepción en HTTP
```

### Ver emits de Socket
```javascript
// Agregar logger en socket.ts
import { io } from 'socket.io-client';

const socket = io(socketUrl);

socket.onAnyIncoming((eventName, ...args) => {
  console.log('Evento recibido:', eventName, args);
});

socket.onAnyOutgoing((eventName, ...args) => {
  console.log('Evento emitido:', eventName, args);
});
```

## ✅ Checklist de Implementación

- [ ] URLs de API configuradas
- [ ] Endpoints de auth implementados
- [ ] Endpoints de alerts implementados
- [ ] CORS configurado
- [ ] JWT funcionando
- [ ] Socket.IO emitiendo eventos
- [ ] Roles validados en backend
- [ ] Tests de endpoints completados
- [ ] Errores manejados correctamente
- [ ] Frontend se conecta al backend

## 📞 Troubleshooting Common Issues

| Problema | Solución |
|----------|----------|
| CORS error | Agregar origen en CORS config |
| 401 Unauthorized | Verificar token en localStorage |
| Socket no conecta | Verificar URL y puerto de Socket.IO |
| Datos no actualizan | Verificar que endpoint retorna datos correctos |
| Rol no funciona | Validar role en backend también |

---

**Próximo paso**: Ejecutar `npm start` y probar login con tus credenciales
