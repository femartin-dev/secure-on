import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification-toast.service';
import { AuthService } from '../../../../services/auth.service';
import { CatalogType } from '../../../../models/catalog.models';
import { Contact } from '../../../../models/contact.models';
import { CanalNotificacion } from '../../../../models/catalog.models';
import { notificationChannelsConfig } from '../../../../utils/constants.util';
import { SettingsLayoutStateService } from '../../services/settings-layout-state.service';
import { PhoneFormatPipe } from '../../../common/pipes/phone/phone-format.pipe';
import { CatalogService } from '@app/services/catalog.service';

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-contacts-config',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneFormatPipe],
  templateUrl: './contacts-config.component.html',
  styleUrl: './contacts-config.component.css',
})
export class ContactsConfigComponent implements OnInit, OnDestroy {
  viewMode: ViewMode = 'list';
  contacts: Contact[] = [];

  // Form state
  editingContact: Contact | null = null;
  isNew = true;

  formData = {
    nombre: '',
    apellido: '',
    telefono: '',
    relacion: 'Amigo/a',
    canalNotificacion: [] as CatalogType[],
    esEmergencia: false,
  };

  listTableColumnsName = ['Tipo', 'Teléfono', 'Nombre', 'Principal', 'Acciones'];

  relationOptions: string[] = []; //['Padre', 'Madre', 'Amigo', 'Pareja', 'Hermano/a', 'Hijo/a', 'Otro'];
  notificationChannels: CanalNotificacion[] = [];

  loading = false;
  private destroy$ = new Subject<void>();
  private userId: string = '';

  constructor(
    private contactService: ContactService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private catalogService: CatalogService,
    private settingsLayoutStateService: SettingsLayoutStateService
  ) {}

  ngOnInit(): void {
    this.settingsLayoutStateService.setActionButtonsVisible(true);

    // Get userId from authenticated user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userId = currentUser.id;
    }

    this.catalogService.canalesNotificacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          console.log('[ContactsConfig] Canales cargados:', types);
          this.notificationChannels = types || [];
        },
        error: (err) => {
          console.error('[ContactsConfig] Error cargando canales:', err);
        },
      });

    this.contactService.contacts$.pipe(takeUntil(this.destroy$)).subscribe((contacts) => {
      this.contacts = contacts;
    });

    //this.relationOptions = this.contactService.getRelationOptions();
    this.catalogService.relacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((relations) => {
        this.relationOptions = relations || [];
      });

  }

  ngOnDestroy(): void {
    this.settingsLayoutStateService.resetActionButtonsVisibility();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── View switching ────────────────────────────

  showNewForm(): void {
    this.isNew = true;
    this.editingContact = null;
    this.resetForm();
    this.setViewMode('form');
  }

  showEditForm(contact: Contact): void {
    this.isNew = false;
    this.editingContact = contact;
    this.formData = {
      nombre: contact.nombre,
      apellido: contact.apellido || '',
      telefono: contact.telefono,
      relacion: contact.relacion || 'Amigo/a',
      canalNotificacion: contact.canalNotificacion ? [...contact.canalNotificacion] : [],
      esEmergencia: contact.esPrincipal || false,
    };
    this.setViewMode('form');
  }

  backToList(): void {
    this.setViewMode('list');
    this.resetForm();
  }

  private setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.settingsLayoutStateService.setActionButtonsVisible(mode !== 'form');
  }

  // ─── Notification type toggle ──────────────────

  isNotifActive(key: CatalogType): boolean {
    return this.formData.canalNotificacion.some((t) => t.id === key.id);
  }

  toggleNotif(key: CatalogType): void {
    const idx = this.formData.canalNotificacion.findIndex((t) => t.id === key.id);
    /*if (idx >= 0) {
      this.formData.canalNotificacion.splice(idx, 1);
    } else {
      this.formData.canalNotificacion.push(key);
    }
    */
    this.formData.canalNotificacion = [key];
  }

  // ─── CRUD ──────────────────────────────────────

  saveContact(): void {
    if (!this.formData.nombre.trim() || !this.formData.telefono.trim()) {
      this.notificationService.showError('Nombre y teléfono son obligatorios');
      return;
    }

    this.loading = true;

    const payload: Omit<Contact, 'id'> = {
      userId: this.userId,
      nombre: this.formData.nombre.trim(),
      apellido: this.formData.apellido.trim(),
      telefono: this.formData.telefono.trim(),
      relacion: this.formData.relacion,
      canalNotificacion: this.formData.canalNotificacion,
      esPrincipal: this.formData.esEmergencia,
    };
    if (this.isNew) {
      this.contactService
        .addContact(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Contacto agregado');
            this.loading = false;
            this.backToList();
          },
          error: () => {
            this.notificationService.showError('Error al agregar contacto');
            this.loading = false;
          },
        });
    } else if (this.editingContact) {
      this.contactService
        .updateContact(this.editingContact.id, payload as Partial<Contact>)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Contacto actualizado');
            this.loading = false;
            this.backToList();
          },
          error: () => {
            this.notificationService.showError('Error al actualizar contacto');
            this.loading = false;
          },
        });
    }
  }

  deleteContact(contact: Contact): void {
    this.contactService
      .deleteContact(contact.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Contacto eliminado');
        },
        error: () => {
          this.notificationService.showError('Error al eliminar contacto');
        },
      });
  }

  resetForm(): void {
    this.editingContact = null;
    this.formData = {
      nombre: '',
      apellido: '',
      telefono: '',
      relacion: 'Amigo/a',
      canalNotificacion: [],
      esEmergencia: false,
    };
  }

  // ─── Helpers ───────────────────────────────────

  getNotifIcons(contact: Contact): {  icon: string; svgIcon?: string; color: string; title: string }[] {
    const types = contact.canalNotificacion || [];
    return types
      .map((t) => notificationChannelsConfig[t.id] ?? notificationChannelsConfig[0])
      .filter(Boolean);
  }

  importContacts(): void {
    this.notificationService.showInfo('Funcionalidad no implementada');
    /*
    this.contactService
      .importDeviceContacts()
      .then(() => {
        this.notificationService.showSuccess('Contactos importados exitosamente');
      })
      .catch(() => {
        this.notificationService.showError('Error al importar contactos');
      });
      */
  }
}
