import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, filter, takeUntil } from 'rxjs/operators';
import { Geolocation, Position } from '@capacitor/geolocation';

import { LocationData } from '../models/alarm.models';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  public location$ = this.locationSubject.asObservable();

  private isTrackingSubject = new BehaviorSubject<boolean>(false);
  public isTracking$ = this.isTrackingSubject.asObservable();

  private stopTracking$ = new BehaviorSubject<boolean>(false);

  private lastLocation: LocationData | null = null;
  private updateInterval = 5000; // 5 seconds default

  constructor() {
    this.getCurrentLocation();
  }

  /**
   * Get current location once – tries Capacitor first, falls back to browser API
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return this.positionToLocationData(position);
    } catch (capacitorError) {
      console.warn('Capacitor geolocation failed, trying browser API:', capacitorError);
      return this.getBrowserLocation();
    }
  }

  /**
   * Fallback: use browser navigator.geolocation (for testing in the browser)
   */
  private getBrowserLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Browser geolocation not available');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: LocationData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 0,
            timestamp: new Date().toISOString()
          };
          this.lastLocation = location;
          this.locationSubject.next(location);
          resolve(location);
        },
        (err) => {
          console.error('Browser geolocation error:', err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Start continuous location tracking
   */
  startTracking(intervalMs: number = 5000): Observable<LocationData> {
    this.updateInterval = intervalMs;
    this.stopTracking$.next(false);
    this.isTrackingSubject.next(true);

    return interval(this.updateInterval).pipe(
      switchMap(() => this.getLocationAsObservable()),
      filter((location) => location !== null) as any,
      takeUntil(this.stopTracking$.asObservable().pipe(
        filter((stop) => stop === true)
      ))
    );
  }

  getLocationUpdates(intervalMs: number = 5000): Observable<LocationData> {
    return this.startTracking(intervalMs);
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    this.stopTracking$.next(true);
    this.isTrackingSubject.next(false);
  }

  /**
   * Get location as observable (with browser fallback)
   */
  private async getLocationAsObservable(): Promise<LocationData | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const location = this.positionToLocationData(position);
      this.lastLocation = location;
      this.locationSubject.next(location);

      return location;
    } catch (error) {
      console.warn('Capacitor tracking failed, trying browser API:', error);
      return this.getBrowserLocation();
    }
  }

  /**
   * Get last known location
   */
  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  /**
   * Watch position with callback
   */
  async watchPosition(callback: (location: LocationData) => void): Promise<string> {
    try {
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position, err) => {
          if (err) {
            console.error('Watch position error:', err);
            return;
          }

          if (position) {
            const location = this.positionToLocationData(position);
            this.lastLocation = location;
            callback(location);
          }
        }
      );

      return id;
    } catch (error) {
      console.error('Error watching position:', error);
      return '';
    }
  }

  /**
   * Clear watch position
   */
  async clearWatch(id: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id });
    } catch (error) {
      console.error('Error clearing watch:', error);
    }
  }

  /**
   * Calculate distance between two locations (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert Capacitor Position to LocationData
   */
  private positionToLocationData(position: Position): LocationData {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy || 0,
      timestamp: new Date().toISOString()
    };
  }
}
