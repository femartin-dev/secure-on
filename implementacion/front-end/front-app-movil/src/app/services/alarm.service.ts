import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';
import { GeolocationService } from './geolocation.service';
import { NotificationService } from './notification-toast.service';
import { WebSocketService } from './websocket.service';
import {
  AlarmActivationRequest,
  AlarmActivationResponse,
  AlarmFinalizationRequest,
  AlarmBlockRequest,
  AlarmStatus,
} from '../models/alarm.models';
import { Ubicacion, LocationData, toUbicacion } from '../models/evidence.models';
import { ConfigService } from './config.service';
import { QueueService } from './queue.service';
import { MetodoActivacion, PrioridadAlarma } from '@app/utils/constants.util';

@Injectable({
  providedIn: 'root',
})
export class AlarmService {
  private activeAlarmSubject = new BehaviorSubject<AlarmActivationResponse | null>(null);
  public activeAlarm$ = this.activeAlarmSubject.asObservable();

  private alarmStatusSubject = new BehaviorSubject<AlarmStatus | null>(null);
  public alarmStatus$ = this.alarmStatusSubject.asObservable();

  private activationCountdownSubject = new BehaviorSubject<number>(0);
  public activationCountdown$ = this.activationCountdownSubject.asObservable();

  private cancellationCountdownSubject = new BehaviorSubject<number>(0);
  public cancellationCountdown$ = this.cancellationCountdownSubject.asObservable();

  /** Pre-alarm countdown (15s window before alarm is sent) — persists across navigation */
  private preAlarmCountdownSubject = new BehaviorSubject<number>(0);
  public preAlarmCountdown$ = this.preAlarmCountdownSubject.asObservable();

  private activationTimerId: any = null;
  private cancellationTimerId: any = null;
  private preAlarmTimerId: any = null;

