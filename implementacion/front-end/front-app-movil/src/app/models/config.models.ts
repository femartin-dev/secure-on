/**
 * Configuration Models
 * Mirrors backend ConfigurationRequest
 */

// ─── Flat request/response matching the backend ────────────────────────────

export interface Configuracion {
  id: string;
  usuarioId: string;
  dispositivoId: string;

  // General
  idiomaId: string; // default "es"
  modoDark: boolean; // default false
  modoSigilosoActivo: boolean; // default false

  // Activation
  fraseActivacionVoz: string | null; // default "Secureon Ayuda"
  patronActivacion: Pattern | null; // JsonNode
  sensibilidadMovimiento: string | null;
  tiempoCancelacionSeg: number; // default 15
  tiempoActivacionSeg: number; // default 3

  // Security / Unlock
  patronDesbloqueo: Pattern | null; // JsonNode
  pinDesbloqueo: number | null;
  passDesbloqueo: string | null;
  nroIntentosFallidos: number; // default 5

  // Notifications
  notificarSiempreSms: boolean; // default false
  templateMensaje: string | null;

  // Media capture
  frecuenciaCapturaFotos: number; // default 30 s
  frecuenciaGrabaAudio: number; // default 60 s
  compresionAudio: string; // default "MP3"
  resolucionFotosDpi: number; // default 300.0
  umbralMinimoLux: number | null;
  usarFiltrosRuido: boolean; // default true

  // Location
  frecuenciaUbicacion: number; // default 15 s
  precisionRed: number; // default 2000 m
  ubicacionWifi: boolean; // default true

  // Storage / Evidence
  conservarEvidencias: boolean; // default true
  retencionEvidenciasDias: number; // default 30
  limiteEspacioEvidencias: number; // default 1000 MB
  borrarAntiguas: boolean; // default true
  borrarEnviadas: boolean; // default true
  espacioCriticoPct: number; // default 1000.0
  conservarHistorialLocal: number; // default 30 days

  // Network
  usarDatosMoviles: boolean; // default true
  limiteDatos: number; // default 1000 MB
  envioSoloWifi: boolean; // default false

  // Battery thresholds
  umbralBateriaMedia: number; // default 50 %
  umbralBateriaBaja: number; // default 20 %
  umbralBateriaCritica: number; // default 5 %
}

// ─── Subdivided view model used by the UI ──────────────────────────────────

export interface GeneralSettings {
  idiomaId: string;
  modoSigilosoActivo: boolean;
  modoDarkActivo: boolean;
}

export interface ActivationSettings {
  tiempoActivacionSeg: number;
  comandosVozActivo: boolean;
  fraseActivacionVoz: string | null;
  patronActivo: boolean;
  patronActivacion: Pattern | null;
  movimientoActivo: boolean;
  sensibilidadMovimiento: string | null;
  tiempoCancelacionSeg: number;
}

export interface SecuritySettings {
  patronDesbloqueoActivo?: boolean;
  patronDesbloqueo: Pattern | null;
  pinDesbloqueoActivo?: boolean;
  pinDesbloqueo: number | null;
  passDesbloqueoActivo?: boolean;
  passDesbloqueo: string | null;
  nroIntentosFallidos: number;
}

export interface NotificationSettings {
  frecuenciaUbicacion: number;
  frecuenciaCapturaFotos: number;
  frecuenciaGrabaAudio: number;
  notificarSiempreSms: boolean;
  templateMensaje: string | null;
}

export interface MediaSettings {
  compresionAudio: string;
  resolucionFotosDpi: number;
  umbralMinimoLux: number | null;
  usarFiltrosRuido: boolean;
}

export interface LocationSettings {
  precisionRed: number;
  ubicacionWifi: boolean;
}

export interface StorageSettings {
  conservarEvidencias: boolean;
  retencionEvidenciasDias: number;
  limiteEspacioEvidencias: number;
  borrarAntiguas: boolean;
  borrarEnviadas: boolean;
  espacioCriticoPct: number;
  conservarHistorialLocal: number;
}

export interface NetworkSettings {
  usarDatosMoviles: boolean;
  limiteDatos: number;
  envioSoloWifi: boolean;
}

export interface BatterySettings {
  umbralBateriaMedia: number;
  umbralBateriaBaja: number;
  umbralBateriaCritica: number;
}

/** Composed view model – used in components / forms */
export interface AppSettings {
  id: string;
  usuarioId: string;
  dispositivoId: string;
  general: GeneralSettings;
  activation: ActivationSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  media: MediaSettings;
  location: LocationSettings;
  storage: StorageSettings;
  network: NetworkSettings;
  battery: BatterySettings;
}

export interface Pattern {
  patternPoints: number[];
}

