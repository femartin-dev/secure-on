import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppSettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';
import { PatternTouchComponent } from '@app/modules/common/components/pattern-touch/pattern-touch.component';
import { PinCheckComponent, PinCheckOutput } from '@app/modules/common/components/pin-check/pin-check.component';
import { ValidationService } from '@app/services/validation.service';

@Component({
  selector: 'app-security-config',
  standalone: true,
  imports: [CommonModule, FormsModule, PatternTouchComponent, PinCheckComponent],
  templateUrl: './security-config.component.html',
  styleUrl: './security-config.component.css',
})
export class SecurityConfigComponent {
  private readonly destroy$ = new Subject<void>();

  @ViewChild(PatternTouchComponent) patternTouch?: PatternTouchComponent;
  @ViewChild(PinCheckComponent) pinCheckComponent?: PinCheckComponent;

  private fingerprintEnabledValue = false;
  private patternEnabledValue = true;
  private pinEnabledValue = true;
  private passwordEnabledValue = true;

  private pinValue = '';
  private passwordValue = '';
  private maxAttemptsValue = 5;

  touchPatternValue: number[] = [];
  pinCheck: PinCheckOutput = { pin: 0, complete: false };
  private initialPattern: number[] = [];

  showModal = false;
  modalType: 'pattern' | 'fingerprint' | 'pin' | null = null;
  error: string | null = null;
  passErrors: string[] | null = null;

  get fingerprintEnabled(): boolean {
    //console.log('Fingerprint enabled get:', this.fingerprintEnabledValue);
    return this.fingerprintEnabledValue;
  }

  set fingerprintEnabled(value: boolean) {
    console.log('Fingerprint enabled set to:', value);
    this.fingerprintEnabledValue = value;
    //this.settingsConfigDraftService.updateSection('security', { huellaDesbloqueoActivo: value });
  }

  get patternEnabled(): boolean {
    return this.patternEnabledValue;
  }

  set patternEnabled(value: boolean) {
    this.patternEnabledValue = value;
    this.settingsConfigDraftService.updateSection('security', { patronDesbloqueoActivo: value });
  }

  get pinEnabled(): boolean {
    return this.pinEnabledValue;
  }

  set pinEnabled(value: boolean) {
    this.pinEnabledValue = value;
    this.settingsConfigDraftService.updateSection('security', { pinDesbloqueoActivo: value });
  }

  get passwordEnabled(): boolean {
    return this.passwordEnabledValue;
  }

  set passwordEnabled(value: boolean) {
    if (!value && this.passErrors && this.passErrors?.length > 0) {
      this.passwordValue = '';
      this.passErrors = null;
    }
    this.settingsConfigDraftService.updateSection('security', { passDesbloqueoActivo: value });
  }

  get pin(): string {
    return this.pinValue;
  }

  set pin(value: string) {
    console.log('PIN set to:', value);
    this.pinValue = value;
    this.settingsConfigDraftService.updateSection('security', {
      pinDesbloqueo: parseInt(this.pinValue, 10),
    });
  }

  get password(): string {
    return this.passwordValue;
  }

  set password(value: string) {
    console.log('Password set to:', value);
    //this.passErrors = this.validationService.validatePasswordFormat(value);
    if (!this.passErrors || this.passErrors.length === 0) {
      this.passwordValue = value;
      this.settingsConfigDraftService.updateSection('security', {
        passDesbloqueo: this.passwordValue,
      });
    }
  }

  get maxAttempts(): number {
    return this.maxAttemptsValue;
  }

  set maxAttempts(value: number) {
    console.log('Max attempts set to:', value);
    this.maxAttemptsValue = value;
    this.settingsConfigDraftService.updateSection('security', { nroIntentosFallidos: value });
  }

  get modalTitle(): string {
    return this.modalType === 'pin'
      ? 'Definir PIN'
      : this.modalType === 'pattern'
        ? 'Definir Patrón Táctil'
        : this.modalType === 'fingerprint'
          ? 'Configurar Huella Dactilar'
          : '';
  }

