import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppSettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';

@Component({
  selector: 'app-notifications-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-config.component.html',
  styleUrl: './notifications-config.component.css'
})
export class NotificationsConfigComponent {
  private readonly destroy$ = new Subject<void>();
  private locationFrequencyValue = 45;
  private photosFrequencyValue = 120;
  private audioFrequencyValue = 300;
  private defaultMessageValue =
    'Alerta de seguridad: Se ha detectado una actividad inusual en el perimetro monitoreado. Por favor, revise el estado actual del dispositivo.';
  rangeSettings = {
    ubicacion: { min: 0, max:60, step: 5 },
    fotos: { min: 0, max: 120, step: 15 },
    audio: { min: 0, max: 300, step: 30 }
  };


  get locationFrequency(): number {
    return this.locationFrequencyValue;
  }

  set locationFrequency(value: number) {
    this.locationFrequencyValue = value;
    this.settingsConfigDraftService.updateSection('notifications', { frecuenciaUbicacion: value });
  }

  get photosFrequency(): number {
    return this.photosFrequencyValue;
  }

  set photosFrequency(value: number) {
    this.photosFrequencyValue = value;
    this.settingsConfigDraftService.updateSection('notifications', { frecuenciaCapturaFotos: value });
  }

  get audioFrequency(): number {
    return this.audioFrequencyValue;
  }

  set audioFrequency(value: number) {
    this.audioFrequencyValue = value;
    this.settingsConfigDraftService.updateSection('notifications', { frecuenciaGrabaAudio: value });
  }

  get defaultMessage(): string {
    return this.defaultMessageValue;
  }

  set defaultMessage(value: string) {
    this.defaultMessageValue = value;
    this.settingsConfigDraftService.updateSection('notifications', { templateMensaje: value || null });
  }

  constructor(private settingsConfigDraftService: SettingsConfigDraftService) {
    this.settingsConfigDraftService.ensureInitialized();
    this.settingsConfigDraftService.draft$
      .pipe(
        filter((draft): draft is AppSettings => draft !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((draft) => {
        this.locationFrequencyValue = draft.notifications.frecuenciaUbicacion;
        this.photosFrequencyValue = draft.notifications.frecuenciaCapturaFotos;
        this.audioFrequencyValue = draft.notifications.frecuenciaGrabaAudio;
        this.defaultMessageValue = draft.notifications.templateMensaje ?? '';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