export function toAppSettings(config: Configuracion): AppSettings {
    const responseConfig: AppSettings = {
      id: config.id,
      usuarioId: config.usuarioId,
      dispositivoId: config.dispositivoId,
      general: {
        idiomaId: config.idiomaId,
        modoSigilosoActivo: config.modoSigilosoActivo,
        modoDarkActivo: config.modoDark ?? false,
      } as GeneralSettings,
      activation: {
        comandosVozActivo: !!config.fraseActivacionVoz,
        fraseActivacionVoz: config.fraseActivacionVoz,
        patronActivo: !!config.patronActivacion,
        patronActivacion: config.patronActivacion,
        movimientoActivo: !!config.sensibilidadMovimiento,
        sensibilidadMovimiento: config.sensibilidadMovimiento,
        tiempoCancelacionSeg: config.tiempoCancelacionSeg,
        tiempoActivacionSeg: config.tiempoActivacionSeg,
      } as ActivationSettings,
      security: {
        patronDesbloqueo: config.patronDesbloqueo,
        pinDesbloqueo: config.pinDesbloqueo,
        passDesbloqueo: config.passDesbloqueo,
        nroIntentosFallidos: config.nroIntentosFallidos,
      } as SecuritySettings,
      notifications: {
        frecuenciaUbicacion: config.frecuenciaUbicacion,
        frecuenciaCapturaFotos: config.frecuenciaCapturaFotos,
        frecuenciaGrabaAudio: config.frecuenciaGrabaAudio,
        notificarSiempreSms: config.notificarSiempreSms,
        templateMensaje: config.templateMensaje,
      } as NotificationSettings,
      media: {
        compresionAudio: config.compresionAudio,
        resolucionFotosDpi: config.resolucionFotosDpi,
        umbralMinimoLux: config.umbralMinimoLux,
        usarFiltrosRuido: config.usarFiltrosRuido,
      } as MediaSettings,
      location: {
        precisionRed: config.precisionRed,
        ubicacionWifi: config.ubicacionWifi,
      } as LocationSettings,
      storage: {
        conservarEvidencias: config.conservarEvidencias,
        retencionEvidenciasDias: config.retencionEvidenciasDias,
        limiteEspacioEvidencias: config.limiteEspacioEvidencias,
        borrarAntiguas: config.borrarAntiguas,
        borrarEnviadas: config.borrarEnviadas,
        espacioCriticoPct: config.espacioCriticoPct,
        conservarHistorialLocal: config.conservarHistorialLocal,
      } as StorageSettings,
      network: {
        usarDatosMoviles: config.usarDatosMoviles,
        limiteDatos: config.limiteDatos,
        envioSoloWifi: config.envioSoloWifi,
      } as NetworkSettings,
      battery: {
        umbralBateriaMedia: config.umbralBateriaMedia,
        umbralBateriaBaja: config.umbralBateriaBaja,
        umbralBateriaCritica: config.umbralBateriaCritica,
      } as BatterySettings,
    };
    return responseConfig;
}

export function toConfiguracion(config: AppSettings): Configuracion{
    return {
      id: config.id,
      usuarioId: config.usuarioId,
      dispositivoId: config.dispositivoId,
      idiomaId: config.general.idiomaId,
      modoSigilosoActivo: config.general.modoSigilosoActivo,
      modoDark: config.general.modoDarkActivo,
      tiempoActivacionSeg: config.activation.tiempoActivacionSeg,
      fraseActivacionVoz: config.activation.comandosVozActivo ? config.activation.fraseActivacionVoz : '',
      patronActivacion: config.activation.patronActivo ? config.activation.patronActivacion : null,
      sensibilidadMovimiento: config.activation.movimientoActivo ? config.activation.sensibilidadMovimiento : '',
      tiempoCancelacionSeg: config.activation.tiempoCancelacionSeg,
      patronDesbloqueo: config.security.patronDesbloqueoActivo ? config.security.patronDesbloqueo : null,
      pinDesbloqueo: config.security.pinDesbloqueoActivo ? config.security.pinDesbloqueo : null,
      passDesbloqueo: config.security.passDesbloqueoActivo ? config.security.passDesbloqueo : null,
      nroIntentosFallidos: config.security.nroIntentosFallidos,
      frecuenciaUbicacion: config.notifications.frecuenciaUbicacion,
      frecuenciaCapturaFotos: config.notifications.frecuenciaCapturaFotos,
      frecuenciaGrabaAudio: config.notifications.frecuenciaGrabaAudio,
      notificarSiempreSms: config.notifications.notificarSiempreSms,
      templateMensaje: config.notifications.templateMensaje,
      compresionAudio: config.media.compresionAudio,
      resolucionFotosDpi: config.media.resolucionFotosDpi,
      umbralMinimoLux: config.media.umbralMinimoLux,
      usarFiltrosRuido: config.media.usarFiltrosRuido,
      precisionRed: config.location.precisionRed,
      ubicacionWifi: config.location.ubicacionWifi,
      conservarEvidencias: config.storage.conservarEvidencias,
      retencionEvidenciasDias: config.storage.retencionEvidenciasDias,
      limiteEspacioEvidencias: config.storage.limiteEspacioEvidencias,
      borrarAntiguas: config.storage.borrarAntiguas,
      borrarEnviadas: config.storage.borrarEnviadas,
      espacioCriticoPct: config.storage.espacioCriticoPct,
      conservarHistorialLocal: config.storage.conservarHistorialLocal,
      usarDatosMoviles: config.network.usarDatosMoviles,
      limiteDatos: config.network.limiteDatos,
      envioSoloWifi: config.network.envioSoloWifi,
      umbralBateriaMedia: config.battery.umbralBateriaMedia,
      umbralBateriaBaja: config.battery.umbralBateriaBaja,
      umbralBateriaCritica: config.battery.umbralBateriaCritica,
    };
}

