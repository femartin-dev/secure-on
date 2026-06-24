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
  @Output() pinOutput = new EventEmitter<string>();

  password: string = '';
  showPassword: boolean = false;
  @Input() loadingAuth: boolean = false;
  @Input() error: string | null = null;

  passwordSubmit() {
    this.pinOutput.emit(this.password);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearPassword(): void {
    this.password = '';
  }
}
