import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';
import { Contact, ContactResponse, ContactRequest } from '../models/contact.models';
import { CanalNotificacion } from '@app/models/catalog.models';
import { notificationChannelsConfig } from '../utils/constants.util';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();
  private userId: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.userId = this.authService.getCurrentUser()?.id || '';
    this.loadContacts();
  }

  /**
   * Load contacts from server
   */
  private loadContacts(): void {
    this.getContacts().subscribe(
      (response) => {
        this.contactsSubject.next(response.contacts);
      },
      (error) => {
        console.error('Error loading contacts:', error);
      }
    );
  }

  /**
   * Get all contacts
   * Note: not in payload doc but kept for listing contacts
   */
  getContacts(): Observable<ContactResponse> {
    // backend returns array of simplified contacts
    return this.http
      .get<
        any[]
      >(`${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONTACT_BASE}/${this.userId}/listar`)
      .pipe(
        catchError((error) => {
          console.error('Error getting contacts:', error);
          return throwError(() => new Error('Error al obtener contactos'));
        }),
        // map to our ContactResponse interface
        tap(() => {}),
        // use map operator inline
        switchMap((arr) => {
          const contacts: Contact[] = arr.map((item) => {
            return {
              id: item.id,
              userId: item.userId,
              nombre: item.nombre.split(',')[1]?.trim() || '',
              apellido: item.nombre.split(',')[0]?.trim() || '',
              telefono: item.telefono,
              relacion: item.relacion,
              canalNotificacion: item.canal ? [item.canal] : [],
              esPrincipal: item.esPrincipal === true,
            } as Contact;
          });
          return of({ contacts, total: contacts.length } as ContactResponse);
        })
      );
  }

  /**
   * Add new contact
   * POST /servicios-moviles/v1/contacto/nuevo
   */
  addContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    // transform to backend payload
    const payload: ContactRequest = {
      userId: contact.userId,
      nombre: contact.apellido + ', ' + contact.nombre,
      relacion: contact.relacion,
      telefono: contact.telefono,
      canalId: contact.canalNotificacion.length > 0 ? contact.canalNotificacion[0].id : 1,
      esPrincipal: contact.esPrincipal,
    };
    return this.http
      .post<Contact>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ADD_CONTACT}`,
        payload
      )
      .pipe(
        tap((newContact) => {
          const current = this.contactsSubject.value;
          this.contactsSubject.next([...current, newContact]);
        }),
        catchError((error) => {
          console.error('Error adding contact:', error);
          return throwError(() => new Error('Error al agregar contacto'));
        })
      );
  }

  /**
   * Update contact
   * POST /servicios-moviles/v1/contacto/{contactoId}/editar
   */
  updateContact(id: string, contact: Partial<Contact>): Observable<void> {
    // transform to backend payload
    const payload: Partial<ContactRequest> = {};
    payload.userId = contact.userId || this.userId;
    payload.nombre = contact.nombre && contact.apellido ? contact.apellido + ', ' + contact.nombre : contact.nombre ?? contact.apellido ?? '';
    payload.relacion = contact.relacion ?? payload.relacion;
    payload.telefono = contact.telefono ?? payload.telefono;
    payload.canalId = contact.canalNotificacion?.map((c) => c.id)[0] ?? payload.canalId;
    payload.esPrincipal = contact.esPrincipal ?? payload.esPrincipal;

    return this.http
      .post<void>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONTACT_BASE}/${id}/editar`,
        payload
      )
      .pipe(
        tap(() => {
          const current = this.contactsSubject.value;
          const index = current.findIndex((c) => c.id === id);
          if (index > -1) {
            current[index] = { ...current[index], ...contact } as Contact;
            this.contactsSubject.next([...current]);
          }
        }),
        catchError((error) => {
          console.error('Error updating contact:', error);
          return throwError(() => new Error('Error al actualizar contacto'));
        })
      );
  }

  /**
   * Delete contact
   * PUT /servicios-moviles/v1/contacto/{contactoId}/eliminar
   */
  deleteContact(id: string): Observable<void> {
    return this.http
      .put<void>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONTACT_BASE}/${id}/eliminar`,
        {}
      )
      .pipe(
        tap(() => {
          const current = this.contactsSubject.value;
          this.contactsSubject.next(current.filter((c) => c.id !== id));
        }),
        catchError((error) => {
          console.error('Error deleting contact:', error);
          return throwError(() => new Error('Error al eliminar contacto'));
        })
      );
  }

  /**
   * Get device contacts (from phone)
   */
  async getDeviceContacts(): Promise<any[]> {
    try {
      // Dynamic import — @capacitor/contacts may not be installed
      const { Contacts } = await import('@capacitor/contacts' as any);
      const result = await Contacts.getContacts();
      return result.contacts || [];
    } catch (error) {
      console.error('Error getting device contacts:', error);
      return [];
    }
  }

  /**
   * Import device contacts
   */
  async importDeviceContacts(): Promise<void> {
    try {
      const deviceContacts = await this.getDeviceContacts();

      for (const contact of deviceContacts) {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const telephone = contact.phoneNumbers[0].number || '';
          const newContact: Omit<Contact, 'id'> = {
            userId: this.userId,
            nombre: contact.displayName || 'Sin nombre',
            apellido: '',
            telefono: telephone,
            relacion: 'Contacto importado',
            canalNotificacion: [],
            esPrincipal: false,
          };

          this.addContact(newContact).subscribe();
        }
      }
    } catch (error) {
      console.error('Error importing device contacts:', error);
    }
  }

  /**
   * Get primary contact
   */
  getPrimaryContact(): Contact | null {
    return this.contactsSubject.value.find((c) => c.esPrincipal) || null;
  }

  getCanalesNotificacion(): Observable<CanalNotificacion[]> {
    return this.http
      .get<any>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_NOTIFICATION_CHANNELS}`
      )
      .pipe(
        map((response) => {
          // Backend returns { canalesNotificacion: [...] }
          const items: any[] = response?.canalesNotificacion ?? response?.contenido ?? [];
          return items
            .filter((item: any) => item.habilitada !== false && item.habilitada !== 0)
            .map((item: any) => {
              const cfg = notificationChannelsConfig[item.id] ?? notificationChannelsConfig[0];
              return {
                id: item.id,
                descripcion: item.descripcion,
                icono: cfg.icon,
                svgIcono: cfg.svgIcon,
                color: cfg.color,
                orden: item.orden ?? item.id,
              } as CanalNotificacion;
            });
        }),
        catchError((error) => {
          console.error('Error getting notification channels:', error);
          return throwError(() => new Error('Error al obtener canales de notificación'));
        })
      );
  }

  getRelaciones(): Observable<string[]> {
    return this.http
      .get<
        string[]
      >(`${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CATALOG_RELATIONSHIPS}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching relationships:', error);
          return throwError(() => new Error('Error al obtener relaciones'));
        })
      );
  }
}
