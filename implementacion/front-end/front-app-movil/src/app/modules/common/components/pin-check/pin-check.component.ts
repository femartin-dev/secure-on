import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { arrayGenerator } from '../../../../utils/constants.util';

export type PinCheckOutput = {
  pin: number;
  complete: boolean;
}


@Component({
  selector: 'app-pin-check',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './pin-check.component.html',
  styleUrl: './pin-check.component.css',
})
export class PinCheckComponent {
  @Output() pinOutput = new EventEmitter<PinCheckOutput>();

  pinDigits: number[] = [];
  pinValue: string = '';
  digits: number[] = [];
  showPin: boolean = false;
  @Input() error: string | null = null;
  @Input() loading: boolean = false;
  @Input() maxPinLength: number = 4;
  @Input() pinSubtitle: string = 'para desactivar la alarma';
  @Input() showHeadline: boolean = true;

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
    const output = {
      pin: parseInt(this.pinValue),
      complete,
    };
    this.pinOutput.emit(output);
  }


}
