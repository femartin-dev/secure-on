import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  baseUrl = environment.apiUrl;
  socketUrl = environment.socketUrl;
  googleMapsApiKey = environment.googleMapsApiKey;

  constructor() {}

  getApiUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  getSocketUrl(): string {
    return this.socketUrl;
  }

  getGoogleMapsKey(): string {
    return this.googleMapsApiKey;
  }
}
