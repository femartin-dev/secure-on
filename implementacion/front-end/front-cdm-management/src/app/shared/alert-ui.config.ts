import { Alert } from '../models/alert.models';

export const ALERT_TYPE_ICONS: Record<Alert['type'], string> = {
  panic: 'warning',
  intrusion: 'motion_sensor_active',
  medical: 'medical_services',
  supervision: 'visibility',
  system: 'router',
  device: 'signal_disconnected'
};

export const ALERT_TYPE_COLORS: Record<Alert['type'], { bg: string; text: string; border: string }> = {
  panic: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
  intrusion: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' },
  medical: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400' },
  supervision: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  system: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
  device: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' }
};

export const ALERT_PRIORITY_CLASSES: Record<Alert['priority'], string> = {
  critical: 'bg-red-500/20 text-red-500 border-red-500/20',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/20 text-green-500 border-green-500/20'
};

export const ALERT_PRIORITY_LABELS: Record<Alert['priority'], string> = {
  critical: 'CRÍTICA',
  high: 'ALTA',
  medium: 'MEDIA',
  low: 'BAJA'
};

export const ALERT_STATUS_LABELS: Record<Alert['status'], string> = {
  active: 'Activo',
  review: 'En Revisión',
  dispatched: 'Despachado',
  resolved: 'Resuelto'
};

export function getAlertTypeBorderClass(type: Alert['type']): string {
  return ALERT_TYPE_COLORS[type]?.border ?? 'border-yellow-500';
}
