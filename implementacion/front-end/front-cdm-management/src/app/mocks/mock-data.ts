// Mock Data para Testing - Coloca esto en tu componente si necesitas datos fake

export const MOCK_USERS = {
  admin: {
    id: 'user_admin_1',
    username: 'admin',
    email: 'admin@secureon.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    role: 'admin' as const,
    phone: '+54 11 0000 0001',
    address: 'Centro de Operaciones',
    isActive: true
  },
  operator: {
    id: 'user_op_1',
    username: 'operator',
    email: 'operator@secureon.com',
    firstName: 'Juan',
    lastName: 'Operador',
    role: 'operator' as const,
    phone: '+54 11 1234 5678',
    address: 'Zona Norte',
    isActive: true
  }
};

export const MOCK_ALERTS = [
  {
    id: 'alert_1',
    userId: 'user_1',
    userName: 'Ricardo Alarcón',
    userPhone: '+52 55 1234 5678',
    type: 'panic' as const,
    status: 'active' as const,
    priority: 'critical' as const,
    title: 'Botón Pánico Activado',
    description: 'Usuario presionó botón de pánico en su dispositivo móvil',
    location: {
      latitude: -31.38755,
      longitude: -64.1799254,
      timestamp: new Date(),
      accuracy: 5
    },
    locationHistory: [
      {
        latitude: -31.38750,
        longitude: -64.17990,
        timestamp: new Date(Date.now() - 60000),
        accuracy: 8
      },
      {
        latitude: -31.38755,
        longitude: -64.1799254,
        timestamp: new Date(),
        accuracy: 5
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    operatorId: 'op_1',
    operatorName: 'Carlos López',
    evidenceUrls: [
      'https://via.placeholder.com/300x200?text=Evidence+1'
    ],
    emergencyContacts: [
      {
        name: 'María Alarcón',
        relationship: 'Esposa',
        phone: '+52 55 9876 5432'
      }
    ],
    nearbyAuthorities: [
      {
        id: 'police_1',
        type: 'police' as const,
        name: 'Policía Municipal',
        unit: 'Unidad 502',
        phone: '+52 11 1111 1111',
        eta: 4,
        distance: 2.5
      },
      {
        id: 'medical_1',
        type: 'medical' as const,
        name: 'Paramédicos Cruz Roja',
        unit: 'Ambulancia AM-23',
        phone: '+52 11 2222 2222',
        eta: 6,
        distance: 3.2
      }
    ],
    notes: 'Usuario reporta actividad sospechosa'
  },
  {
    id: 'alert_2',
    userId: 'user_2',
    userName: 'Centro Comercial',
    userPhone: '+52 11 3333 3333',
    type: 'intrusion' as const,
    status: 'review' as const,
    priority: 'high' as const,
    title: 'Intrusión - Puerta Trasera',
    description: 'Sensor de movimiento activado en puerta trasera',
    location: {
      latitude: -31.39000,
      longitude: -64.18000,
      timestamp: new Date(Date.now() - 300000),
      accuracy: 3
    },
    locationHistory: [],
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 60000),
    operatorId: 'op_2',
    operatorName: 'Sandra Martínez',
    evidenceUrls: [],
    emergencyContacts: [],
    nearbyAuthorities: [
      {
        id: 'police_2',
        type: 'police' as const,
        name: 'Policía Local',
        unit: 'Patrulla 04',
        phone: '+52 11 4444 4444',
        eta: 8,
        distance: 5.0
      }
    ],
    notes: ''
  },
  {
    id: 'alert_3',
    userId: 'user_3',
    userName: 'Hospital Central',
    userPhone: '+52 11 5555 5555',
    type: 'medical' as const,
    status: 'active' as const,
    priority: 'critical' as const,
    title: 'Llamada de Emergencia Médica',
    description: 'Paciente reporta dolor severo',
    location: {
      latitude: -31.38500,
      longitude: -64.17500,
      timestamp: new Date(Date.now() - 120000),
      accuracy: 2
    },
    locationHistory: [
      {
        latitude: -31.38450,
        longitude: -64.17450,
        timestamp: new Date(Date.now() - 120000),
        accuracy: 3
      },
      {
        latitude: -31.38500,
        longitude: -64.17500,
        timestamp: new Date(Date.now() - 60000),
        accuracy: 2
      }
    ],
    createdAt: new Date(Date.now() - 120000),
    updatedAt: new Date(),
    operatorId: 'op_3',
    operatorName: 'Roberto García',
    evidenceUrls: [
      'https://via.placeholder.com/300x200?text=Medical+Report'
    ],
    emergencyContacts: [
      {
        name: 'Juan Pérez',
        relationship: 'Hijo',
        phone: '+52 11 6666 6666'
      }
    ],
    nearbyAuthorities: [
      {
        id: 'medical_2',
        type: 'medical' as const,
        name: 'SAMU - Ambulancia',
        unit: 'Unidad Rápida 2',
        phone: '+52 11 7777 7777',
        eta: 3,
        distance: 1.5
      }
    ],
    notes: 'Paciente adulto mayor, requiere asistencia urgente'
  }
];

// Función para simular respuesta paginated
export function getMockPaginatedAlerts(page: number = 1, pageSize: number = 20) {
  return {
    alerts: MOCK_ALERTS,
    total: MOCK_ALERTS.length,
    page,
    pageSize,
    totalPages: Math.ceil(MOCK_ALERTS.length / pageSize)
  };
}

// Login credentials para testing
export const TEST_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  operator: {
    username: 'operator',
    password: 'operator123'
  },
  supervisor: {
    username: 'supervisor',
    password: 'supervisor123'
  }
};

// Evento simulado de Socket.IO
export const mockSocketAlert = {
  id: 'alert_new_1',
  userId: 'user_new',
  userName: 'Nueva Alerta',
  userPhone: '+54 11 9999 9999',
  type: 'supervision' as const,
  status: 'active' as const,
  priority: 'medium' as const,
  title: 'Supervisión - Rutina A1',
  description: 'Check de ruta de supervisión',
  location: {
    latitude: -31.388,
    longitude: -64.180,
    timestamp: new Date(),
    accuracy: 5
  },
  locationHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  operatorId: 'op_new',
  operatorName: 'Nuevo Operador'
};

// Google Maps Options
export const GOOGLE_MAPS_OPTIONS = {
  zoom: 15,
  center: {
    lat: -31.38755,
    lng: -64.1799254
  },
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  styles: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }]
    }
  ]
};
