/**
 * Alarm Models
 * Based on: secureon-endpoints-payload.txt v1.0
 */

import { MetodoActivacion, MetodoUbicacion, PrioridadAlarma } from "./catalog.models";
import { Ubicacion } from "./evidence.models";

export type AlarmStatus = 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'PENDIENTE';
export type CancellationMethod = 'PASSWORD' | 'PIN' | 'PATTERN' | 'FINGERPRINT' | 'FACE_ID';

// ──────────────────────────────────────────────
// Location
// ──────────────────────────────────────────────



// ──────────────────────────────────────────────
// POST /alarma/nueva
// ──────────────────────────────────────────────

export interface AlarmActivationRequest {
  usuarioId: string;
  dispositivoId: string;         // DB-generated device ID (from login response)
  metodoActivacion: number;   // IDs from catalogo/metodos-activacion
  prioridad: number;             // ID from catalogo/prioridades-alarma
  ubicacion?: Ubicacion;
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
  ubicacion: Ubicacion;
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
  ubicacion: Ubicacion;
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
  ubicacionInicio: Ubicacion;
  ubicacionFin?: Ubicacion;
}

export interface AlarmConfig {
  tiempoActivacion: number;
  tiempoCancelacion: number;
  habilitado: boolean;
  metodosPermitidos: CancellationMethod[];
}
