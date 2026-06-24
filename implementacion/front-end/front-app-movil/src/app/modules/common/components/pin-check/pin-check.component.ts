import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { arrayGenerator } from '../../../../utils/constants.util';

export type PinCheckComponentOutput = {
  pin: number;
  complete: boolean;
  valid: boolean;
}


@Component({
  selector: 'app-pin-check',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './pin-check.component.html',
  styleUrl: './pin-check.component.css',
})
export class PinCheckComponent {
  @Output() pinOutput = new EventEmitter<PinCheckComponentOutput>();

  pinDigits: number[] = [];
  pinValue: string = '';
  digits: number[] = [];
  showPin: boolean = false;
  @Input() error: string | null = null;
  @Input() loadingAuth: boolean = false;
  @Input() maxPinLength: number = 4;
  @Input() pinSubtitle: string = 'para desactivar la alarma';

  ngOnInit() {
    this.pinDigits = arrayGenerator(this.maxPinLength);
    this.digits = arrayGenerator(9, 1);
  }

  togglePinValueVisibility(): void {
    this.showPin = !this.showPin;
  }

  addPinDigit(digit: number): void {
    if (this.pinValue.length >= this.maxPinLength) {
      throw new Error(`PIN length cannot exceed ${this.maxPinLength} digits.`);
    }
    this.pinValue += digit.toString();
    this.emitPin();
  }

  clearPin(): void {
    this.pinValue = '';
    this.pinDigits = arrayGenerator(this.maxPinLength);
    this.emitPin();
  }

  removePinDigit(): void {
    if (this.pinValue.length === 0) {
      return;
    }
    this.pinValue = this.pinValue.slice(0, -1);
    this.emitPin();
  }

  private emitPin(): void {
    const complete = this.pinValue.length === this.maxPinLength;
    this.error = complete ? this.validatePin() : '';
    const valid = complete && this.error === '';
    const output = {
      pin: parseInt(this.pinValue),
      complete,
      valid,
    };
    this.pinOutput.emit(output);
  }

  private validatePin(): string {
    return !this.validateDigitFrequency() ? `El PIN no puede contener más de ${Math.floor(this.maxPinLength / 2)} dígitos iguales`
        : !this.validateSequentialDigits() ? 'El PIN no puede contener dígitos secuenciales' : '';
  }

  private validateDigitFrequency(): boolean {
    const frecuencia: Record<string, number> = {};
    for (const digito of this.pinValue) {
      frecuencia[digito] = (frecuencia[digito] || 0) + 1;
      // Si ya superó la mitad, se invalida inmediatamente
      if (frecuencia[digito] > this.maxPinLength / 2) {
        return false;
      }
    }
    return true;
  }

  private validateSequentialDigits(): boolean {
    for (let i = 0; i < this.pinValue.length - 1; i++) {
      const currentDigit = parseInt(this.pinValue[i]);
      const nextDigit = parseInt(this.pinValue[i + 1]);
      if (nextDigit === currentDigit + 1 || nextDigit === currentDigit - 1) {
        return false;
      }
    }
    return true;
  }


}
