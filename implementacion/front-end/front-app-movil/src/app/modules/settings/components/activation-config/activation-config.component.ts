import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { AppSettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';
import { PatternTouchComponent } from '../../../../modules/common/components/pattern-touch/pattern-touch.component';

@Component({
  selector: 'app-activation-config',
  standalone: true,
  imports: [CommonModule, FormsModule, PatternTouchComponent],
  templateUrl: './activation-config.component.html',
  styleUrl: './activation-config.component.css',
})
export class ActivationConfigComponent {
  @ViewChild(PatternTouchComponent) patternTouch?: PatternTouchComponent;
  private readonly destroy$ = new Subject<void>();
  private touchPatternEnabledValue = true;
  showPatternTrace = false;
  showPatternModal = false;

  private voiceCommandEnabledValue = true;
  private voiceCommandPhraseValue = '';
  voiceSensitivityValue = 7;

  private movementEnabledValue = true;
  private movementSensitivityValue: 'low' | 'medium' | 'high' = 'medium';

  private cancelTimerValue = 15;
  activationTimerSettings = { min: 1, max: 5, step: 1 };
  cancelTimerSettings = { min: 5, max: 60, step: 1 };
  touchPatternValue: number[] = [];
  private initialPattern: number[] = [];
  private activationTimerValue: number = 3;

  get touchPatternEnabled(): boolean {
    return this.touchPatternEnabledValue;
  }

  set touchPatternEnabled(value: boolean) {
    this.touchPatternEnabledValue = value;
    this.settingsConfigDraftService.updateSection('activation', { patronActivo: value });
  }

  get voiceCommandEnabled(): boolean {
    return this.voiceCommandEnabledValue;
  }

  set voiceCommandEnabled(value: boolean) {
    this.voiceCommandEnabledValue = value;
    this.settingsConfigDraftService.updateSection('activation', { comandosVozActivo: value });
  }

  get movementEnabled(): boolean {
    return this.movementEnabledValue;
  }

  set movementEnabled(value: boolean) {
    this.movementEnabledValue = value;
    this.settingsConfigDraftService.updateSection('activation', { movimientoActivo: value });
  }

  get movementSensitivity(): 'low' | 'medium' | 'high' {
    return this.movementSensitivityValue;
  }

  set movementSensitivity(value: 'low' | 'medium' | 'high') {
    this.movementSensitivityValue = value;
    this.settingsConfigDraftService.updateSection('activation', { sensibilidadMovimiento: value });
  }

  get cancelTimer(): number {
    return this.cancelTimerValue;
  }

  set cancelTimer(value: number) {
    this.cancelTimerValue = value;
    this.settingsConfigDraftService.updateSection('activation', { tiempoCancelacionSeg: value });
  }

  get activationTimer(): number {
    return this.activationTimerValue;
  }

  set activationTimer(value: number) {
    this.activationTimerValue = value;
    this.settingsConfigDraftService.updateSection('activation', { tiempoActivacionSeg: value });
  }

  get voiceCommandPhrase(): string {
    return this.voiceCommandPhraseValue;
  }

  set voiceCommandPhrase(value: string) {
    this.voiceCommandPhraseValue = value;
    this.settingsConfigDraftService.updateSection('activation', { fraseActivacionVoz: value });
  }

  constructor(private settingsConfigDraftService: SettingsConfigDraftService) {
    this.settingsConfigDraftService.ensureInitialized();
    this.settingsConfigDraftService.draft$
      .pipe(
        filter((draft): draft is AppSettings => draft !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((draft) => {
        this.touchPatternEnabled = draft.activation?.patronActivo;
        this.voiceCommandEnabled = draft.activation?.comandosVozActivo;
        this.movementEnabled = draft.activation?.movimientoActivo;
        this.touchPatternValue =
          (draft.activation?.patronActivacion?.patternPoints as number[]) || [];
        this.voiceCommandPhrase = draft.activation?.fraseActivacionVoz || '';
        this.movementSensitivity =
          (draft.activation?.sensibilidadMovimiento as 'low' | 'medium' | 'high') || 'medium';
        this.activationTimer = draft.activation?.tiempoActivacionSeg || 3;
        this.cancelTimerValue = draft.activation?.tiempoCancelacionSeg || 15;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openPattern(): void {
    this.showPatternModal = true;
    this.initialPattern = [...this.touchPatternValue];
  }

  closePatternModal(): void {
    this.touchPatternValue = [...this.initialPattern];
    this.showPatternModal = false;
  }

  onPatternDrawn(pattern: number[]): void {
    console.log('Patrón capturado:', pattern);
    this.touchPatternValue = pattern;
    //this.closePatternModal();
  }

  confirmChanges(): void {
    this.settingsConfigDraftService.updateSection('activation', {
      patronActivacion: { patternPoints: [...this.touchPatternValue] },
    });
    this.showPatternModal = false;
  }

  clearPattern(): void {
    this.touchPatternValue = [];
    try {
      this.patternTouch?.clearPattern();
    } catch (e) {
      console.warn('No se pudo limpiar el patrón: ', e);
    }
  }
}
