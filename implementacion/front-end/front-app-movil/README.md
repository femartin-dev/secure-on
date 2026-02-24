# SecureOn Mobile App - Documentación

## Descripción

SecureOn Mobile App es una aplicación de alarma y seguridad para dispositivos Android desarrollada con **Angular 18** y **Capacitor**.

## Características principales

- **Autenticación segura** con login, registro y recuperación de contraseña
- **Sistema de alarma** con activación y cancelación configurables
- **Geolocalización** en tiempo real durante alarmas
- **Acceso a características nativas** del dispositivo:
  - GPS/Ubicación
  - Cámara (frontal y trasera)
  - Micrófono
  - Contactos
  - Notificaciones
  - Vibración
  - Bloqueo del dispositivo

- **Gestión de configuración** personalizable
- **Contactos de emergencia**
- **Persistencia de sesión** con renovación automática de tokens

## Estructura del proyecto

```
src/
├── app/
│   ├── modules/              # Módulos de características
│   │   ├── auth/            # Sistema de autenticación
│   │   ├── dashboard/       # Pantalla principal
│   │   ├── alarm/          # Sistema de alarma
│   │   └── settings/       # Configuración
│   ├── services/           # Servicios compartidos
│   │   ├── auth.service.ts
│   │   ├── alarm.service.ts
│   │   ├── geolocation.service.ts
│   │   ├── config.service.ts
│   │   ├── contact.service.ts
│   │   └── notification.service.ts
│   ├── models/             # Interfaces TypeScript
│   ├── guards/             # Guards de rutas
│   ├── interceptors/       # HTTP interceptors
│   ├── config/             # Configuración de la API
│   └── app.component.*     # Componente raíz
├── index.html              # HTML principal
├── main.ts                 # Punto de entrada
└── styles.css              # Estilos globales
```

## Instalación

### Requisitos previos

- Node.js 18+ y npm 9+
- Android SDK 21+ (para desarrollo en Android)
- Maven/Gradle para construcción nativa

### Pasos de instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Agregar plataforma Android**
   ```bash
   npm run cap:add
   ```

3. **Sincronizar con Capacitor**
   ```bash
   npm run cap:sync
   ```

## Desarrollo

### Ejecutar en navegador

```bash
npm start
```

### Compilar para producción

```bash
npm run build:prod
```

### Abrir proyecto en Android Studio

```bash
npm run cap:open
```

### Sincronizar cambios con Capacitor

```bash
npm run cap:sync
```

## Configuración de la API

Editar `src/app/config/api-config.ts` con las URLs de los microservicios:

```typescript
MS_SECURITY: {
  baseUrl: 'http://your-server:8093',
  version: 'v1'
}
```

## Servicios disponibles

### AuthService
- Login, registro, logout
- Gestión de tokens
- Persistencia de sesión

### AlarmService
- Activación de alarmas
- Cancelación con múltiples métodos
- Bloqueo de dispositivo
- Envío de ubicación

### GeolocationService
- Obtener ubicación actual
- Seguimiento continuo
- Cálculo de distancias

### ConfigService
- Gestión de configuraciones
- Persistencia local
- Valores por defecto

### ContactService
- Gestión de contactos
- Importación desde dispositivo
- Integración con API

## Características nativas

### Capacitor plugins utilizados

- `@capacitor/geolocation` - GPS
- `@capacitor/camera` - Cámara
- `@capacitor/contacts` - Contactos
- `@capacitor/motion` - Sensores (acelerómetro, giroscopio)
- `@capacitor/device` - Información del dispositivo
- `@capacitor/storage` - Almacenamiento local
- `@capacitor/keyboard` - Control del teclado
- `@capacitor/app` - Control de la aplicación

## Seguridad

- **HTTPS** en todas las comunicaciones
- **JWT** para autenticación
- **Renovación automática** de tokens
- **Haseo de contraseñas** en el backend
- **Almacenamiento seguro** de credenciales

## Permisos de Android

Los siguientes permisos se solicitan en tiempo de ejecución:

- `ACCESS_FINE_LOCATION` - GPS de alta precisión
- `CAMERA` - Acceso a la cámara
- `READ_CONTACTS` - Acceder a contactos
- `RECORD_AUDIO` - Micrófono
- `WRITE_EXTERNAL_STORAGE` - Almacenamiento

## Testing

```bash
npm run test
```

## CI/CD

Configurado con GitHub Actions para:
- Linting automático
- Compilación
- Testing
- Build de APK

## Desarrollo futuro

### MVP 2
- Patrón táctil como método de cancelación
- Huella digital (Face ID/Touch ID)
- Almacenamiento local de incidentes
- Historial detallado

### MVP 3
- Push notifications
- WebSocket para comunicación en tiempo real
- Soporte para múltiples idiomas
- Temas oscuro/claro

## Soporte

Para reportar issues o sugerencias, contact al equipo de desarrollo.

## Licencia

Proprietary - SecureOn
