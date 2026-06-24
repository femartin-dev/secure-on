import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppSettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';

@Component({
  selector: 'app-security-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-config.component.html',
  styleUrl: './security-config.component.css'
})
export class SecurityConfigComponent {
  private readonly destroy$ = new Subject<void>();
  fingerprintEnabled = true;
  private patternEnabledValue = true;
  private pinEnabledValue = true;
  private passwordEnabledValue = true;

  private pinValue = '';
  private passwordValue = '';
  private maxAttemptsValue = 5;

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
    this.passwordEnabledValue = value;
    this.settingsConfigDraftService.updateSection('security', { passDesbloqueoActivo: value });
  }

  get pin(): string {
    return this.pinValue;
  }

  set pin(value: string) {
    this.pinValue = value;
    this.settingsConfigDraftService.updateSection('security', {
      pinDesbloqueo: parseInt(this.pinValue, 10)
    });
  }

  get password(): string {
    return this.passwordValue;
  }

  set password(value: string) {
    this.passwordValue = value;
    this.settingsConfigDraftService.updateSection('security', {
      passDesbloqueo: this.passwordEnabledValue ? (value || null) : null,
    });
  }

  get maxAttempts(): number {
    return this.maxAttemptsValue;
  }

  set maxAttempts(value: number) {
    this.maxAttemptsValue = value;
    this.settingsConfigDraftService.updateSection('security', { nroIntentosFallidos: value });
  }

  constructor(private settingsConfigDraftService: SettingsConfigDraftService) {
    this.settingsConfigDraftService.ensureInitialized();
    this.settingsConfigDraftService.draft$
      .pipe(
        filter((draft): draft is AppSettings => draft !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((draft) => {
        this.patternEnabledValue = draft.security.patronDesbloqueo !== null;
        this.pinEnabledValue = draft.security.pinDesbloqueo !== null;
        this.passwordEnabledValue = draft.security.passDesbloqueo !== null;
        this.pinValue = draft.security.pinDesbloqueo?.toString() ?? '';
        this.passwordValue = draft.security.passDesbloqueo ?? '';
        this.maxAttemptsValue = draft.security.nroIntentosFallidos;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private parsePin(pin: string): number | null {
    const numericPin = Number(pin);
    return Number.isInteger(numericPin) ? numericPin : null;
  }
}
