/**
 * Configuration Models
 */

import { CancellationMethod } from './alarm.models';

export interface AppConfig {
  general: GeneralSettings;
  activation: ActivationSettings;
  security: SecuritySettings;
  performance: PerformanceSettings;
  notifications: NotificationSettings;
}

export interface GeneralSettings {
  nombreDispositivo: string;
  numeroTelefono: string;
  correoEmergencia: string;
  idioma: string;
  zonaHoraria: string;
}

export interface ActivationSettings {
  tiempoActivacion: number;
  tiempoCancelacion: number;
  vibracionHabilitada: boolean;
  sonoroHabilitado: boolean;
  volumenSonoro: number;
}

export interface SecuritySettings {
  metodosDesbloqueo: CancellationMethod[];
  requerirHuellaPrimero: boolean;
  cambiarContrasenaAuto: boolean;
  diasParaCambio: number;
}

export interface PerformanceSettings {
  actualizarGPS: number; // milliseconds
  callidadGPS: 'ALTA' | 'MEDIA' | 'BAJA';
  registrosLocales: boolean;
  borrarDatos: number; // dias
}


export interface NotificationSettings {
  notificacionesHabilitadas: boolean;
  notificacionesVoz: boolean;
  vibracionalEnable: boolean;
}

export type CatalogType = {
  id: number;
  descripcion: string;
}

export interface Contact {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  relacion: string;
  canalNotificaiones: CatalogType[];
  esPrimario: boolean;
  esEmergencia: boolean;
}

// payload expected by backend when creating/updating
export interface ContactRequest {
  nombre: string;
  apellido: string;
  relacion: string;
  telefono: string;
  email: string;
  canalId: number; // list of catalog IDs
  prioridad: boolean;
}
export interface ContactResponse {
  contacts: Contact[];
  total: number;
}
