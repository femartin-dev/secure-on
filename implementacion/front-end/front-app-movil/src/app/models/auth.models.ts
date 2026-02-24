/**
 * Authentication Models
 */

export interface LoginRequest {
  email: string;
  password: string;
  dispositivoAppId: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dispositivoId: string;
  expiracion: string;
}

export interface DeviceInfo {
  dispositivoAppId: string;
  modelo: string;
  plataforma: string;
  versionSO: string;
  fabricante: string;
  esVirtual: boolean;
  tipoDispositivo: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  dispositivo: DeviceInfo;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaRegistro: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordRecoveryResponse {
  mensaje: string;
  codigo?: string;
}

export interface ResetPasswordRequest {
  email: string;
  codigo: string;
  nuevaPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  dispositivoId: string;
  token: string;
  expiracion: string;
}

export interface TokenResponse {
  token: string;
  nuevoToken: string;
}
