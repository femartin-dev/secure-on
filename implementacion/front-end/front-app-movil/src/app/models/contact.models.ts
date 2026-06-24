import { CatalogType } from "./catalog.models";


export interface Contact {
  id: string;
  userId: string;
  nombre: string;
  apellido: string;
  telefono: string;
  relacion: string;
  canalNotificacion: CatalogType[];
  esPrincipal: boolean;
}

// payload expected by backend when creating/updating
export interface ContactRequest {
  userId: string;
  nombre: string;
  relacion: string;
  telefono: string;
  canalId: number; // list of catalog IDs
  esPrincipal: boolean;
}
export interface ContactResponse {
  contacts: Contact[];
  total: number;
}
