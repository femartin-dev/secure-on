# SecureOn Mobile App - Guía de Inicio Rápido

## ✅ Estado del Proyecto

**Framework:** Angular 18  
**Herramienta Nativa:** Capacitor 6  
**Plataforma:** Android (iOS en futuro)  
**Estado:** Estructura base completada y compilada exitosamente

## 📁 Estructura del Proyecto

```
secureon-app-movil/
├── src/
│   ├── app/
│   │   ├── modules/          # Módulos feature
│   │   │   ├── auth/         # Autenticación (LOGIN, REGISTRO, RECUPERAR)
│   │   │   ├── dashboard/    # Pantalla principal
│   │   │   ├── alarm/        # Sistema de alarma
│   │   │   └── settings/     # Configuración con sub-opciones
│   │   ├── services/         # Servicios compartidos
│   │   │   ├── auth.service.ts          # Autenticación y gestión de tokens
│   │   │   ├── alarm.service.ts         # Lógica de alarmas
│   │   │   ├── geolocation.service.ts   # GPS y ubicación
│   │   │   ├── config.service.ts        # Configuraciones
│   │   │   ├── contact.service.ts       # Gestión de contactos
│   │   │   └── notification.service.ts  # Notificaciones
│   │   ├── models/           # Interfaces TypeScript
│   │   ├── guards/           # Route guards (AuthGuard)
│   │   ├── interceptors/     # HTTP interceptors (AuthInterceptor)
│   │   ├── config/           # Configuración de API
│   │   └── app.component.*   # Componente raíz
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── android/                  # Código nativo Android (Gradle)
├── capacitor.config.ts       # Configuración de Capacitor
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm start

# Compilar proyecto
npm run build

# Compilar para producción
npm run build:prod
```

### Capacitor & Android
```bash
# Sincronizar cambios con Android
npm run cap:sync

# Construir APK (requiere Android SDK)
npm run cap:build

# Abrir Android Studio para desarrollo nativo
npm run cap:open

# Ver proyecto en Android Studio directamente
npx cap open android
```

### Testing
```bash
npm run test
npm run lint
```

## 🔧 Servicios Implementados

### 1. **AuthService** ✅
- Login, registro, logout
- Gestión de tokens JWT
- Renovación automática de tokens (5 min antes de expiración)
- Persistencia de sesión en Preferences
- Obtención de ID único del dispositivo

### 2. **AlarmService** ✅
- Activación de alarma con countdown (3 seg)
- Ventana de cancelación configurable (15 seg)
- Métodos de cancelación: PASSWORD y PIN (MVP1)
- Bloqueo del dispositivo cuando expira tiempo
- Envío periódico de ubicación
- Vibración háptica de alarma (3 impactos heavy)

### 3. **GeolocationService** ✅
- Obtener ubicación actual con alta precisión
- Seguimiento continuo de ubicación
- Cálculo de distancias (fórmula Haversine)
- Actualización configurable cada 5 segundos

### 4. **ConfigService** ✅
- Gestión centralizada de configuraciones
- Persistencia en almacenamiento local
- Valores por defecto
- Sincronización con servidor

### 5. **ContactService** ✅
- Gestión de contactos de emergencia
- Importación desde dispositivo
- Marcado de contactos primarios y de emergencia

### 6. **NotificationService** ✅
- Notificaciones visuales (fallback a console en desarrollo)
- Información, éxito, error, advertencia

### 7. **AuthInterceptor** ✅
- Agrega token Bearer automáticamente
- Maneja errores 401 y 403
- Renovación de token transparente

### 8. **AuthGuard** ✅
- Protege rutas autenticadas
- Redirige a login si no está autenticado

## 📱 Capacidades Nativas Implementadas

| Característica | Plugin Capacitor | Estado |
|---------------|------------------|--------|
| GPS/Ubicación | @capacitor/geolocation | ✅ |
| Cámara | @capacitor/camera | ✅ (estructura) |
| Contactos | (nativo con JS) | ✅ (estructura) |
| Micrófono | (nativo con permiso) | ✅ (estructura) |
| Vibración/Haptics | @capacitor/haptics | ✅ |
| Almacenamiento local | @capacitor/preferences | ✅ |
| Info del dispositivo | @capacitor/device | ✅ |
| Teclado | @capacitor/keyboard | ✅ |
| Red/WiFi | @capacitor/network | ✅ (estructura) |
| Status Bar | @capacitor/status-bar | ✅ |
| App lifecycle | @capacitor/app | ✅ |

