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
}

export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}
