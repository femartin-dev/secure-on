import { Injectable } from '@angular/core';
import { DeviceInformation } from '@app/models/device.models';
import { Device, DeviceId, DeviceInfo } from '@capacitor/device';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private batterySubject = new BehaviorSubject<number | null>(null);
  public battery$ = this.batterySubject.asObservable();

  public async getBatteryLevel(): Promise<number | undefined> {
    let batteryLevel: number | undefined;
    try {
      const batteryInfo = await Device.getBatteryInfo();
      batteryLevel = (batteryInfo?.batteryLevel ?? 0) * 100;
    } catch (error) {
      console.warn('Failed to get battery info:', error);
    }
    return batteryLevel;
  }

  public async getDeviceIdentifier(): Promise<string | null> {
    return (await Device.getId())?.identifier || null;
  }

  public async getDeviceInformation(): Promise<DeviceInformation> {
    const appid = await this.getDeviceIdentifier();
    if (!appid) {
      throw new Error('No se pudo obtener el identificador del dispositivo. Asegúrese de que la aplicación tenga los permisos necesarios y que esté ejecutándose en un entorno compatible.');
    }
    return {
      dispositivoAppId: appid,
      fabricante: (await Device.getInfo()).manufacturer || 'unknown',
      modelo: (await Device.getInfo()).model || 'unknown',
      plataforma: (await Device.getInfo()).platform || 'unknown',
      sistemaOperativo: (await Device.getInfo()).operatingSystem || 'unknown',
      versionDelSO: (await Device.getInfo()).osVersion || 'unknown',
      zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
      idiomaId: await this.getLanguageCode(),
    };
  }

  private async getLanguageCode(): Promise<string> {
    try {
      const languageTag = (await Device.getLanguageTag()).value || navigator.language;
      return new Intl.Locale(languageTag).language;
    } catch (error) {
      console.warn('Failed to get language code:', error);
      return 'es';
    }
  }



}