## 🔑 Configuración de API

Edita `src/app/config/api-config.ts` con tus endpoints:

```typescript
MS_SECURITY: {
  baseUrl: 'http://your-server:8093', // Auth
},
MS_APP_MOVIL: {
  baseUrl: 'http://your-server:8091', // App
},
MS_CDM_CONTROL: {
  baseUrl: 'http://your-server:8092', // CDM
}
```

## 📊 Flujo de Autenticación

```
LOGIN SCREEN
    ↓
[Usuario + Contraseña]
    ↓
POST /api/seguridad/v1/app/auth/login
    ↓
✅ Respuesta: Token + Usuario
    ↓
[Guardar en Preferences]
    ↓
DASHBOARD
```

## 🚨 Flujo de Alarma (MVP 1)

```
DASHBOARD
    ↓
[Botón ACTIVAR ALARMA]
    ↓
3 SEGUNDO COUNTDOWN
    ↓
ALARMA ACTIVADA + VIBRACIÓN
    ↓
15 SEGUNDO TIMER
    ↓
[SI EXPIRA]
    ↓
BLOQUEO DE DISPOSITIVO
    ↓
SCREEN LOCK
[Cancelación: PASSWORD/PIN]
```

## 🔐 Seguridad Implementada

- ✅ HTTPS en todas las comunicaciones
- ✅ JWT Bearer authentication
- ✅ Renovación automática de tokens
- ✅ Almacenamiento seguro de credenciales
- ✅ Manejo de errores 401/403
- ✅ Device ID único por dispositivo

## 📦 Dependencias Principales

```json
{
  "angular": "^18.0.0",
  "@capacitor/core": "^6.0.0",
  "@capacitor/android": "^6.0.0",
  "rxjs": "^7.8.0",
  "typescript": "~5.4.0"
}
```

## 🛠️ Próximos Pasos

### MVP 2
- [ ] Interfaces de LOGIN, REGISTRO, RECUPERAR PASSWORD
- [ ] Interfaces de DASHBOARD (con botón alarma)
- [ ] Interfaz de CANCELACIÓN (timeout+cancelar)
- [ ] Interfaz de BLOQUEO (device lock screen)
- [ ] Interfaz de CONFIGURACIÓN (template + sub-opciones)
- [ ] Gestión de contactos
- [ ] Patrón táctil como método de cancelación

### MVP 3
- [ ] Huella digital (biometría)
- [ ] Push notifications
- [ ] WebSocket para comunicación en tiempo real
- [ ] Múltiples idiomas
- [ ] Tema oscuro/claro

## 📝 Variables de Entorno

Crear archivo `.env` (no versionado):

```env
API_BASE_URL=http://your-server:8093
API_SECURITY_KEY=your-secret-key
DEVICE_DEBUG=false
```

## 🧪 Testing

Por implementar en MVP 2:
- Jest para unit tests
- Integration tests para servicios
- E2E tests con Cypress

## 📖 Documentación Complementaria

Ver archivos:
- [README.md](./README.md) - Documentación general
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura detallada (próximo)
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Integración con microservicios

## 🚀 Deploy a Device

### Requisitos previos
- Android SDK 21+ instalado
- JDK 11+ (para Gradle)
- Maven/Gradle configurado
- Dispositivo Android con USB debugging habilitado

### Pasos

1. **Compilar apk debug**
   ```bash
   npm run build
   npm run cap:sync
   cd android && ./gradlew assembleDebug
   ```

2. **O usar Android Studio**
   ```bash
   npm run cap:open
   # Ahora en Android Studio: Build > Build APK
   ```

3. **Instalar en dispositivo**
   ```bash
   adb install android/app/build/outputs/apk/debug/secureon-*.apk
   ```

## 📞 Soporte

Para issues o preguntas sobre la instalación:
- Revisar logs: `npm run cap:open` y ver logcat
- Verificar permisos en AndroidManifest.xml
- Consultar documentación oficial de Capacitor

## 📄 Licencia

Proprietary - SecureOn 2026
