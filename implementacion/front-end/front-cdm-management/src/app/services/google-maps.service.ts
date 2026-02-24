import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { ApiConfigService } from '../config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private loader?: Loader;
  private loadingPromise: Promise<typeof google> | null = null;

  constructor(private apiConfig: ApiConfigService) {}

  loadMapsApi(): Promise<typeof google> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    const apiKey = this.apiConfig.getGoogleMapsKey();
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      return Promise.reject(new Error('Google Maps API key no configurada en environment.'));
    }

    this.loader = new Loader({
      apiKey,
      version: 'weekly'
    });

    this.loadingPromise = this.loader.load();
    return this.loadingPromise;
  }

  async createMap(
    element: HTMLElement,
    options: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    await this.loadMapsApi();
    return new google.maps.Map(element, options);
  }
}
