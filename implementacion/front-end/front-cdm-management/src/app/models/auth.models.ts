import { Operator, PersonData } from "./person.models";



export interface LoginRequest {
  email?: string;
  legajo?: number;
  password: string;
  dispositivoAppId: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  legajo: number;
  esAdministrador: boolean;
  expiracion: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  email: string;
  legajo: number;
  password: string;
  esAdministrador: boolean;
  supervisorId: string | null;
}

export interface RegisterResponse extends PersonData {
  operadorId: string;
  legajo: number;
  esAdministrador: boolean;
}



