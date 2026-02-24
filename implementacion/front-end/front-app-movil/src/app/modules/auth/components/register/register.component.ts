import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification.service';
import { DeviceInfo } from '@app/models/auth.models';
import { pegarDesdeClipboard } from '../../../../utils/clipboard-util.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  errorMessage = '';
  private errorTimeout: any;

  deviceInfo: DeviceInfo | null = null;
  deviceInfoLoaded = false;

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDeviceInfo();
  }

  ngAfterViewInit(): void {
    this.bgVideo?.nativeElement?.play().catch(() => {});
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
        direccion: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        aceptarTerminos: [false, [Validators.requiredTrue]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Load device information using Capacitor Device plugin
   */
  private async loadDeviceInfo(): Promise<void> {
    try {
      const [deviceId, deviceInfoRaw] = await Promise.all([
        Device.getId(),
        Device.getInfo()
      ]);

      const platform = deviceInfoRaw.platform; // 'ios' | 'android' | 'web'
      let tipoDispositivo = 'SMARTPHONE';
      let dispositivoAppId = deviceId.identifier;
      if (platform === 'web') {
        tipoDispositivo = 'WEB_BROWSER';
        const clipboardText = await pegarDesdeClipboard();
        dispositivoAppId = clipboardText || deviceId.identifier;
      }

      this.deviceInfo = {
        dispositivoAppId,
        modelo: deviceInfoRaw.model || 'Desconocido',
        plataforma: platform,
        versionSO: deviceInfoRaw.osVersion || 'Desconocido',
        fabricante: deviceInfoRaw.manufacturer || 'Desconocido',
        esVirtual: deviceInfoRaw.isVirtual,
        tipoDispositivo
      };

      this.deviceInfoLoaded = true;
      console.log('Device info loaded:', this.deviceInfo);
    } catch (error) {
      console.error('Error loading device info:', error);
      // Fallback for browser testing
      this.deviceInfoLoaded = false;
    }
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      if (!this.f['aceptarTerminos'].value) {
        this.showError('Debes aceptar los términos y condiciones');
      } else {
        this.showError('Completa todos los campos correctamente');
      }
      return;
    }

    if (!this.deviceInfo) {
      this.showError('No se pudo obtener la información del dispositivo. Reintentando...');
      await this.loadDeviceInfo();
      if (!this.deviceInfo) {
        this.showError('Error al obtener información del dispositivo');
        return;
      }
    }

    this.loading = true;

    try {
      // 1) Register user
      const response = await this.authService.register({
        nombre: this.f['nombre'].value.trim(),
        apellido: this.f['apellido'].value.trim(),
        email: this.f['email'].value.trim(),
        password: this.f['password'].value,
        telefono: this.f['telefono'].value?.trim() || undefined,
        direccion: this.f['direccion'].value?.trim() || undefined,
        dispositivo: this.deviceInfo
      }).toPromise();

      if (response) {
        await this.notificationService.showSuccess('Cuenta creada exitosamente');

        // register the device immediately for the new user
        try {
          await this.authService.registerDeviceForUser(
            response.userId, // userId returned from registration
            this.deviceInfo!.dispositivoAppId,
            this.f['telefono'].value?.trim() || ''
          ).toPromise();
        } catch (err) {
          console.warn('Device registration failed:', err);
        }

        // without logging in auto, send user to login screen
        await new Promise((resolve) => setTimeout(resolve, 1500));
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.showError(
        error?.message || error?.error?.mensaje || 'Error al crear la cuenta'
      );
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private showError(message: string): void {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorMessage = message;
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
