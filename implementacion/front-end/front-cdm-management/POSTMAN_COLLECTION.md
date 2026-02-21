# Postman Collection - Secure-On API Testing

## Setup

1. Abre Postman
2. Importa esta colección
3. Configura la variable `{{BASE_URL}}` = `http://localhost:3000` (o tu URL backend)
4. Configura la variable `{{TOKEN}}` después del primer login exitoso

## Environment Variables

```json
{
  "BASE_URL": "http://localhost:3000",
  "TOKEN": "",
  "ADMIN_USERNAME": "admin",
  "ADMIN_PASSWORD": "admin123",
  "OP_USERNAME": "operator",
  "OP_PASSWORD": "operator123"
}
```

## Authentication Endpoints

### 1. Login Admin
```
POST {{BASE_URL}}/auth/login

Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_admin_1",
    "username": "admin",
    "email": "admin@secureon.com",
    "firstName": "Administrador",
    "lastName": "Sistema",
    "role": "admin",
    "phone": "+54 11 0000 0001",
    "isActive": true
  }
}

Test (agregar a Tests):
pm.environment.set("TOKEN", pm.response.json().token);
```

### 2. Login Operator
```
POST {{BASE_URL}}/auth/login

Body (JSON):
{
  "username": "operator",
  "password": "operator123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_op_1",
    "username": "operator",
    "role": "operator"
  }
}
```

### 3. Register New User (Admin Only)
```
POST {{BASE_URL}}/auth/register

Headers:
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

Body (JSON):
{
  "username": "newoperator",
  "email": "newop@secureon.com",
  "password": "securePass123",
  "firstName": "Nuevo",
  "lastName": "Operador",
  "role": "operator",
  "phone": "+54 11 5555 5555",
  "address": "Zona Sur"
}

Response (201):
{
  "user": {
    "id": "user_new_1",
    "username": "newoperator",
    "email": "newop@secureon.com",
    "role": "operator"
  },
  "message": "Usuario registrado exitosamente"
}
```

## Alert Endpoints

### 4. Get All Alerts (Admin/Supervisor)
```
GET {{BASE_URL}}/alerts?page=1&pageSize=20

Headers:
Authorization: Bearer {{TOKEN}}

Response (200):
{
  "alerts": [
    {
      "id": "alert_1",
      "userId": "user_1",
      "userName": "Ricardo Alarcón",
      "type": "panic",
      "status": "active",
      "priority": "critical",
      "location": {
        "latitude": -31.38755,
        "longitude": -64.1799254,
        "timestamp": "2024-01-15T10:30:00Z",
        "accuracy": 5
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2
  }
}
```

### 5. Get Alerts by Operator
```
GET {{BASE_URL}}/alerts/operator/{{OPERATOR_ID}}?page=1&pageSize=20

Headers:
Authorization: Bearer {{TOKEN}}

Response (200):
{
  "alerts": [
    {
      "id": "alert_1",
      "operatorId": "op_1",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### 6. Get Single Alert
```
GET {{BASE_URL}}/alerts/alert_1

Headers:
Authorization: Bearer {{TOKEN}}

Response (200):
{
  "id": "alert_1",
  "userId": "user_1",
  "userName": "Ricardo Alarcón",
  "type": "panic",
  "status": "active",
  "priority": "critical",
  "title": "Botón Pánico Activado",
  "description": "Usuario presionó botón de pánico",
  "location": {
    "latitude": -31.38755,
    "longitude": -64.1799254,
    "timestamp": "2024-01-15T10:30:00Z",
    "accuracy": 5
  },
  "locationHistory": [
    {
      "latitude": -31.38750,
      "longitude": -64.17990,
      "timestamp": "2024-01-15T10:29:00Z",
      "accuracy": 8
    }
  ],
  "operatorId": "op_1",
  "operatorName": "Carlos López",
  "evidenceUrls": ["https://..."],
  "emergencyContacts": [
    {
      "name": "María Alarcón",
      "relationship": "Esposa",
      "phone": "+52 55 9876 5432"
    }
  ],
  "nearbyAuthorities": [
    {
      "id": "police_1",
      "type": "police",
      "name": "Policía Municipal",
      "unit": "Unidad 502",
      "phone": "+52 11 1111 1111",
      "eta": 4,
      "distance": 2.5
    }
  ]
}
```

### 7. Update Alert Status & Priority
```
PUT {{BASE_URL}}/alerts/alert_1

Headers:
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

Body (JSON):
{
  "status": "verified",
  "priority": "high",
  "notes": "Verificado por operador, requiere ambulancia"
}

Response (200):
{
  "id": "alert_1",
  "status": "verified",
  "priority": "high",
  "notes": "Verificado por operador, requiere ambulancia",
  "updatedAt": "2024-01-15T10:35:00Z"
}

// Posibles valores status:
// - "active": Alerta nueva/activa
// - "review": En revisión
// - "verified": Verificada
// - "dispatched": Enviados recursos
// - "resolved": Resuelta
// - "canceled": Cancelada
```

### 8. Notify Authorities (Notify Mode)
```
PUT {{BASE_URL}}/alerts/alert_1/notify

