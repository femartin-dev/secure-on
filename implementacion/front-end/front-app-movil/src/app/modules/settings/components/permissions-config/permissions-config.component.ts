import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { AppSettings } from '@app/models/config.models';
import { NotificationService } from '@app/services/notification-toast.service';

interface LocalPermissionSettings {
  contactsPermission: boolean;
  buttonDisableProtection: boolean;
  lockOnStartup: boolean;
}

const LOCAL_PERMISSION_STORAGE_KEY = 'settings_permissions_local';

@Component({
  selector: 'app-permissions-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions-config.component.html',
  styleUrl: './permissions-config.component.css',
})
export class PermissionsConfigComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private audioPermissionValue = true;
  private photoPermissionValue = true;
  private storagePermissionValue = true;
  private backgroundPermissionValue = true;
  private motionPermissionValue = true;
  private locationPermissionValue = true;

  private contactsPermissionValue = true;
  private buttonDisableProtectionValue = true;
  private lockOnStartupValue = true;

  get audioPermission(): boolean {
    return this.audioPermissionValue;
  }

  set audioPermission(value: boolean) {
    this.audioPermissionValue = value;
  }

  get photoPermission(): boolean {
    return this.photoPermissionValue;
  }

  set photoPermission(value: boolean) {
    this.photoPermissionValue = value;
  }

  get storagePermission(): boolean {
    return this.storagePermissionValue;
  }

  set storagePermission(value: boolean) {
    this.storagePermissionValue = value;
  }

  get backgroundPermission(): boolean {
    return this.backgroundPermissionValue;
  }

  set backgroundPermission(value: boolean) {
    this.backgroundPermissionValue = value;
  }

  get motionPermission(): boolean {
    return this.motionPermissionValue;
  }

  set motionPermission(value: boolean) {
    this.motionPermissionValue = value;
  }

  get locationPermission(): boolean {
    return this.locationPermissionValue;
  }

  set locationPermission(value: boolean) {
    this.locationPermissionValue = value;
  }

  get contactsPermission(): boolean {
    return this.contactsPermissionValue;
  }

  set contactsPermission(value: boolean) {
    this.contactsPermissionValue = value;
  }

  get buttonDisableProtection(): boolean {
    return this.buttonDisableProtectionValue;
  }

  set buttonDisableProtection(value: boolean) {
    this.buttonDisableProtectionValue = value;
  }

  get lockOnStartup(): boolean {
    return this.lockOnStartupValue;
  }

  set lockOnStartup(value: boolean) {
    this.lockOnStartupValue = value;
  }

  constructor(
    private readonly notificationService: NotificationService
  ) {
    this.loadLocalSettings();
  }

  ngOnInit(): void {
    void this.refreshPermissionStatuses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onToggleAudio(value: boolean): Promise<void> {
    if (!value) {
      this.audioPermissionValue = false;
      return;
    }

    const granted = await this.requestMicrophonePermission();
    this.audioPermissionValue = granted;

    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de audio');
    }
  }

  async onTogglePhoto(value: boolean): Promise<void> {
    if (!value) {
      this.photoPermissionValue = false;
      return;
    }

    const granted = await this.requestCameraPermission();
    this.photoPermissionValue = granted;
    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de camara/fotos');
    }
  }

  async onToggleStorage(value: boolean): Promise<void> {
    if (!value) {
      this.storagePermissionValue = false;
      return;
    }
    const granted = await this.requestStoragePermission();
    this.storagePermissionValue = granted;

    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de almacenamiento');
    }
  }

  async onToggleBackground(value: boolean): Promise<void> {
    this.backgroundPermissionValue = value;

    if (value && Capacitor.isNativePlatform()) {
      await this.notificationService.showInfo(
        'Segundo plano requiere habilitacion manual en ajustes del sistema'
      );
    }
  }

  async onToggleMotion(value: boolean): Promise<void> {
    if (!value) {
      this.motionPermissionValue = false;
      return;
    }

    const granted = await this.requestMotionPermission();
    this.motionPermissionValue = granted;

    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de movimiento');
    }
  }

  async onToggleLocation(value: boolean): Promise<void> {
    if (!value) {
      this.locationPermissionValue = false;
      return;
    }

    const granted = await this.requestLocationPermission();
    this.locationPermissionValue = granted;

    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de ubicacion');
    }
  }

  async onToggleContacts(value: boolean): Promise<void> {
    if (!value) {
      this.contactsPermissionValue = false;
      this.persistLocalSettings();
      return;
    }

    const granted = await this.requestContactsPermission();
    this.contactsPermissionValue = granted;
    this.persistLocalSettings();

    if (!granted) {
      await this.notificationService.showWarning('No se otorgo permiso de contactos');
    }
  }

  onToggleButtonDisableProtection(value: boolean): void {
    this.buttonDisableProtectionValue = value;
    this.persistLocalSettings();
  }

  onToggleLockOnStartup(value: boolean): void {
    this.lockOnStartupValue = value;
    this.persistLocalSettings();
  }

  private async refreshPermissionStatuses(): Promise<void> {
    const [audio, photo, storage, motion, location, contacts] = await Promise.all([
      this.checkMicrophonePermission(),
      this.checkCameraPermission(),
      this.checkStoragePermission(),
      this.checkMotionPermission(),
      this.checkLocationPermission(),
      this.checkContactsPermission(),
    ]);

    this.audioPermissionValue = audio;
    this.photoPermissionValue = photo;
    this.storagePermissionValue = storage;
    this.motionPermissionValue = motion;
    this.locationPermissionValue = location;
    this.contactsPermissionValue = contacts;

    this.persistLocalSettings();
  }


  private async requestMicrophonePermission(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.warn('Permiso de microfono denegado o no disponible:', error);
      return false;
    }
  }

  private async checkMicrophonePermission(): Promise<boolean> {
    const permissionsApi = (navigator as Navigator & {
      permissions?: { query: (descriptor: PermissionDescriptor) => Promise<PermissionStatus> };
    }).permissions;

    if (!permissionsApi?.query) {
      return this.audioPermissionValue;
    }

    try {
      const status = await permissionsApi.query({ name: 'microphone' as PermissionName });
      return status.state === 'granted';
    } catch {
      return this.audioPermissionValue;
    }
  }

  private async requestCameraPermission(): Promise<boolean> {
    try {
      const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      return this.isGrantedStatus(result?.camera) || this.isGrantedStatus(result?.photos);
    } catch (error) {
      console.warn('Error solicitando permiso de camara:', error);
      return false;
    }
  }

  private async checkCameraPermission(): Promise<boolean> {
    try {
      const result = await Camera.checkPermissions();
      return this.isGrantedStatus(result?.camera) || this.isGrantedStatus(result?.photos);
    } catch {
      return this.photoPermissionValue;
    }
  }

  private async requestStoragePermission(): Promise<boolean> {
    try {
      const { Filesystem } = await import('@capacitor/filesystem' as any);
      if (typeof Filesystem.requestPermissions !== 'function') {
        return true;
      }

      const result = await Filesystem.requestPermissions();
      return this.isGrantedStatus(result?.publicStorage);
    } catch (error) {
      console.warn('Permiso de almacenamiento no disponible:', error);
      return false;
    }
  }

  private async checkStoragePermission(): Promise<boolean> {
    try {
      const { Filesystem } = await import('@capacitor/filesystem' as any);
      if (typeof Filesystem.checkPermissions !== 'function') {
        return this.storagePermissionValue;
      }

      const result = await Filesystem.checkPermissions();
      return this.isGrantedStatus(result?.publicStorage);
    } catch {
      return this.storagePermissionValue;
    }
  }

  private async requestMotionPermission(): Promise<boolean> {
    try {
      const motion = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof motion.requestPermission === 'function') {
        const response = await motion.requestPermission();
        return response === 'granted';
      }

      return true;
    } catch (error) {
      console.warn('Permiso de movimiento no disponible:', error);
      return false;
    }
  }

  private async checkMotionPermission(): Promise<boolean> {
    return this.motionPermissionValue;
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      const result = await Geolocation.requestPermissions();
      return (
        this.isGrantedStatus(result?.location) ||
        this.isGrantedStatus((result as any)?.coarseLocation)
      );
    } catch (error) {
      console.warn('Error solicitando permiso de ubicacion:', error);
      return false;
    }
  }

  private async checkLocationPermission(): Promise<boolean> {
    try {
      const result = await Geolocation.checkPermissions();
      return (
        this.isGrantedStatus(result?.location) ||
        this.isGrantedStatus((result as any)?.coarseLocation)
      );
    } catch {
      return this.locationPermissionValue;
    }
  }

  private async requestContactsPermission(): Promise<boolean> {
    try {
      //const { Contacts } = await import('@capacitor/contacts' as any);

      if (typeof Contacts.requestPermissions !== 'function') {
        return false;
      }

      const result = await Contacts.requestPermissions();
      return this.isGrantedStatus(result?.contacts);
    } catch (error) {
      console.warn('Permiso de contactos no disponible:', error);
      return false;
    }
  }

  private async checkContactsPermission(): Promise<boolean> {
    try {
      //const { Contacts } = await import('@capacitor/contacts' as any);
      if (typeof Contacts.checkPermissions !== 'function') {
        return this.contactsPermissionValue;
      }

      const result = await Contacts.checkPermissions();
      return this.isGrantedStatus(result?.contacts);
    } catch {
      return this.contactsPermissionValue;
    }
  }

  private isGrantedStatus(status: string | undefined): boolean {
    return status === 'granted' || status === 'limited';
  }

  private loadLocalSettings(): void {
    try {
      const stored = localStorage.getItem(LOCAL_PERMISSION_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as LocalPermissionSettings;
      this.contactsPermissionValue = !!parsed.contactsPermission;
      this.buttonDisableProtectionValue = !!parsed.buttonDisableProtection;
      this.lockOnStartupValue = !!parsed.lockOnStartup;
    } catch (error) {
      console.warn('No se pudo cargar configuracion local de permisos:', error);
    }
  }

  private persistLocalSettings(): void {
    try {
      const payload: LocalPermissionSettings = {
        contactsPermission: this.contactsPermissionValue,
        buttonDisableProtection: this.buttonDisableProtectionValue,
        lockOnStartup: this.lockOnStartupValue,
      };
      localStorage.setItem(LOCAL_PERMISSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('No se pudo guardar configuracion local de permisos:', error);
    }
  }
}