  private locationUpdateIntervalId: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService,
    private configService: ConfigService,
    private webSocketService: WebSocketService,
    private queueService: QueueService
  ) {}

  isAlarmActive(): boolean {
    return this.alarmStatusSubject.value === 'ACTIVA' && this.activeAlarmSubject.value !== null;
  }

  triggerAlarmCountdown(): void {
    this.initiateAlarmActivation();
  }

  async activateAlarm(_: { timestamp: Date; triggeredBy: string }): Promise<void> {
    await this.initiateAlarmActivation();
  }

  async unlockDevice(_: { timestamp: Date; requestedBy: string }): Promise<{ success: boolean }> {
    this.stopAlarmTimers();
    this.stopLocationUpdates();
    this.resetAlarmState();
    this.notificationService.showSuccess('Dispositivo desbloqueado');
    return { success: true };
  }

  async requestEmergencyBypass(_: {
    timestamp: Date;
    reason: string;
  }): Promise<{ approved: boolean }> {
    return { approved: true };
  }

  /**
   * Trigger alarm activation sequence
   */
  async initiateAlarmActivation(): Promise<void> {
    try {
      const config = this.configService.getCurrentConfig();
      const activationTimer = config?.activation.tiempoActivacionSeg || 3; // Ensure config is loaded
      const cancelTimer = config?.activation.tiempoCancelacionSeg || 15;

      // Start activation countdown (3s)
      //this.startActivationCountdown(activationTimer);

      // Start the pre-alarm countdown (persists across navigation)
      this.startPreAlarmCountdown(cancelTimer);

      // Vibrate device
      await this.vibrateAlarm();

      // Show notification
      this.notificationService.showInfo(`Alarma activada - ${cancelTimer} segundos para cancelar`);
    } catch (error) {
      console.error('Error initiating alarm:', error);
      this.notificationService.showError('Error al activar alarma');
    }
  }

  /**
   * Start pre-alarm countdown (persists across component navigation).
   * When it reaches 0, the alarm is confirmed and sent.
   */
  private startPreAlarmCountdown(seconds: number): void {
    // Clear any existing pre-alarm timer
    if (this.preAlarmTimerId) {
      clearInterval(this.preAlarmTimerId);
    }

    let count = seconds;
    this.preAlarmCountdownSubject.next(count);

    this.preAlarmTimerId = setInterval(() => {
      count--;
      this.preAlarmCountdownSubject.next(count);

      if (count <= 0) {
        clearInterval(this.preAlarmTimerId);
        this.preAlarmTimerId = null;
        // Countdown reached 0 — alarm is auto-confirmed
        // (components subscribe and handle navigation)
      }
    }, 1000);
  }

  /**
   * Stop the pre-alarm countdown (called when alarm is successfully cancelled)
   */
  stopPreAlarmCountdown(): void {
    if (this.preAlarmTimerId) {
      clearInterval(this.preAlarmTimerId);
      this.preAlarmTimerId = null;
    }
    this.preAlarmCountdownSubject.next(0);
  }

  /**
   * Start sending location updates to server.
   * - HTTP POST /alarma/{alarmaId}/ubicacion  (REST fallback)
   * - WebSocket STOMP publish to /topic/ubicacion/realtime (real-time)
   */
  private startLocationUpdates(alarmaId: string, intervalMs: number): void {
    // Ensure WebSocket is connected for real-time updates
    /*
    if (!this.webSocketService.isConnected) {
      this.webSocketService.connect();
    }*/

    this.locationUpdateIntervalId = setInterval(async () => {
      let queueItem;
      try {

        const location = await this.geolocationService.getCurrentLocation();
        if (!location)
          throw new Error('No se pudo obtener la ubicación actual.');
        //await this.queueService.queueLocation(location);


        const user = this.authService.getCurrentUser();
        if (!user)
          throw new Error('No se pudo obtener el usuario actual.');

        //queueItem = await this.queueService.getNextLocation();
        //if (!queueItem)
          //throw new Error('No se pudo obtener la siguiente ubicación en la cola.');
        const payload = toUbicacion(location);

         // Queue for offline persistence
        // 1) Send via WebSocket (real-time for CDM)
        /*
        if (this.webSocketService.isConnected) {
          this.webSocketService.publish(API_CONFIG.WS_TOPICS.LOCATION_REALTIME, {
            alarmaId,
            dispositivoId: user.dispositivoId ?? '',
            ...payload,
            timestamp: new Date().toISOString(),
          });
        }*/

        // 2) Also POST via HTTP (persistence / fallback)
        await this.http
          .post(
            `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarmaId}/enviar/ubicacion`,
            payload
          )
          .toPromise();
        //3 change queue item status

        //await this.queueService.changeLocationStatus(queueItem.id, 'SEND');
      } catch (error) {
        console.error('Error updating location:', error);
        //if (queueItem)
          //await this.queueService.changeLocationStatus(queueItem.id, 'FAILED');
      }
    }, intervalMs);
  }



  /**
   * Stop location updates and disconnect WebSocket
   */
  private stopLocationUpdates(): void {
    if (this.locationUpdateIntervalId) {
      clearInterval(this.locationUpdateIntervalId);
      this.locationUpdateIntervalId = null;
    }
    // Disconnect WebSocket when alarm location tracking stops
    this.webSocketService.disconnect();
  }

  /**
   * Stop all alarm timers
   */
  private stopAlarmTimers(): void {
    if (this.activationTimerId) {
      clearInterval(this.activationTimerId);
      this.activationTimerId = null;
    }

    if (this.cancellationTimerId) {
      clearInterval(this.cancellationTimerId);
      this.cancellationTimerId = null;
    }

    if (this.preAlarmTimerId) {
      clearInterval(this.preAlarmTimerId);
      this.preAlarmTimerId = null;
    }
  }

  /**
   * Reset alarm state (private)
   */
  private resetAlarmState(): void {
    this.activeAlarmSubject.next(null);
    this.alarmStatusSubject.next(null);
    this.activationCountdownSubject.next(0);
    this.cancellationCountdownSubject.next(0);
    this.preAlarmCountdownSubject.next(0);
  }

  /**
   * Public reset – called when the user cancels during the countdown window
   */
  resetState(): void {
    this.stopAlarmTimers();
    this.stopLocationUpdates();
    this.resetAlarmState();
  }

  /**
   * Cancel pre-alarm locally (within the countdown window).
   * No backend call — the alarm was never sent.
   * Just stops timers and resets state.
   */
  cancelPreAlarm(): void {
    this.stopPreAlarmCountdown();
    this.stopAlarmTimers();
    this.resetAlarmState();
    this.notificationService.showInfo('Alarma cancelada');
  }

  /**
   * Finalize an active alarm on the backend.
   * Called when the user deactivates from the lock screen.
   * PUT /servicios-moviles/v1/alarma/{alarmaId}/finalizar
   */
  async finalizeAlarm(method: string, value: string): Promise<boolean> {
    try {

      const alarm = this.activeAlarmSubject.value;
      if (!alarm) {
        throw new Error('No existe alarma activa para finalizar.');
      }

      const request: AlarmFinalizationRequest = {
        fechaFinalizacion: new Date().toISOString(),
      };

      await this.http
        .put(
          `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarm.alarmaId}/finalizar`,
          request
        )
        .toPromise();

      this.alarmStatusSubject.next('FINALIZADA');
      this.stopAlarmTimers();
      this.stopLocationUpdates();

      this.notificationService.showSuccess('Alarma desactivada correctamente');

      // Log to local storage
      await this.logIncident(alarm.alarmaId, 'FINALIZADA');

      // Reset state
      this.resetAlarmState();

      return true;
    } catch (error) {
      console.error('Error finalizing alarm:', error);
      this.notificationService.showError('Error al desactivar alarma');
      return false;
    }
  }

  /**
   * Confirm alarm – called when the countdown expires (user did NOT cancel).
   * Sends the activation request to the backend and marks alarm as ACTIVE.
   */
  async confirmAlarm(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      const location = await this.geolocationService.getCurrentLocation();

      const request: AlarmActivationRequest = {
        usuarioId: user?.id ?? '',
        dispositivoId: user?.dispositivoId ?? '',
        metodoActivacion: MetodoActivacion.MANUAL,
        prioridad: PrioridadAlarma.NORMAL,
        ubicacion: location ? toUbicacion(location) : undefined,
      };

      const response = await this.http
        .post<AlarmActivationResponse>(
          `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.NEW_ALARM}`,
          request
        )
        .toPromise();

      if (response) {
        this.activeAlarmSubject.next(response);
        this.alarmStatusSubject.next(response.estadoAlarma?.descripcion ?? 'ACTIVA');
        // Start sending location updates periodically
        this.startLocationUpdates(response.alarmaId, 5000);
      }
    } catch (error) {
      console.error('Error confirming alarm:', error);
    }
  }

  /**
   * Vibrate alarm pattern
   */
  private async vibrateAlarm(): Promise<void> {
    try {
      // Pattern: 3 heavy impacts
      for (let i = 0; i < 3; i++) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error vibrating device:', error);
    }
  }

  /**
   * Log incident to local storage (for MVP 2)
   */
  private async logIncident(
    alarmaId?: string,
    status?: AlarmStatus,
    location?: LocationData,
    method?: string
  ): Promise<void> {
    try {
      const incident = {
        alarmaId,
        timestamp: new Date().toISOString(),
        status,
        location,
        method,
      };

      // TODO: Store in local IndexedDB or Storage API
      console.log('Incident logged:', incident);
    } catch (error) {
      console.error('Error logging incident:', error);
    }
  }

  /**
   * Get alarm history (not documented in payload – kept for future use)
   */
  getAlarmHistory(usuarioId: string): Observable<any> {
    return this.http.get(
      `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/listado/${usuarioId}`
    );
  }

  /**
   * Reactivate an alarm
   * POST /servicios-moviles/v1/alarma/{alarmaId}/reactivar?dispositivoId=...
   */
  reactivateAlarm(alarmaId: string, dispositivoId: string): Observable<void> {
    return this.http.post<void>(
      `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarmaId}/reactivar?dispositivoId=${dispositivoId}`,
      {}
    );
  }
}
