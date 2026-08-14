import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';
import { Operator } from 'src/app/models/person.models';
import { CatalogueService } from 'src/app/services/catalogue.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild('errorAlert') private errorAlert?: ElementRef<HTMLElement>;

  form!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  supervisors: Operator[] = [];

  private hideErrorTimeoutId: number | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private catalogueService: CatalogueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalogueService.initializeCatalogs();

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      legajo: ['', Validators.pattern('^[0-9]+$')],
      supervisorId: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });

  
  }

  loadSupervisors(): void {
    this.catalogueService.supervisors$.subscribe((supervisors) => {
      if (supervisors) {
        this.supervisors = supervisors;
      }
    });
  }
  
  getSupervisorDisplayName(supervisor: Operator): string {
    return `${supervisor.apellido}, ${supervisor.nombre} (${supervisor.legajo})`;
  }

  get f() {
    return this.form.controls;
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;
    this.clearError();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const raw = this.form.getRawValue();
    const supervisorId = `${raw.supervisorId ?? ''}`.trim();

    const request: RegisterRequest = {
      nombre: raw.firstName,
      apellido: raw.lastName,
      telefono: raw.phone,
      direccion: raw.address,
      email: raw.email,
      legajo: Number(raw.legajo),
      password: raw.password,
      esAdministrador: raw.supervisorId.length > 0 ? false : true,
      supervisorId: raw.supervisorId.length > 0 ? supervisorId : null,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.clearError();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        const message = error?.error?.message || 'Error al registrar usuario';
        this.showServerError(message);
      }
    });
  }

  private showServerError(message: string): void {
    this.error = message;

    if (this.hideErrorTimeoutId !== undefined) {
      window.clearTimeout(this.hideErrorTimeoutId);
    }

    // Wait for the *ngIf to render the alert before focusing.
    window.setTimeout(() => {
      this.errorAlert?.nativeElement.focus();
    }, 0);

    this.hideErrorTimeoutId = window.setTimeout(() => {
      this.error = '';
      this.hideErrorTimeoutId = undefined;
    }, 5000);
  }

  private clearError(): void {
    this.error = '';
    if (this.hideErrorTimeoutId !== undefined) {
      window.clearTimeout(this.hideErrorTimeoutId);
      this.hideErrorTimeoutId = undefined;
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.clearError();
  }
}
