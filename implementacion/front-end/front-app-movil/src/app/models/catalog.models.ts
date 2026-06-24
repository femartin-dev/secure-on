/**
 * Catalog Models
 * Based on: secureon-endpoints-payload.txt v1.0
 * MS-APP-MOVIL - CatalogoController
 */

export type CatalogType = {
  id: number;
  descripcion: string;
};

// ──────────────────────────────────────────────
// GET /catalogo/estados-alarma
// ──────────────────────────────────────────────

export interface EstadoAlarma extends CatalogType {
  color: string;
  icono: string;
}

// ──────────────────────────────────────────────
// GET /catalogo/canales-notificacion
// ──────────────────────────────────────────────

export interface CanalNotificacion extends CatalogType {
  icono: string;
  svgIcono?: string;
  color: string;
  orden: number;
}

// ──────────────────────────────────────────────
// GET /catalogo/estados-envio
// ──────────────────────────────────────────────

export interface EstadoEnvio extends CatalogType {
  icono: string;
  orden: number;
}

// ──────────────────────────────────────────────
// GET /catalogo/idiomas
// ──────────────────────────────────────────────

export interface Idioma {
  id: string;
  icono: string;
  color: string;
  descripcion: string;
  habilitada: boolean;
}

// ──────────────────────────────────────────────
// GET /catalogo/metodos-activacion
// ──────────────────────────────────────────────

export interface MetodoActivacion extends CatalogType {
  icono: string;
  orden: number;
}

// ──────────────────────────────────────────────
// GET /catalogo/metodos-ubicacion
// ──────────────────────────────────────────────

export interface MetodoUbicacion extends CatalogType {
  precision: number;
}

// ──────────────────────────────────────────────
// GET /catalogo/prioridades-alarma
// ──────────────────────────────────────────────

export interface PrioridadAlarma extends CatalogType {
  nivel: number;
  color: string;
}

export interface CatalogsResponse {
    estadosAlarma?: EstadoAlarma[];
    metodosUbicacion?: MetodoUbicacion[];
    metodosActivacion?: MetodoActivacion[];
    idiomas?: Idioma[];
    prioridades?: PrioridadAlarma[];
    canalesNotificacion?: CanalNotificacion[];
    estadosEnvio?: EstadoEnvio[];
}
