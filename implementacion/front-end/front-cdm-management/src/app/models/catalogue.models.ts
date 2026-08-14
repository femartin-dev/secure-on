export interface Catalogue {
  id: number;
  descripcion: string;
  habilitada?: boolean;
}

export interface EstadoAsignacion extends Catalogue {
  color?: string;
  icon?: string;
}

export interface EstadoAlarma extends Catalogue {
  color?: string;
  icon?: string;
}

export interface TipoAutoridad extends Catalogue {
  color?: string;
  icon?: string;
}

export interface PrioridadAlarma extends Catalogue {
  color?: string;
  icon?: string;
}

export interface CatalogsResponse {
  estadosAlarma?: EstadoAlarma[];
  metodosUbicacion?: Catalogue[];
  metodosActivacion?: Catalogue[];
  idiomas?: Catalogue[];
  prioridades?: PrioridadAlarma[];
  canalesNotificacion?: Catalogue[];
  estadosEnvio?: Catalogue[];
  estadosAsignacion?: EstadoAsignacion[];
  tiposAutoridad?: TipoAutoridad[];
}