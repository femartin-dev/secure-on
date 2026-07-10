import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-check',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './password-check.component.html',
  styleUrl: './password-check.component.css',
})
export class PasswordCheckComponent {
  @Output() passwordOutput = new EventEmitter<string>();

  password: string = '';
  showPassword: boolean = false;
  @Input() loading: boolean = false;
  @Input() error: string[] | string | null = null;
  @Input() showHeadline: boolean = true;

  passwordSubmit() {
    this.passwordOutput.emit(this.password);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearPassword(): void {
    this.password = '';
  }

  errorArray(): string[] {
    if (Array.isArray(this.error)) {
      return this.error;
    } else if (typeof this.error === 'string') {
      return [this.error];
    } else {
      return [];
    }
  }
}
