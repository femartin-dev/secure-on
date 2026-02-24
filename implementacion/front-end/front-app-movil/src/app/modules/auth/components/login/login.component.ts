import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  passwordVisible = false;
  errorMessage = '';
  private errorTimeout: any;

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.bgVideo?.nativeElement?.play().catch(() => {});
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.loginForm.invalid) {
      await this.notificationService.showError('Completa todos los campos correctamente');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login(
        this.f['email'].value,
        this.f['password'].value
      );

      if (result.success) {
        this.router.navigate(['/main']);
      } else {
        this.showError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      this.showError('Error en la solicitud');
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  private showError(message: string): void {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorMessage = message;
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
