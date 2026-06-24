import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification-toast.service';
import { Constants } from '@app/utils/constants.util';


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

  /** Acepta email válido o número de teléfono (7-15 dígitos, opcionalmente con +, espacios, guiones o paréntesis) */
  private emailOrPhoneValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const val: string = (control.value ?? '').trim();
      if (!val) return null; // required se encarga del vacío
      return Constants.EMAIL_REGEXP.test(val) || Constants.PHONE_REGEXP.test(val) ? null : { usuarioInvalido: true };
    };
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required, this.emailOrPhoneValidator()]],
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
        this.f['usuario'].value.trim(),
        Constants.EMAIL_REGEXP.test(this.f['usuario'].value.trim()) ? 'email' : 'telefono',
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
