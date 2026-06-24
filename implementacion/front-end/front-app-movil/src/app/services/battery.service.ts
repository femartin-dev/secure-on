import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BatteryService {
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


}
