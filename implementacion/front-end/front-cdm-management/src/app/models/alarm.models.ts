import { EstadoAlarma, EstadoAsignacion, PrioridadAlarma } from "./catalogue.models";
import { PersonData, Operator, User } from "./person.models";

export interface Alarm {
  asignacionId: string;
  alarmaId: string;
  operador: Operator;
  usuario: User;
  dispositivo: Device;
  fechaActivacion: Date;
  fechaFinalizacion: Date;
  fechaAsignacion: Date;
  fechaVerificacion: Date;
  esAsignacionAuto: boolean;
  estadoAlarma: EstadoAlarma;
  estadoAsignacion: EstadoAsignacion;
  prioridad: PrioridadAlarma;
  ultimaUbicacion?: Location;
  ubicacionesAnteriores?: Location[];
  falsaAlarma?: boolean;
  tipoAlarma?: string;
  evidencias?: string[];
  autoridades?: Authority[];
  observaciones?: string;
}

export interface Contact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Authority {
  id: string;
  type: number;
  name: string;
  unit: string;
  phone: string;
  eta: number; // estimated time in minutes
  distance: number; // in kilometers
}

export interface PaginatedAlarms {
  content: Alarm[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Device {
  id: string;
  numero: string;
  so: string;
}

export interface Location {
  id: string;
  latitud: number;
  longitud: number;
  precisionToma: number;
  metodoUbicacionId: string;
  bateriaNivel: number;    
  velocidad: number;
  altura: number;
  rumbo: number;
  fechaToma: Date;
}

export interface AlarmFilterQuery {
  estadoId?: number;
  prioridad?: number;
  estadoAsignacion?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  operadorId?: string;
  asignacionId?: number;
}