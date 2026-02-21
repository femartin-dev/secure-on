import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert, Location } from '../models/alert.models';
import { ApiConfigService } from '../config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private alertUpdatedSubject = new BehaviorSubject<Alert | null>(null);
  private alertCreatedSubject = new BehaviorSubject<Alert | null>(null);
  private locationUpdatedSubject = new BehaviorSubject<{ alertId: string; location: Location } | null>(null);

  public isConnected$ = this.connectionSubject.asObservable();
  public alertUpdated$ = this.alertUpdatedSubject.asObservable();
  public alertCreated$ = this.alertCreatedSubject.asObservable();
  public locationUpdated$ = this.locationUpdatedSubject.asObservable();

  constructor(private apiConfig: ApiConfigService) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const socketUrl = this.apiConfig.getSocketUrl();
    
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionSubject.next(false);
    });

    this.socket.on('alert:created', (alert: Alert) => {
      this.alertCreatedSubject.next(alert);
    });

    this.socket.on('alert:updated', (alert: Alert) => {
      this.alertUpdatedSubject.next(alert);
    });

    this.socket.on('alert:location', (data: { alertId: string; location: Location }) => {
      this.locationUpdatedSubject.next(data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  connect(token: string): void {
    if (this.socket && !this.socket.connected) {
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.connectionSubject.value;
  }
}
