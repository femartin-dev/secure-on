export interface Ubicacion {
  ubicacionId?: string;
  latitud: number;
  longitud: number;
  altitud?: number;
  precision?: number;
  metodoUbicacionId?: number; // ID from catalogo/metodos-ubicacion
  fecha?: string | number;
  bateria?: number; // 0-100
  velocidad?: number;
  rumbo?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp?: string | number;
  batteryLevel?: number; // 0-100
  locationMethod?: number;
  speed?: number;
  heading?: number;
}

export function toUbicacion(location: LocationData): Ubicacion {
  return {
    latitud: location.latitude,
    longitud: location.longitude,
    altitud: location.altitude,
    precision: location.accuracy,
    fecha: location.timestamp,
    bateria: location.batteryLevel,
    metodoUbicacionId: location.locationMethod,
    velocidad: location.speed,
    rumbo: location.heading,
  };
}
