/**
 * Catalog Models
 * Based on: secureon-endpoints-payload.txt v1.0
 * MS-APP-MOVIL - CatalogoController
 */

// ──────────────────────────────────────────────
// Paginated response wrapper
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  contenido: T[];
  totalElementos: number;
  numeroPagina: number;
  tamanioPagina: number;
  totalPaginas: number;
  primeraPagina: boolean;
  ultimaPagina: boolean;
}

// ──────────────────────────────────────────────
// GET /catalogo/estados-alarma
// ──────────────────────────────────────────────

export interface EstadoAlarma {
  id: number;
  descripcion: string;
  color: string;
  icono: string;
}

// ──────────────────────────────────────────────
// GET /catalogo/canales-notificacion
// ──────────────────────────────────────────────

export interface CanalNotificacion {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// ──────────────────────────────────────────────
// GET /catalogo/estados-envio
// ──────────────────────────────────────────────

export interface EstadoEnvio {
  id: number;
  nombre: string;
  descripcion: string;
}

// ──────────────────────────────────────────────
// GET /catalogo/idiomas
// ──────────────────────────────────────────────

export interface Idioma {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

// ──────────────────────────────────────────────
// GET /catalogo/metodos-activacion
// ──────────────────────────────────────────────

export interface MetodoActivacion {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
}

// ──────────────────────────────────────────────
// GET /catalogo/metodos-ubicacion
// ──────────────────────────────────────────────

export interface MetodoUbicacion {
  id: number;
  nombre: string;
  descripcion: string;
  precision: number;
}

// ──────────────────────────────────────────────
// GET /catalogo/prioridades-alarma
// ──────────────────────────────────────────────

export interface PrioridadAlarma {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: number;
  color: string;
}
