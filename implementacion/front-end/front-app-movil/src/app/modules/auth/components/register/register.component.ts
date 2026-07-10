import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification-toast.service';
import { ValidationService } from '@app/services/validation.service';
import { RegisterRequest, RegisterResponse } from '@app/models/auth.models';
import { DeviceInformation,  DeviceRegistration } from '@app/models/device.models';
import { getClipboard } from '../../../../utils/clipboard-util.util';
import { PhoneFormatPipe } from '@app/modules/common/pipes/phone/phone-format.pipe';
import { Constants } from '@app/utils/constants.util';
import { DeviceService } from '@app/services/device.service';
import { catchError } from 'rxjs';
import { ConfigService } from '@app/services/config.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  errorMessage = '';
  private errorTimeout: any;

  deviceInfo: DeviceInformation | null = null;
  deviceInfoLoaded = false;
  private telefonoPipe: PhoneFormatPipe = new PhoneFormatPipe();

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router,
    private notificationService: NotificationService,
    private deviceService: DeviceService,
    private configService: ConfigService
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
        telefono: ['', [Validators.required, Validators.pattern(Constants.PHONE_REGEXP)]],
        direccion: [''],
        password: ['', [Validators.required, this.passwordFormatValidator]],
        confirmPassword: ['', [Validators.required]],
        aceptarTerminos: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Load device information using Capacitor Device plugin
   */
  private async loadDeviceInfo(): Promise<void> {
    try {
      this.deviceInfo = await this.deviceService.getDeviceInformation();
      this.deviceInfoLoaded = true;
      console.log('Device info loaded:', this.deviceInfo);
    } catch (error) {
      console.error('Error loading device info:', error);
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

  private passwordFormatValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) {
      return null;
    }

    const errors = this.validationService.validatePasswordFormat(value);
    return errors.length > 0 ? { passwordFormat: errors } : null;
  };

  get f() {
    return this.registerForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    const valid = await this.validateSubmitForm();
    if (!valid) {
      return;
    }
    this.loading = true;

    try {
      // 1) Register user
      const respUser = await this.registerUser();

      const respDevice = await this.registerDevice(respUser?.userId || '');

      await this.configService.createConfig(respUser?.userId || '', respDevice?.id || '').toPromise();

      await new Promise((resolve) => setTimeout(resolve, 1500));
      /*
      this.router.navigate(['/login']);
      if (respUser) {
        await this.notificationService.showSuccess('Cuenta creada exitosamente');
        //const deviceRequest = toDeviceRegistration(this.deviceInfo!, response.userId, this.f['telefono'].value?.trim() || '');
        // register the device immediately for the new user
        try {
          //await this.authService.registerDevice(deviceRequest).toPromise();
        } catch (err) {
          console.warn('Device registration failed:', err);
        }

        // without logging in auto, send user to login screen
        await new Promise((resolve) => setTimeout(resolve, 1500));
        this.router.navigate(['/login']);
      }*/
    } catch (error: any) {
      this.showError(error?.message || error?.error?.mensaje || 'Error al crear la cuenta');
    } finally {
      this.loading = false;
    }
  }

  private async validateSubmitForm(): Promise<boolean> {
    this.errorMessage = '';
    if (this.registerForm.invalid) {
      if (!this.f['aceptarTerminos'].value) {
        this.showError('Debes aceptar los términos y condiciones');
      } else {
        this.showError('Completa todos los campos correctamente');
      }
      return false;
    }

    if (!this.deviceInfo) {
      this.showError('No se pudo obtener la información del dispositivo. Reintentando...');
      await this.loadDeviceInfo();
      if (!this.deviceInfo) {
        this.showError('Error al obtener información del dispositivo');
        return false;
      }
    }
    return true;
  }

  private async registerUser(): Promise<RegisterResponse | undefined> {
    const userData: RegisterRequest = {
      nombre: this.f['nombre'].value.trim(),
      apellido: this.f['apellido'].value.trim(),
      email: this.f['email'].value.trim(),
      password: this.f['password'].value,
      telefono: this.f['telefono'].value?.trim() || undefined,
      direccion: this.f['direccion'].value?.trim() || undefined,
    };
    return this.authService
        .registerUser(userData).toPromise();
  }

  private async registerDevice(usuarioId: string): Promise<DeviceRegistration | undefined> {
    this.deviceInfo
    const deviceRequest = {
      ...this.deviceInfo,
      numero: this.f['telefono'].value?.trim() || '',
      usuarioId,
    }
    return await this.authService.registerDevice(deviceRequest).toPromise();
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

  phoneFormatter() {
    const valor = this.f['telefono']?.value || '';
    let digits = valor.toString().replace(/\D/g, '');
    const formateado = this.telefonoPipe.transform(digits, 'ar'); // Formatear el número usando el pipe
    if (formateado !== valor) {
      this.f['telefono'].setValue(formateado, { emitEvent: false });
    }
  }

}
