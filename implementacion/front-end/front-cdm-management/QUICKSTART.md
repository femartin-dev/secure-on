# Guía de Inicio Rápido - Secureon Dashboard

## ⚡ Pasos Iniciales (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Google Maps API
En `src/environments/environment.ts`, reemplaza:
```typescript
googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
```

Obtén una key gratuita en: https://console.cloud.google.com/

### 3. Iniciar el servidor
```bash
npm start
```

Accede a: `http://localhost:4200`

## 🔑 Credenciales de Prueba

### Admin
- Usuario: `admin`
- Contraseña: `admin123`

### Operador
- Usuario: `operator`
- Contraseña: `operator123`

## 📱 Funciones Principales

### Dashboard
- Visualizar mapa con alertas activas
- Lista paginable de alarmas
- Filtrar por tipo y prioridad
- Menú lateral de usuario

### Detalles de Alarma
Acceder desde dashboard → Click en alarma → Ver Detalle

**Modos disponibles:**
1. **Ver** - Solo lectura
2. **Editar** - Cambiar estado y notas
3. **Verificar** - Marcar como verificado
4. **Notificar** - Contactar autoridades

### Registro de Usuarios (Solo Admin)
1. Menú → Registrar Usuario
2. Completar formulario
3. El nuevo usuario puede loguear inmediatamente

## 🎯 Estructura de Carpetas

```
src/
├── app/
│   ├── components/        # Componentes Angular
│   ├── services/          # Servicios HTTP y Socket
│   ├── models/            # Interfaces TypeScript
│   ├── guards/            # Guards de protección
│   └── interceptors/      # Interceptores HTTP
├── environments/          # Configuración por ambiente
└── styles.css            # Estilos globales
```

## 🔄 Flujo de Datos

```
Login → Dashboard → Select Alert → Detail View
  ↓
Socket.IO            Real-time
Updates              Updates
  ↓
Alert List          Map Markers
```

## 🛠️ Desarrollo

### Crear nuevo componente
```bash
ng generate component components/nuevo-componente
```

### Build para producción
```bash
npm run build
```

## 💾 Variables de Entorno

Crear archivo `.env`:
```
API_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000
GOOGLE_MAPS_KEY=tu-clave-aqui
```

## 🐛 Problemas Comunes

### "Cannot find module"
→ Ejecutar `npm install`

### Google Maps no funciona
→ Verificar clave API en Google Cloud Console

### Socket no conecta
→ Verificar que servidor está en puerto 3000

## 📞 Puertos Usados

- Angular Dev: `4200`
- Backend API: `3000`
- Socket.IO: `3000` (mismo que backend)

## 🎨 Tema

El proyecto usa **Tailwind CSS Dark Mode** por defecto.

Para cambiar colores, edita `tailwind.config.js`:
```javascript
colors: {
  "primary": "#183daa",    // Azul principal
  "background-dark": "#111521",
  // ...
}
```

## 📚 Recursos

- [Angular 18 Docs](https://angular.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.IO](https://socket.io)
- [Google Maps API](https://developers.google.com/maps)

---

**Versión**: 1.0.0
**Última actualización**: Febrero 2026
