import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';
import { AuthService } from '../../../../services/auth.service';
import { Contact, CatalogType } from '../../../../models/config.models';

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-contacts-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts-config.component.html',
  styleUrl: './contacts-config.component.css'
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
    relacion: 'Amigo',
    canalNotificacion: [] as CatalogType[],
    esEmergencia: false
  };

  relationOptions: string[] = []; //['Padre', 'Madre', 'Amigo', 'Pareja', 'Hermano/a', 'Hijo/a', 'Otro'];
  notificationTypes: CatalogType[] = [];
  // icons by channel id: 1-sms, 2-whatsapp, 3-telegram, 4-messenger, 5-mail, 6-llamada, 0-otro
  notificationIcons: Record<number, string> = {
    0: 'notifications',
    1: 'sms',
    2: 'chat',
    3: 'send',
    4: 'chat_bubble',
    5: 'mail',
    6: 'phone',
  };

  loading = false;
  private destroy$ = new Subject<void>();
  private userId: string = '';

  constructor(
    private contactService: ContactService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get userId from authenticated user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userId = currentUser.id;
    }

    this.contactService.getCanalesNotificacion()
      .pipe(takeUntil(this.destroy$))
      .subscribe(types => {
        this.notificationTypes = types;
      });

    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(contacts => {
        this.contacts = contacts;
      });

    this.relationOptions = this.contactService.getRelationOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── View switching ────────────────────────────

  showNewForm(): void {
    this.isNew = true;
    this.editingContact = null;
    this.resetForm();
    this.viewMode = 'form';
  }

  showEditForm(contact: Contact): void {
    this.isNew = false;
    this.editingContact = contact;
    this.formData = {
      nombre: contact.nombre,
      apellido: contact.apellido || '',
      telefono: contact.telefono,
      relacion: contact.relacion || 'Amigo',
      canalNotificacion: contact.canalNotificacion ? [...contact.canalNotificacion] : [],
      esEmergencia: contact.esPrincipal || false
    };
    this.viewMode = 'form';
  }

  backToList(): void {
    this.viewMode = 'list';
    this.resetForm();
  }

  // ─── Notification type toggle ──────────────────

  isNotifActive(key: CatalogType): boolean {
    return this.formData.canalNotificacion.some(t => t.id === key.id);
  }

  toggleNotif(key: CatalogType): void {
    const idx = this.formData.canalNotificacion.findIndex(t => t.id === key.id);
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
      this.notificationService.showToast('Nombre y teléfono son obligatorios');
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
      esPrincipal: this.formData.esEmergencia
    };
    if (this.isNew) {
      this.contactService.addContact(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Contacto agregado');
            this.loading = false;
            this.backToList();
          },
          error: () => {
            this.notificationService.showToast('Error al agregar contacto');
            this.loading = false;
          }
        });
    } else if (this.editingContact) {
      this.contactService.updateContact(this.editingContact.id, payload as Partial<Contact>)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Contacto actualizado');
            this.loading = false;
            this.backToList();
          },
          error: () => {
            this.notificationService.showToast('Error al actualizar contacto');
            this.loading = false;
          }
        });
    }
  }

  deleteContact(contact: Contact): void {
    this.contactService.deleteContact(contact.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Contacto eliminado');
        },
        error: () => {
          this.notificationService.showToast('Error al eliminar contacto');
        }
      });
  }

  resetForm(): void {
    this.editingContact = null;
    this.formData = {
      nombre: '',
      apellido: '',
      telefono: '',
      relacion: 'Amigo',
      canalNotificacion: [],
      esEmergencia: false
    };
  }

  // ─── Helpers ───────────────────────────────────

  getNotifIcons(contact: Contact): { icon: string; color: string; title: string }[] {
    const types = contact.canalNotificacion || [];
    const map: Record<number, { icon: string; color: string; title: string }> = {
      0: { icon: 'notifications', color: 'text-slate-400',  title: 'Otro' },
      1: { icon: 'sms',           color: 'text-orange-500', title: 'SMS' },
      2: { icon: 'chat',          color: 'text-green-600',  title: 'WhatsApp' },
      3: { icon: 'send',          color: 'text-blue-500',   title: 'Telegram' },
      4: { icon: 'chat_bubble',   color: 'text-indigo-500', title: 'Messenger' },
      5: { icon: 'mail',          color: 'text-slate-500',  title: 'Mail' },
      6: { icon: 'phone',         color: 'text-teal-500',   title: 'Llamada' },
    };
    return types.map(t => map[t.id]).filter(Boolean);
  }
}
