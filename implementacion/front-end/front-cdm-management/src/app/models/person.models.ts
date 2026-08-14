export interface PersonData {
  nombre: string;
  apellido: string;
  email: string;
  direccion?: string;
  tipo?: TipoUsuario;
}

export interface User extends PersonData {
  id: string;
  telefono?: string;
  activo: boolean;
}

export interface Operator extends PersonData {
  id: string;
  legajo: number;
  telefono?: string;
  esAdministrador: boolean;
  supervisorId?: string;
  activo: boolean;
  ultimoLogin?: Date;
}

export interface Supervisor extends Operator {}

export enum TipoUsuario {
    ADMINISTRADOR = 'ADMIN',
    OPERADOR = 'OPER',
    SUPERVISOR = 'SUPER',
    USUARIO = 'USER',
}   