import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  editingProfile = false;
  changingPassword = false;
  confirmingDelete = false;
  passwordError = '';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: [{ value: 'Juan', disabled: true }, Validators.required],
      lastName: [{ value: 'Pérez', disabled: true }, Validators.required],
      phone: [{ value: '+54 11 5555 5555', disabled: true }, Validators.required],
      email: [
        { value: 'juan.perez@email.com', disabled: true },
        [Validators.required, Validators.email],
      ],
      address: [{ value: 'Calle Falsa 123', disabled: true }, Validators.required],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onEditProfile(): void {
    this.editingProfile = true;
    this.profileForm.enable();
  }

  onCancelEdit(): void {
    this.editingProfile = false;
    this.profileForm.disable();
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // TODO: conectar con API para guardar perfil
    console.log('Perfil actualizado:', this.profileForm.getRawValue());

    this.editingProfile = false;
    this.profileForm.disable();
  }

  onTogglePasswordChange(): void {
    this.changingPassword = !this.changingPassword;
    this.passwordError = '';
    if (!this.changingPassword) {
      this.passwordForm.reset();
    }
  }

  onChangePassword(): void {
    this.passwordError = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordError = 'La confirmación no coincide con la nueva contraseña.';
      return;
    }

    // TODO: conectar con API para cambiar contraseña
    console.log('Contraseña cambiada');

    this.passwordForm.reset();
    this.changingPassword = false;
  }

  onRequestDelete(): void {
    this.confirmingDelete = true;
  }

  onCancelDelete(): void {
    this.confirmingDelete = false;
  }

  onConfirmDelete(): void {
    // TODO: conectar con API para solicitar baja
    console.log('Solicitud de baja enviada');
    this.confirmingDelete = false;
  }

  onBackToMain(): void {
    this.router.navigate(['/main']);
  }
}
