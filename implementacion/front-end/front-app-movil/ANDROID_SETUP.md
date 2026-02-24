# Android Permissions & Manifest Configuration

## Permisos Requeridos

El archivo `android/app/src/main/AndroidManifest.xml` debe contener los siguientes permisos:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.secureon.appmovil">

    <!-- GEOLOCATION / GPS -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- CAMERA -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- MICROPHONE -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <!-- CONTACTS -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.WRITE_CONTACTS" />

    <!-- STORAGE -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <!-- NETWORK -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- DEVICE CONTROL -->
    <uses-permission android:name="android.permission.DISABLE_KEYGUARD" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- APPLICATION TAG -->
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:debuggable="false">

        <!-- Capacitor Activities -->
        <activity
            android:name="com.getcapacitor.CapacitorActivity"
            android:exported="true"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme" />

        <!-- Splash Screen -->
        <activity
            android:name="com.getcapacitor.SplashScreenActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:label="@string/activity_name"
            android:launchMode="singleTask"
            android:theme="@style/SplashScreenTheme"
            android:exported="true" />

    </application>

</manifest>
```

## Permisos en Tiempo de Ejecución

Para Android 6+ (API 23+), estos permisos DEBEN solicitarse en tiempo de ejecución:

### Permisos "Peligrosos" (requieren solicitud de usuario)

| Permiso | Plugin Capacitor | Uso |
|---------|------------------|-----|
| ACCESS_FINE_LOCATION | @capacitor/geolocation | GPS de alta precisión |
| ACCESS_COARSE_LOCATION | @capacitor/geolocation | GPS aproximada |
| CAMERA | @capacitor/camera | Cámara frontal/trasera |
| RECORD_AUDIO | (Nativo) | Micrófono |
| READ_CONTACTS | (Nativo) | Leer contactos |
| WRITE_CONTACTS | (Nativo) | Crear contactos |
| READ_EXTERNAL_STORAGE | (Nativo) | Leer archivos |
| WRITE_EXTERNAL_STORAGE | (Nativo) | Escribir archivos |

### Permisos "Normales" (no requieren solicitud)

| Permiso | Uso |
|---------|-----|
| INTERNET | Conectar a APIs |
| ACCESS_NETWORK_STATE | Verificar estado de red |
| VIBRATE | Vibración háptica |
| DISABLE_KEYGUARD | Control de bloqueo de pantalla |

## Capacitor Permissions API

Capacitor maneja automáticamente algunos permisos. Para solicitar permisos manualmente:

```typescript
import { App } from '@capacitor/app';
import { Permissions } from '@capacitor/permissions';

// Solicitar permisos de GPS
const geoPerms = await Permissions.query({ name: 'Geolocation' });
if (geoPerms.state === 'prompt') {
  const result = await Permissions.request({ name: 'Geolocation' });
  if (result.state === 'granted') {
    // Usar GPS
  }
}

// Solicitar permisos de cámara
const cameraPerms = await Permissions.query({ name: 'Camera' });
```

## Configuración build.gradle

El archivo `android/build.gradle` debe contener:

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        androidxActivityVersion = '1.8.0'
        androidxAppCompatVersion = '1.6.1'
        androidxCoordinatorLayoutVersion = '1.2.0'
    }

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
    }
}
```

## Variables de Configuración (capacitor.config.ts)

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.secureon.appmovil',
  appName: 'SecureOn',
  webDir: 'dist/secureon-app-movil',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashImmersive: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff'
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  }
};

export default config;
```

## Testing de Permisos

### Verificar permisos en dispositivo
```bash
# Listar permisos otorgados
adb shell pm list permissions -g

# Revocar permiso
adb shell pm revoke com.secureon.appmovil android.permission.ACCESS_FINE_LOCATION

# Otorgar permiso
adb shell pm grant com.secureon.appmovil android.permission.ACCESS_FINE_LOCATION
```

### Logcat de permisos
```bash
# Ver logs de cámara
adb logcat | grep camera

# Ver logs de geolocalización
adb logcat | grep geolocation

# Todos los permisos
adb logcat *:S | grep Permission
```

## Troubleshooting

### "Permission denied for Geolocation"
- ✅ Verificar que ACCESS_FINE_LOCATION está en AndroidManifest.xml
- ✅ Habilitar en dispositivo: Settings > Apps > Permissions > Location
- ✅ Revisar logcat para más detalles

### "Camera permission not granted"
- ✅ Verificar CAMERA en AndroidManifest.xml
- ✅ Permitir en: Settings > Apps > Permissions > Camera
- ✅ No confundir con privacidad del sistema

### "Contacts not accessible"
- ✅ Agregar READ_CONTACTS y WRITE_CONTACTS
- ✅ Habilitar en: Settings > Apps > Permissions > Contacts

## Configuración para MVP

En el MVP 1, estos permisos son CRÍTICOS:
1. ✅ ACCESS_FINE_LOCATION (GPS)
2. ✅ INTERNET (APIs)
3. ✅ VIBRATE (Alarma)
4. ✅ DISABLE_KEYGUARD (Bloqueo de pantalla)

Los demás pueden habilitarse progresivamente en MVPs futuros.

## Documentación Oficial

- [Android Manifest Reference](https://developer.android.com/guide/topics/manifest/manifest-intro)
- [Android Permissions](https://developer.android.com/guide/topics/permissions/overview)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
