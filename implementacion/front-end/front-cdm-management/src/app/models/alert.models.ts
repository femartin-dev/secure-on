export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: 'panic' | 'intrusion' | 'medical' | 'supervision' | 'system' | 'device';
  status: 'active' | 'review' | 'dispatched' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: Location;
  locationHistory: Location[];
  createdAt: Date;
  updatedAt: Date;
  operatorId?: string;
  operatorName?: string;
  evidenceUrls?: string[];
  emergencyContacts?: EmergencyContact[];
  nearbyAuthorities?: Authority[];
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Authority {
  id: string;
  type: 'police' | 'fire' | 'medical';
  name: string;
  unit: string;
  phone: string;
  eta: number; // estimated time in minutes
  distance: number; // in kilometers
}

export interface PaginatedAlerts {
  alerts: Alert[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
