export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'operator' | 'supervisor';
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}


export interface LoginRequest {
  username: string;
  password: string;
  appId?: string; // Opcional: para identificar dispositivo o mock en web
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword?: string;
  legajo?: number;
  supervisorId?: string;
}

export interface Supervisor {
  id: string;
  nombre: string;
  apellido: string;
  legajo: number;
}
