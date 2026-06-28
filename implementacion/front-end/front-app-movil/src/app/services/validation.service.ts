import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(private configService: ConfigService) {}

  validatePassword(password: string): boolean {
    const config = this.configService.getCurrentConfig();
    return config?.security?.passDesbloqueo === password;
  }

  validatePin(pin: number): boolean{
    const config = this.configService.getCurrentConfig();
    return config?.security?.pinDesbloqueo === pin;
  }

  validatePattern(pattern: number[]): boolean {
    const config = this.configService.getCurrentConfig();
    return JSON.stringify(config?.security?.patronDesbloqueo) === JSON.stringify(pattern);
  }

  validatePinFormat(value: number, maxPinLength: number): string {
    const pinDigits = value.toString().split('').map(Number);
    return !this.validateDigitFrequency(pinDigits, maxPinLength)
      ? `El PIN no puede contener más de ${Math.floor(maxPinLength / 2)} dígitos iguales`
      : !this.validateSequentialDigits(pinDigits)
        ? 'El PIN no puede contener dígitos secuenciales'
        : '';
  }

  private validateDigitFrequency(value: number[], maxPinLength: number): boolean {
    const frecuencia: Record<string, number> = {};
    for (const digito of value) {
      frecuencia[digito] = (frecuencia[digito] || 0) + 1;
      // Si ya superó la mitad, se invalida inmediatamente
      if (frecuencia[digito] > maxPinLength / 2) {
        return false;
      }
    }
    return true;
  }

  private validateSequentialDigits(value: number[]): boolean {
    for (let i = 0; i < value.length - 1; i++) {
      const currentDigit = value[i];
      const nextDigit = value[i + 1];
      if (nextDigit === currentDigit + 1 || nextDigit === currentDigit - 1) {
        return false;
      }
    }
    return true;
  }

  validatePasswordFormat(value: string): string [] {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minPassLength = 8;
    const maxPassLength = 20;
    const errors: string[] = [];
    if (value.length > maxPassLength) {
      errors.push(`La contraseña no puede tener más de ${maxPassLength} caracteres`);
    }
    if (value.length < minPassLength) {
      errors.push(`La contraseña debe tener al menos ${minPassLength} caracteres`);
    }
    if (!hasUpperCase) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    if (!hasLowerCase) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    if (!hasNumber) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!hasSpecialChar) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    return errors.length > 0 ? errors : [];
  }
}
