import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('errorAlert') private errorAlert?: ElementRef<HTMLElement>;

  form!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;

  private hideErrorTimeoutId: number | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.clearError();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const loginPayload = { ...this.form.value };
    this.authService.login(loginPayload).subscribe({
      next: (response) => {
        this.clearError();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;

        console.error('[LoginComponent] LOGIN error response ←', {
          status: error?.status,
          error: error?.error,
          message: error?.message
        });

        const message = error?.error?.message || 'Error en la autenticación';
        this.showServerError(message);
      }
    });
  }

  private showServerError(message: string): void {
    this.error = message;

    if (this.hideErrorTimeoutId !== undefined) {
      window.clearTimeout(this.hideErrorTimeoutId);
    }

    window.setTimeout(() => {
      this.ngZone.run(() => {
        this.errorAlert?.nativeElement.focus();
      });
    }, 0);

    this.hideErrorTimeoutId = window.setTimeout(() => {
      this.ngZone.run(() => {
        this.error = '';
        this.hideErrorTimeoutId = undefined;
        // Make sure the view updates even in edge cases.
        this.cdr.detectChanges();
        console.log('[LoginComponent] error banner hidden');
      });
    }, 5000);
  }

  private clearError(): void {
    this.error = '';
    if (this.hideErrorTimeoutId !== undefined) {
      window.clearTimeout(this.hideErrorTimeoutId);
      this.hideErrorTimeoutId = undefined;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this.clearError();
  }
}
