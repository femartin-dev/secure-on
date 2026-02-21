# Secureon Monitoring Center Dashboard - Angular 18

Dashboard frontend para un centro de monitoreo de alarmas en tiempo real, desarrollado con Angular 18, Google Maps, Socket.IO y Tailwind CSS.

## 🚀 Características

- **Autenticación**: Sistema de login con roles (Admin, Operador, Supervisor)
- **Dashboard Principal**: Vista en tiempo real con mapa de Google Maps y lista de alertas
- **Gestión de Alertas**: Crear, editar, verificar y notificar autoridades
- **Actualizaciones en Tiempo Real**: Socket.IO para eventos instantáneos
- **Historial de Ubicaciones**: Visualización de trayectos en el mapa
- **Control de Permisos**: Operadores ven solo sus alertas asignadas
- **Registro de Usuarios**: Solo administradores pueden registrar nuevos operadores
- **Dark Mode**: Interfaz optimizada para monitoreo 24/7

## 📋 Requisitos Previos

- Node.js 18+ 
- npm 10+
- Angular CLI 18

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd front-end
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
};
```

**Obtén tu Google Maps API Key:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita las APIs: Maps JavaScript API, Places API, Directions API
4. Crea una clave API (tipo navegador)
5. Pega la clave en `environment.ts`

### 4. Iniciar servidor de desarrollo
```bash
npm start
# o
ng serve
```

Accede a `http://localhost:4200/`

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.css
│   │   ├── register/
│   │   ├── dashboard/
│   │   └── alert-detail/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── alert.service.ts
│   │   └── socket.service.ts
│   ├── models/
│   │   ├── auth.models.ts
│   │   └── alert.models.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.css
└── index.html
```

## 🔑 Funcionalidades Principales

### 1. **Componente Login**
- Autenticación con usuario/contraseña
- Validación de formularios
- Mensajes de error personalizados
- Redirección automática si ya está logueado

### 2. **Componente Dashboard**
- Mapa interactivo con marcadores de alertas
- Lista paginable de alarmas (20 por página)
- Menú lateral con opciones de usuario
- Filtrado por tipo de alerta y prioridad
- Actualizaciones en tiempo real vía Socket.IO
- Indicador de conexión

### 3. **Componente Detalle de Alarma**
- Cuatro modos de visualización:
  - **Ver**: Solo lectura
  - **Editar**: Modificar estado, prioridad y notas
  - **Verificar**: Marcar como verificado
  - **Notificar**: Contactar autoridades cercanas
- Mapa expandido con trayecto de ubicaciones
- Historial completo de movimientos
- Evidencia capturada (imágenes/videos)
- Autoridades cercanas disponibles

### 4. **Componente Registro** (Solo Admin)
- Registro de nuevos operadores
- Validación de datos
- Confirmación de contraseña
- Asignación de rol

## 🔌 API Endpoints Esperados

### Autenticación
```
POST /api/auth/login
POST /api/auth/register
```

### Alertas
```
GET /api/alerts?page=1&pageSize=20
GET /api/alerts/:id
GET /api/alerts/operator/:operatorId
PATCH /api/alerts/:id
PATCH /api/alerts/:id/status
```

## 🔄 Eventos Socket.IO

El servicio de Socket.IO escucha los siguientes eventos:

```typescript
socket.on('alert:created')      // Nueva alerta creada
socket.on('alert:updated')      // Alerta actualizada
socket.on('alert:location')     // Nueva ubicación de alerta
```

Emite:
```typescript
socket.emit('alert:acknowledge') // Confirmar recepción
```

## 🎨 Temas y Personalización

### Talwind Configuration
Edita `tailwind.config.js` para personalizar colores:

```javascript
colors: {
  "primary": "#183daa",
  "background-dark": "#111521",
  // ...
}
```

### Dark Mode
El proyecto usa Tailwind CSS dark mode habilitado en todas las vistas:

```html
<html class="dark">
```

## 📱 Responsive Design

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🚀 Build para Producción

```bash
npm run build
# o
ng build --configuration production
```

Los archivos compilados estarán en `dist/secureon-monitoring/`

## 🔐 Seguridad

- **JWT Tokens**: Almacenados en localStorage
- **HTTP Interceptor**: Añade token a todos los requests
- **Auth Guard**: Protege rutas privadas
- **Role-Based Access**: Validación de roles en client (validar también en servidor)

## 🐛 Troubleshooting

### "Cannot find module '@angular/core'"
```bash
npm install
```

### Google Maps no carga
- Verifica que `googleMapsApiKey` esté configurado
- Comprueba que la API esté habilitada en Google Cloud Console
- Verifica las restricciones de clave API

### Socket.IO no conecta
- Verifica que el servidor esté corriendo en `http://localhost:3000`
- Comprueba los logs del navegador (F12)
- Verifica CORS en el servidor

### Estilos no se aplican
```bash
npm run build
# o reconstruye si estás en desarrollo
```

## 📚 Dependencias Principales

- **@angular/core**: 18.0.0
- **@angular/forms**: 18.0.0
- **@angular/router**: 18.0.0
- **rxjs**: 7.8.1
- **socket.io-client**: 4.7.2
- **@googlemaps/js-api-loader**: 1.16.2
- **tailwindcss**: 3.4.1

## 📞 Soporte

Para problemas o sugerencias:
1. Revisa la documentación oficial de Angular: https://angular.io
2. Socket.IO: https://socket.io/docs/
3. Google Maps: https://developers.google.com/maps

## 📄 Licencia

Propiedad de Securitas Group

## 🎯 Roadmap Futuro

- [ ] Filtros avanzados
- [ ] Exportación de reportes
- [ ] Multi-idioma (i18n)
- [ ] PWA offline support
- [ ] Notificaciones push
- [ ] Integración con webhook
- [ ] Analytics dashboard

---

**Versión**: 1.0.0
**Última actualización**: Febrero 2026
