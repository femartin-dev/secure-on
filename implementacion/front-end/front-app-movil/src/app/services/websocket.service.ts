import { Injectable, OnDestroy } from '@angular/core';
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { API_CONFIG } from '../config/api-config';
import { AuthService } from './auth.service';

export type WsConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {

  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();

  private connectionStateSubject = new BehaviorSubject<WsConnectionState>('DISCONNECTED');
  public connectionState$ = this.connectionStateSubject.asObservable();

  constructor(private authService: AuthService) {}

  // ────────────────────────────────────────────
  // Connection lifecycle
  // ────────────────────────────────────────────

  /**
   * Connect to the WebSocket broker.
   * Automatically attaches the Bearer token for authentication.
   */
  connect(): void {
    if (this.client?.active) {
      console.warn('[WS] Already connected');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('[WS] Cannot connect — no auth token');
      this.connectionStateSubject.next('ERROR');
      return;
    }

    this.connectionStateSubject.next('CONNECTING');

    this.client = new Client({
      brokerURL: API_CONFIG.WEBSOCKET_URL,
      connectHeaders: {
        'X-Authorization': `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg: string) => {
        // Only log in dev mode
        if (typeof console !== 'undefined') {
          console.debug('[WS STOMP]', msg);
        }
      }
    });

    this.client.onConnect = (_frame: IFrame) => {
      console.log('[WS] Connected');
      this.connectionStateSubject.next('CONNECTED');
    };

    this.client.onStompError = (frame: IFrame) => {
      console.error('[WS] STOMP error:', frame.headers['message'], frame.body);
      this.connectionStateSubject.next('ERROR');
    };

    this.client.onDisconnect = () => {
      console.log('[WS] Disconnected');
      this.connectionStateSubject.next('DISCONNECTED');
    };

    this.client.onWebSocketClose = () => {
      console.log('[WS] WebSocket closed');
      this.connectionStateSubject.next('DISCONNECTED');
    };

    this.client.activate();
  }

  /**
   * Disconnect from the WebSocket broker.
   */
  disconnect(): void {
    if (this.client?.active) {
      // Unsubscribe all
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
    }
    this.connectionStateSubject.next('DISCONNECTED');
  }

  /**
   * Whether the STOMP client is currently connected.
   */
  get isConnected(): boolean {
    return this.client?.active === true && this.connectionStateSubject.value === 'CONNECTED';
  }

  // ────────────────────────────────────────────
  // Publishing
  // ────────────────────────────────────────────

  /**
   * Publish a message to a STOMP destination.
   * @param destination  e.g. '/topic/ubicacion/realtime'
   * @param body         Payload object (will be JSON-stringified)
   * @param headers      Optional extra STOMP headers
   */
  publish(destination: string, body: any, headers?: Record<string, string>): void {
    if (!this.client?.active) {
      console.warn('[WS] Cannot publish — not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers: headers ?? {}
    });
  }

  // ────────────────────────────────────────────
  // Subscribing
  // ────────────────────────────────────────────

  /**
   * Subscribe to a STOMP destination and receive messages as an Observable.
   * @param destination  STOMP topic/queue, e.g. '/app/topic/alarma/nueva'
   * @returns Observable that emits parsed JSON payloads
   */
  subscribe<T = any>(destination: string): Observable<T> {
    const subject = new Subject<T>();

    if (!this.client?.active) {
      console.warn('[WS] Cannot subscribe — not connected');
      return subject.asObservable();
    }

    const sub = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const parsed = JSON.parse(message.body) as T;
        subject.next(parsed);
      } catch {
        console.error('[WS] Failed to parse message:', message.body);
      }
    });

    this.subscriptions.set(destination, sub);
    return subject.asObservable();
  }

  /**
   * Unsubscribe from a specific destination.
   */
  unsubscribe(destination: string): void {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
