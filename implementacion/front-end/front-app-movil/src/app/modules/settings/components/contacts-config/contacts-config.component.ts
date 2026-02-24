import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';
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
    email: '',
    relacion: 'Amigo',
    canalNotificaiones: [] as CatalogType[],
    esEmergencia: false
  };

  relationOptions = ['Padre', 'Madre', 'Amigo', 'Pareja', 'Hermano/a', 'Hijo/a', 'Otro'];
  notificationTypes: CatalogType[] = [
    { id: 1, descripcion: 'WA' },
    { id: 3, descripcion: 'TG' },
    { id: 2, descripcion: 'SMS' },
    { id: 4, descripcion: 'Mail' },
  ];
  // we'll map icon separately
  notificationIcons: Record<number,string> = {
    1: 'chat',
    2: 'sms',
    3: 'send',
    4: 'mail'
  };

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(contacts => {
        this.contacts = contacts;
      });
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
      email: contact.email || '',
      relacion: contact.relacion || 'Amigo',
      canalNotificaiones: contact.canalNotificaiones ? [...contact.canalNotificaiones] : [],
      esEmergencia: contact.esEmergencia || false
    };
    this.viewMode = 'form';
  }

  backToList(): void {
    this.viewMode = 'list';
    this.resetForm();
  }

  // ─── Notification type toggle ──────────────────

  isNotifActive(key: CatalogType): boolean {
    return this.formData.canalNotificaiones.some(t => t.id === key.id);
  }

  toggleNotif(key: CatalogType): void {
    const idx = this.formData.canalNotificaiones.findIndex(t => t.id === key.id);
    if (idx >= 0) {
      this.formData.canalNotificaiones.splice(idx, 1);
    } else {
      this.formData.canalNotificaiones.push(key);
    }
  }

  // ─── CRUD ──────────────────────────────────────

  saveContact(): void {
    if (!this.formData.nombre.trim() || !this.formData.telefono.trim()) {
      this.notificationService.showToast('Nombre y teléfono son obligatorios');
      return;
    }

    this.loading = true;

    const payload: Omit<Contact, 'id'> = {
      nombre: this.formData.nombre.trim(),
      apellido: this.formData.apellido.trim(),
      telefono: this.formData.telefono.trim(),
      email: this.formData.email.trim(),
      relacion: this.formData.relacion,
      canalNotificaiones: this.formData.canalNotificaiones,
      esPrimario: this.formData.esEmergencia,
      esEmergencia: this.formData.esEmergencia
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
      email: '',
      relacion: 'Amigo',
      canalNotificaiones: [],
      esEmergencia: false
    };
  }

  // ─── Helpers ───────────────────────────────────

  getNotifIcons(contact: Contact): { icon: string; color: string; title: string }[] {
    const types = contact.canalNotificaiones || [];
    const map: Record<number, { icon: string; color: string; title: string }> = {
      1: { icon: 'chat', color: 'text-green-600', title: 'WhatsApp' },
      3: { icon: 'send', color: 'text-blue-500', title: 'Telegram' },
      2: { icon: 'sms', color: 'text-orange-500', title: 'SMS' },
      4: { icon: 'mail', color: 'text-slate-500', title: 'Mail' }
    };
    return types.map(t => map[t.id]).filter(Boolean);
  }
}
