import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppSettings, BatterySettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';
import { Constants } from '../../../../utils/constants.util';

@Component({
  selector: 'app-performance-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-config.component.html',
  styleUrl: './performance-config.component.css',
})
export class PerformanceConfigComponent {
  private readonly destroy$ = new Subject<void>();
  batteryMode: 'max' | 'balanced' | 'min' = 'balanced';
  private readonly section = 'battery' as const;
  validationMessage = '';

  settings: BatterySettings = {
    umbralBateriaMedia: 50,
    umbralBateriaBaja: 25,
    umbralBateriaCritica: 10,
  };

  constructor(private settingsConfigDraftService: SettingsConfigDraftService) {
    this.settingsConfigDraftService.ensureInitialized();
    this.settingsConfigDraftService.draft$
      .pipe(
        filter((draft): draft is AppSettings => draft !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((draft) => {
        this.settings = { ...draft.battery };
      });
  }

  onMaxThresholdChange(value: number | string): void {
    this.onThresholdChange(value, 'max');
  }

  onBalancedThresholdChange(value: number | string): void {
    this.onThresholdChange(value, 'balanced');
  }

  onMinThresholdChange(value: number | string): void {
    this.onThresholdChange(value, 'min');
  }

  onThresholdChange(value: number | string, type: 'max' | 'balanced' | 'min'): void {
    let nextValue = -1;
    let minAllowed = Constants.BATTERY_MIN_THRESHOLD;
    let maxAllowed = Constants.BATTERY_MAX_THRESHOLD;
    let thresholdName = '';
    let thresholdField = '';
    switch (type) {
      case 'max':
        nextValue = this.normalizeNumber(value, this.settings.umbralBateriaMedia);
        minAllowed = this.settings.umbralBateriaBaja + 1;
        thresholdName = 'maximo';
        thresholdField = 'umbralBateriaMedia';
        break;
      case 'balanced':
        nextValue = this.normalizeNumber(value, this.settings.umbralBateriaBaja);
        minAllowed = this.settings.umbralBateriaCritica + 1;
        maxAllowed = this.settings.umbralBateriaMedia - 1;
        thresholdName = 'medio';
        thresholdField = 'umbralBateriaBaja';
        break;
      case 'min':
        nextValue = this.normalizeNumber(value, this.settings.umbralBateriaCritica);
        maxAllowed = this.settings.umbralBateriaBaja - 1;
        thresholdName = 'bajo';
        thresholdField = 'umbralBateriaCritica';
        break;
    }

    let validatedValue = this.clamp(nextValue, minAllowed, maxAllowed);
    this.setValidationMessage(validatedValue !== nextValue,
      `El umbral ${thresholdName} debe estar entre ${minAllowed}% y ${maxAllowed}%.`);

    this.settings = {
      ...this.settings,
      [thresholdField]: validatedValue,
    };

    this.commitSettings();
  }

  private commitSettings(): void {
    this.settingsConfigDraftService.updateSection(this.section, {
      ...this.settings,
    });
  }

  private normalizeNumber(value: number | string, fallback: number): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private setValidationMessage(shouldShow: boolean, message: string): void {
    this.validationMessage = shouldShow ? message : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
