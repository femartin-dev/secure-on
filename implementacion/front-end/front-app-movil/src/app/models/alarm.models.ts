/**
 * Alarm Models
 * Based on: secureon-endpoints-payload.txt v1.0
 */

export type AlarmStatus = 'ACTIVA' | 'INACTIVA' | 'PENDIENTE';
export type CancellationMethod = 'PASSWORD' | 'PIN' | 'PATTERN' | 'FINGERPRINT' | 'FACE_ID';

// ──────────────────────────────────────────────
// Location
// ──────────────────────────────────────────────

export interface Ubicacion {
  latitud: number;
  longitud: number;
  altura?: number;
  precision?: number;
}

/** Legacy alias – kept for backward compat in geolocation service */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

/** Convert front-end LocationData → backend Ubicacion */
export function toUbicacion(loc: LocationData): Ubicacion {
  return {
    latitud: loc.latitude,
    longitud: loc.longitude,
    altura: 0,
    precision: loc.accuracy ?? 0
  };
}

// ──────────────────────────────────────────────
// POST /alarma/nueva
// ──────────────────────────────────────────────

export interface AlarmActivationRequest {
  usuarioId: string;
  dispositivoId: string;         // DB-generated device ID (from login response)
  metodosActivacion: number[];   // IDs from catalogo/metodos-activacion
  metodoUbicacion: number;       // ID from catalogo/metodos-ubicacion
  prioridad: number;             // ID from catalogo/prioridades-alarma
  ubicacion: Ubicacion;
}

export interface EstadoAlarma {
  id: number;
  descripcion: AlarmStatus;
}

export interface AlarmActivationResponse {
  alarmaId: string;
  fechaActivacion: string;
  estadoAlarma: EstadoAlarma;
}

// ──────────────────────────────────────────────
// POST /alarma/{alarmaId}/ubicacion
// ──────────────────────────────────────────────

export interface LocationUpdate {
  latitud: number;
  longitud: number;
  altura?: number;
  precision?: number;
}

// ──────────────────────────────────────────────
// PUT /alarma/{alarmaId}/finalizar
// ──────────────────────────────────────────────

export interface AlarmFinalizationRequest {
  motivo: string;
  detalles?: string;
}

// ──────────────────────────────────────────────
// POST /alarma/{alarmaId}/reactivar
// ──────────────────────────────────────────────

export interface AlarmReactivationRequest {
  dispositivoId?: string;   // query param in actual call
}

// ──────────────────────────────────────────────
// Legacy types (kept for backward compat)
// ──────────────────────────────────────────────

export interface AlarmCancellationRequest {
  alarmaId: string;
  usuarioId: string;
  metodo: CancellationMethod;
  valor: string;
  ubicacion: LocationData;
  timestamp: string;
}

export interface AlarmCancellationResponse {
  alarmaId: string;
  status: AlarmStatus;
  mensaje: string;
}

export interface AlarmBlockRequest {
  alarmaId: string;
  usuarioId: string;
  dispositivoAppId: string;
  ubicacion: LocationData;
  timestamp: string;
}

export interface AlarmIncident {
  id: string;
  usuarioId: string;
  dispositivoId: string;
  estado: AlarmStatus;
  fechaInicio: string;
  fechaFin?: string;
  motivo?: string;
  metodoFinalizacion?: CancellationMethod;
  ubicacionInicio: LocationData;
  ubicacionFin?: LocationData;
}

export interface AlarmConfig {
  tiempoActivacion: number;
  tiempoCancelacion: number;
  habilitado: boolean;
  metodosPermitidos: CancellationMethod[];
}
