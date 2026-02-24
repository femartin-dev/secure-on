import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { API_CONFIG } from '../config/api-config';
import { Contact, ContactResponse, ContactRequest } from '../models/config.models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  constructor(private http: HttpClient) {
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
      .get<any[]>(
        `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.CONTACT_BASE}`
      )
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
              nombre: item.nombre,
              apellido: item.apellido || '',
              telefono: item.telefono,
              email: item.email || '',
              relacion: item.relacion,
              canalNotificaiones: item.canal ? [item.canal] : [],
              esPrimario: item.esPrincipal === true,
              esEmergencia: false
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
      nombre: contact.nombre,
      apellido: contact.apellido,
      relacion: contact.relacion,
      telefono: contact.telefono,
      email: contact.email,
      canalId: contact.canalNotificaiones.length > 0 ? contact.canalNotificaiones[0].id : 1,
      prioridad: contact.esPrimario
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
    if (contact.nombre !== undefined) payload.nombre = contact.nombre;
    if (contact.apellido !== undefined) payload.apellido = contact.apellido;
    if (contact.relacion !== undefined) payload.relacion = contact.relacion;
    if (contact.telefono !== undefined) payload.telefono = contact.telefono;
    if (contact.email !== undefined) payload.email = contact.email;
    if (contact.canalNotificaiones !== undefined) payload.canalId = contact.canalNotificaiones.map(c => c.id)[0];
    if (contact.esPrimario !== undefined) payload.prioridad = contact.esPrimario;

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
            nombre: contact.displayName || 'Sin nombre',
            apellido: '',
            telefono: telephone,
            email: contact.emails?.[0]?.address || '',
            relacion: 'Contacto importado',
            canalNotificaiones: [],
            esPrimario: false,
            esEmergencia: false
          };

          this.addContact(newContact).subscribe();
        }
      }
    } catch (error) {
      console.error('Error importing device contacts:', error);
    }
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(): Contact[] {
    return this.contactsSubject.value.filter((c) => c.esEmergencia);
  }

  /**
   * Get primary contact
   */
  getPrimaryContact(): Contact | null {
    return this.contactsSubject.value.find((c) => c.esPrimario) || null;
  }
}