  constructor(
    private settingsConfigDraftService: SettingsConfigDraftService,
    private validationService: ValidationService
  ) {
    this.settingsConfigDraftService.ensureInitialized();
    this.settingsConfigDraftService.draft$
      .pipe(
        filter((draft): draft is AppSettings => draft !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((draft) => {
        console.log('Security draft loaded:', draft.security);
        this.patternEnabledValue = draft.security.patronDesbloqueoActivo ?? false;
        this.pinEnabledValue = draft.security.pinDesbloqueoActivo ?? false;
        this.passwordEnabledValue = draft.security.passDesbloqueoActivo ?? false;
        this.pinValue = draft.security.pinDesbloqueo?.toString() ?? '';
        this.passwordValue = draft.security.passDesbloqueo ?? '';
        this.touchPatternValue = draft.security.patronDesbloqueo?.patternPoints ?? [];
        this.maxAttemptsValue = draft.security.nroIntentosFallidos;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openPatternModal(): void {
    this.showModal = true;
    this.modalType = 'pattern';
    this.initialPattern = [...this.touchPatternValue];
  }

  openFingerprintModal(): void {
    this.showModal = true;
    this.modalType = 'fingerprint';
  }

  openPinModal(): void {
    this.showModal = true;
    this.modalType = 'pin';
  }

  closeModal(): void {
    switch (this.modalType) {
      case 'pattern':
        this.touchPatternValue = [...this.initialPattern];
        break;
      case 'pin':
        this.pinCheck = { pin: 0, complete: false };
        break;
      case 'fingerprint':
        // No specific action needed for fingerprint modal
        break;
    }
    this.showModal = false;
  }

  confirmValue(): void {
    this.modalType === 'pattern'
      ? this.confirmPattern()
      : this.modalType === 'pin'
        ? this.confirmPin()
        : this.modalType === 'fingerprint'
          ? this.confirmFingerprint()
          : null;
  }

  clearValue(): void {
    this.modalType === 'pattern'
      ? this.clearPattern()
      : this.modalType === 'pin'
        ? this.clearPin()
        : this.modalType === 'fingerprint'
          ? this.clearFingerprint()
          : null;
  }

  onPatternDrawn(pattern: number[]): void {
    console.log('Patrón capturado:', pattern);
    this.touchPatternValue = pattern;
  }

  confirmPattern(): void {
    this.settingsConfigDraftService.updateSection('security', {
      patronDesbloqueo: { patternPoints: [...this.touchPatternValue] },
    });
    this.showModal = false;
    this.error = null;
  }

  clearPattern(): void {
    this.touchPatternValue = [];
    this.error = null;
    try {
      this.patternTouch?.clearPattern();
    } catch (e) {
      console.warn('No se pudo limpiar el patrón: ', e);
    }
  }

  onPinEntered(pin: any): void {
    this.pinCheck = pin as PinCheckOutput;
    console.log('PIN ingresado:', this.pinCheck);
  }

  confirmPin(): void {
    if (!this.pinCheck.complete) {
      this.error = 'El PIN ingresado no tiene la longitud necesaria.';
      return;
    }
    const valResult = this.validationService.validatePinFormat(
      this.pinCheck.pin,
      this.maxAttemptsValue
    );
    if (!!valResult) {
      this.error = valResult;
      return;
    }
    this.pin = this.pinCheck.pin.toString();
    this.settingsConfigDraftService.updateSection('security', {
      pinDesbloqueo: this.pin ? parseInt(this.pin, 10) : null,
    });
    this.showModal = false;
    this.error = null;
  }

  clearPin(): void {
    this.pinCheck = { pin: 0, complete: false };
    this.error = null;
    try {
      this.pinCheckComponent?.clearPin();
    } catch (e) {
      console.warn('No se pudo limpiar el PIN: ', e);
    }
  }

  confirmFingerprint(): void {
    // Implement fingerprint confirmation logic here
    this.showModal = false;
  }

  clearFingerprint(): void {
    // Implement fingerprint clearing logic here
    this.error = null;
  }
}
