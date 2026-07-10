import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { AppSettings, GeneralSettings } from '../../../../models/config.models';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';
import { Idioma } from '@app/models/catalog.models';
import { CatalogService } from '@app/services/catalog.service';


@Component({
  selector: 'app-general-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-config.component.html',
  styleUrl: './general-config.component.css'
})
export class GeneralConfigComponent {
  private readonly destroy$ = new Subject<void>();
  private readonly section = 'general' as const;

  settings: GeneralSettings = {
    idiomaId: 'es',
    modoSigilosoActivo: false,
    modoDarkActivo: false,
  };

  languages: Idioma[] = [];

  constructor(
    private settingsConfigDraftService: SettingsConfigDraftService,
    private catalogService: CatalogService
  ) {
        this.settingsConfigDraftService.ensureInitialized();
        this.settingsConfigDraftService.draft$
          .pipe(
            tap((draft) => console.log('draft:', draft)),
            filter((draft): draft is AppSettings => draft !== null),
            takeUntil(this.destroy$)
          )
          .subscribe((draft) => {
            console.log('draft:', draft);
            this.settings = { ...draft.general };
          });
        this.catalogService.idiomas$
          .pipe(takeUntil(this.destroy$))
          .subscribe((langs) => {
            this.languages = langs || [];
          });
  }

  onSettingsChange(): void {
    this.settingsConfigDraftService.updateSection(this.section, {
      ...this.settings,
    });
    console.log('General settings updated:', this.settings);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
