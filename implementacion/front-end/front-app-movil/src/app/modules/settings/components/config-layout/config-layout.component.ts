import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { NotificationService } from '@app/services/notification-toast.service';
import { SettingsLayoutStateService } from '../../services/settings-layout-state.service';
import { SettingsConfigDraftService } from '../../services/settings-config-draft.service';

interface ConfigPage {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './config-layout.component.html',
  styleUrl: './config-layout.component.css',
})
export class ConfigLayoutComponent implements OnDestroy {
  actionButtonsVisible: boolean = true; // This can be toggled based on the current section or other logic

  sections: ConfigPage[] = [
    {
      id: 'general',
      label: 'Configuracion General',
      icon: 'tune',
      route: '/settings/general',
    },
    {
      id: 'activation',
      label: 'Configuracion de Activacion',
      icon: 'gesture',
      route: '/settings/activation',
    },
    {
      id: 'security',
      label: 'Configuracion de Seguridad',
      icon: 'shield',
      route: '/settings/security',
    },
    {
      id: 'performance',
      label: 'Configuracion de Rendimiento',
      icon: 'battery_charging_full',
      route: '/settings/performance',
    },
    {
      id: 'notifications',
      label: 'Configuracion de Notificaciones',
      icon: 'notifications',
      route: '/settings/notifications',
    },
    {
      id: 'contacts',
      label: 'Configuracion de Contactos',
      icon: 'contacts',
      route: '/settings/contacts',
    },
  ];

  private circleGo: boolean = true;


  currentSectionIndex = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private readonly notificationService: NotificationService,
    private settingsLayoutStateService: SettingsLayoutStateService,
    private settingsConfigDraftService: SettingsConfigDraftService
  ) {

  }

  ngOnInit(): void {
    this.settingsConfigDraftService.ensureInitialized();
    this.syncCurrentPage(this.router.url);

    this.settingsLayoutStateService.actionButtonsVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((visible) => {
        this.actionButtonsVisible = visible;
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.syncCurrentPage((event as NavigationEnd).urlAfterRedirects);
      });


  }

  get currentSection(): ConfigPage {
    return this.sections[this.currentSectionIndex];
  }

  get canGoPrev(): boolean {
    return this.circleGo || this.currentSectionIndex > 0;
  }

  get canGoNext(): boolean {
    return this.circleGo || this.currentSectionIndex < this.sections.length - 1;
  }

  goPrev(): void {
    if (this.circleGo) {
      this.currentSectionIndex = this.currentSectionIndex > 0 ? this.currentSectionIndex - 1 : this.sections.length - 1;
      this.router.navigate([this.currentSection.route]);
    }
    else if (this.canGoPrev) {
      this.currentSectionIndex--;
      this.router.navigate([this.currentSection.route]);
    }
  }

  goNext(): void {
    if (this.circleGo) {
      this.currentSectionIndex = this.currentSectionIndex < this.sections.length - 1 ? this.currentSectionIndex + 1 : 0;
      this.router.navigate([this.currentSection.route]);
    } else if (this.canGoNext) {
      this.currentSectionIndex++;
      this.router.navigate([this.currentSection.route]);
    }
  }

  goBack(): void {
    this.router.navigate(['/main']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncCurrentPage(url: string): void {
    const idx = this.sections.findIndex((section) => url.includes(section.id));
    if (idx >= 0) {
      this.currentSectionIndex = idx;
    }
  }

  // Placeholder methods for buttons  - these can be implemented as needed
  cancelForm(): void {
    this.settingsConfigDraftService.resetToInitial();
    this.goBack();
  }

  resetForm(): void {
    this.settingsConfigDraftService.resetToInitial();
    this.notificationService.showSuccess('Formulario restablecido a su estado inicial');
  }

  saveForm(): void {
    this.settingsConfigDraftService.saveAll().subscribe({
      next: () => {
        this.notificationService.showSuccess('Configuracion guardada');
        this.goBack();
      },
      error: () => {
        this.notificationService.showError('Error al guardar configuracion');
      },
    });
  }
}
