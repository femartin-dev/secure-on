import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';
import { GeolocationService } from './geolocation.service';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import {
  AlarmActivationRequest,
  AlarmActivationResponse,
  AlarmFinalizationRequest,
  AlarmBlockRequest,
  LocationUpdate,
  AlarmStatus,
  LocationData,
  toUbicacion
} from '../models/alarm.models';

@Injectable({
  providedIn: 'root'
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
    private webSocketService: WebSocketService
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

  async requestEmergencyBypass(_: { timestamp: Date; reason: string }): Promise<{ approved: boolean }> {
    return { approved: true };
  }

  /**
   * Trigger alarm activation sequence
   */
  async initiateAlarmActivation(): Promise<void> {
    try {
      // Start 3-second countdown
      this.startActivationCountdown(3);

      // Start the 15-second pre-alarm countdown (persists across navigation)
      this.startPreAlarmCountdown(15);

      // Vibrate device
      await this.vibrateAlarm();

      // Show notification
      this.notificationService.showToast('Alarma activada - 15 segundos para cancelar');
    } catch (error) {
      console.error('Error initiating alarm:', error);
      this.notificationService.showToast('Error al activar alarma');
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
   * Start activation countdown
   */
  private startActivationCountdown(seconds: number): void {
    let count = seconds;
    this.activationCountdownSubject.next(count);

    this.activationTimerId = setInterval(() => {
      count--;
      this.activationCountdownSubject.next(count);

      if (count <= 0) {
        clearInterval(this.activationTimerId);
        this.completeActivation();
      }
    }, 1000);
  }

  /**
   * Complete alarm activation
   * POST /servicios-moviles/v1/alarma/nueva
   */
  private async completeActivation(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      const location = await this.geolocationService.getCurrentLocation();

      if (!user || !location) {
        throw new Error('No user or location data');
      }

      const request: AlarmActivationRequest = {
        usuarioId: user.id,
        dispositivoId: user.dispositivoId ?? '',
        metodosActivacion: [1],        // Default: BOTÓN DE PÁNICO
        metodoUbicacion: 1,            // Default: GPS
        prioridad: 2,                  // Default: ALTA
        ubicacion: toUbicacion(location)
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

        // Start cancellation countdown (default 15s)
        this.startCancellationCountdown(15);

        // Start sending location updates periodically
        this.startLocationUpdates(response.alarmaId, 5000);

        // Show notification
        this.notificationService.showToast(
          `Alarma activa - 15 segundos para cancelar`
        );
      }
    } catch (error) {
      console.error('Error completing alarm activation:', error);
      this.notificationService.showToast('Error al activar alarma');
    }
  }

  /**
   * Start cancellation countdown
   */
  private startCancellationCountdown(seconds: number): void {
    let count = seconds;
    this.cancellationCountdownSubject.next(count);

    this.cancellationTimerId = setInterval(() => {
      count--;
      this.cancellationCountdownSubject.next(count);

      if (count <= 0) {
        clearInterval(this.cancellationTimerId);
        this.handleAlarmExpiration();
      }
    }, 1000);
  }

  /**
   * Handle alarm expiration (time ran out)
   * PUT /servicios-moviles/v1/alarma/{alarmaId}/finalizar
   */
  private async handleAlarmExpiration(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      const alarm = this.activeAlarmSubject.value;
      const location = await this.geolocationService.getCurrentLocation();

      if (!user || !alarm || !location) {
        throw new Error('Missing data for alarm expiration');
      }

      // Finalize the alarm via PUT /{alarmaId}/finalizar
      const finalizeRequest: AlarmFinalizationRequest = {
        motivo: 'Tiempo expirado',
        detalles: 'La alarma no fue cancelada dentro del tiempo límite'
      };

      await this.http
        .put(
          `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarm.alarmaId}/finalizar`,
          finalizeRequest
        )
        .toPromise();

      this.alarmStatusSubject.next('INACTIVA');
      this.notificationService.showToast('Dispositivo bloqueado - Alarma enviada al CDM');

      // Stop location updates
      this.stopLocationUpdates();

      // Log to local storage
      await this.logIncident(alarm.alarmaId, 'INACTIVA', location);
    } catch (error) {
      console.error('Error handling alarm expiration:', error);
      this.notificationService.showToast('Error al bloquear dispositivo');
    }
  }

  /**
   * Cancel (finalize) alarm with verification method
   * PUT /servicios-moviles/v1/alarma/{alarmaId}/finalizar
   */
  async cancelAlarm(method: string, value: string): Promise<boolean> {
    try {
      const user = this.authService.getCurrentUser();
      const alarm = this.activeAlarmSubject.value;
      const location = await this.geolocationService.getCurrentLocation();

      if (!user || !alarm || !location) {
        throw new Error('Missing data for cancellation');
      }

      const request: AlarmFinalizationRequest = {
        motivo: `Cancelada por usuario (${method})`,
        detalles: `Método: ${method}`
      };

      await this.http
        .put(
          `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarm.alarmaId}/finalizar`,
          request
        )
        .toPromise();

      this.alarmStatusSubject.next('INACTIVA');
      this.stopAlarmTimers();
      this.stopLocationUpdates();

      this.notificationService.showToast('Alarma cancelada correctamente');

      // Log to local storage
      await this.logIncident(alarm.alarmaId, 'INACTIVA', location, method);

      // Reset state
      this.resetAlarmState();

      return true;
    } catch (error) {
      console.error('Error cancelling alarm:', error);
      this.notificationService.showToast('Error al cancelar alarma');
      return false;
    }
  }

  /**
   * Start sending location updates to server.
   * - HTTP POST /alarma/{alarmaId}/ubicacion  (REST fallback)
   * - WebSocket STOMP publish to /topic/ubicacion/realtime (real-time)
   */
  private startLocationUpdates(alarmaId: string, intervalMs: number): void {
    // Ensure WebSocket is connected for real-time updates
    if (!this.webSocketService.isConnected) {
      this.webSocketService.connect();
    }

    this.locationUpdateIntervalId = setInterval(async () => {
      try {
        const user = this.authService.getCurrentUser();
        const location = await this.geolocationService.getCurrentLocation();

        if (!user || !location) return;

        const update: LocationUpdate = {
          latitud: location.latitude,
          longitud: location.longitude,
          altura: 0,
          precision: location.accuracy
        };

        // 1) Send via WebSocket (real-time for CDM)
        if (this.webSocketService.isConnected) {
          this.webSocketService.publish(
            API_CONFIG.WS_TOPICS.LOCATION_REALTIME,
            {
              alarmaId,
              dispositivoId: user.dispositivoId ?? '',
              ...update,
              timestamp: new Date().toISOString()
            }
          );
        }

        // 2) Also POST via HTTP (persistence / fallback)
        await this.http
          .post(
            `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarmaId}/ubicacion`,
            update
          )
          .toPromise();
      } catch (error) {
        console.error('Error updating location:', error);
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
    this.notificationService.showToast('Alarma cancelada');
  }

  /**
   * Finalize an active alarm on the backend.
   * Called when the user deactivates from the lock screen.
   * PUT /servicios-moviles/v1/alarma/{alarmaId}/finalizar
   */
  async finalizeAlarm(method: string, value: string): Promise<boolean> {
    try {
      const user = this.authService.getCurrentUser();
      const alarm = this.activeAlarmSubject.value;
      const location = await this.geolocationService.getCurrentLocation();

      if (!user || !alarm || !location) {
        throw new Error('Missing data for finalization');
      }

      const request: AlarmFinalizationRequest = {
        motivo: `Desactivada por usuario (${method})`,
        detalles: `Método: ${method}`
      };

      await this.http
        .put(
          `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}/${alarm.alarmaId}/finalizar`,
          request
        )
        .toPromise();

      this.alarmStatusSubject.next('INACTIVA');
      this.stopAlarmTimers();
      this.stopLocationUpdates();

      this.notificationService.showToast('Alarma desactivada correctamente');

      // Log to local storage
      await this.logIncident(alarm.alarmaId, 'INACTIVA', location, method);

      // Reset state
      this.resetAlarmState();

      return true;
    } catch (error) {
      console.error('Error finalizing alarm:', error);
      this.notificationService.showToast('Error al desactivar alarma');
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
        metodosActivacion: [1],
        metodoUbicacion: 1,
        prioridad: 2,
        ubicacion: location ? toUbicacion(location) : { latitud: 0, longitud: 0, altura: 0, precision: 0 }
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
    alarmaId: string,
    status: AlarmStatus,
    location: LocationData,
    method?: string
  ): Promise<void> {
    try {
      const incident = {
        alarmaId,
        timestamp: new Date().toISOString(),
        status,
        location,
        method
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
  getAlarmHistory(): Observable<any> {
    return this.http.get(
      `${API_CONFIG.MS_APP_MOVIL.baseUrl}${API_CONFIG.ENDPOINTS.ALARM_BASE}`
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