Headers:
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

Body (JSON):
{
  "authorityIds": ["police_1", "medical_1"],
  "message": "Alerta crítica: Se requiere ambulancia y patrulla",
  "notes": "Usuario reporta disparos en zona"
}

Response (200):
{
  "id": "alert_1",
  "status": "dispatched",
  "notifiedAt": "2024-01-15T10:35:00Z",
  "authorities": [
    {
      "id": "police_1",
      "type": "police",
      "notifiedAt": "2024-01-15T10:35:00Z"
    },
    {
      "id": "medical_1",
      "type": "medical",
      "notifiedAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

## Socket.IO Events (WebSocket)

### Client Subscription
```javascript
// Cliente (Frontend) se conecta y suscribe
socket.emit('alert:subscribe', {
  userId: 'user_admin_1'
});

// Si es operador, especificar operatorId:
socket.emit('alert:subscribe', {
  operatorId: 'op_1'
});
```

### Server Broadcast Events

#### 9. New Alert Created
```javascript
// Backend emite cuando se crea alerta
socket.emit('alert:created', {
  id: 'alert_new_1',
  userId: 'user_new',
  userName: 'Nueva Alerta',
  type: 'intrusion',
  status: 'active',
  priority: 'critical',
  location: {
    latitude: -31.38755,
    longitude: -64.1799254,
    timestamp: '2024-01-15T10:40:00Z',
    accuracy: 5
  },
  createdAt: '2024-01-15T10:40:00Z'
});

// Frontend recibe en dashboard.component.ts
this.socketService.alertCreated$.subscribe(alert => {
  // Agregar a lista, actualizar mapa
  this.alertService.addOrUpdateAlert(alert);
});
```

#### 10. Alert Status Updated
```javascript
// Backend emite cuando se actualiza
socket.emit('alert:updated', {
  id: 'alert_1',
  status: 'verified',
  priority: 'high',
  operatorId: 'op_1',
  updatedAt: '2024-01-15T10:35:00Z'
});

// Frontend recibe
this.socketService.alertUpdated$.subscribe(alert => {
  this.alertService.addOrUpdateAlert(alert);
});
```

#### 11. Location Update (Real-time tracking)
```javascript
// Backend emite cuando posición cambia
socket.emit('alert:location', {
  alertId: 'alert_1',
  location: {
    latitude: -31.38760,
    longitude: -64.17995,
    timestamp: '2024-01-15T10:45:00Z',
    accuracy: 4
  }
});

// Frontend recibe
this.socketService.locationUpdated$.subscribe(data => {
  // Actualizar ruta en mapa
  // data.alertId: id de alerta
  // data.location: nueva coordenada
});
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Campos inválidos",
  "errors": {
    "email": "Email inválido",
    "password": "Mínimo 8 caracteres"
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Token inválido o expirado",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "message": "No tiene permisos para esta acción",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "message": "Alerta no encontrada",
  "code": "NOT_FOUND"
}
```

### 500 Server Error
```json
{
  "message": "Error interno del servidor",
  "code": "SERVER_ERROR"
}
```

## Test Workflow

### 1. Complete Login Flow
```
1. POST /auth/login (admin)
   ✓ Guardar token en {{TOKEN}}
   
2. POST /auth/register (crear nuevo operador)
   ✓ Headers: Authorization con {{TOKEN}}

3. POST /auth/login (operador nuevo)
   ✓ Guardar token en {{TOKEN}}
```

### 2. Complete Alert Flow
```
1. GET /alerts (listar todas - admin)
   ✓ Verificar structure
   
2. GET /alerts/:id (detalle)
   ✓ Verificar location history

3. PUT /alerts/:id (actualizar estado)
   ✓ Cambiar a "verified"

4. PUT /alerts/:id/notify (notificar autoridades)
   ✓ Cambiar a "dispatched"
```

### 3. Real-time Testing
```
1. Conectar Socket.IO con token
2. Crear nueva alerta via POST /alerts
3. Verificar que llega evento alert:created
4. Actualizar ubicación (simular movimiento)
5. Verificar evento alert:location
6. Cambiar status via PUT
7. Verificar evento alert:updated
```

## Rate Limiting

```
Límites por usuario:
- /auth/login: 5 intentos por 15 minutos
- /alerts: 100 requests por minuto
- /alerts/:id: 100 requests por minuto

Respuesta cuando límite alcanzado:
{
  "message": "Muy muchos requests, intenta más tarde",
  "retryAfter": 900
}
```

## CORS Headers (Verificar)

```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

## Tips

1. **Guardar Token**: Después de login, Postman guarda automático en variable
2. **Reutilizable**: Copiar request y cambiar IDs para probar diferentes alertas
3. **Testing Completo**: Usar pre-request scripts para automatizar flujos
4. **Documentation**: Esta colección documentada en cada endpoint
