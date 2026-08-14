
export const ALERT_TYPE_ICONS: Record<string, string> = {
  panic: 'warning',
  intrusion: 'motion_sensor_active',
  medical: 'medical_services',
  supervision: 'visibility',
  system: 'router',
  device: 'signal_disconnected'
};

export const ALERT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  panic: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
  intrusion: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' },
  medical: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400' },
  supervision: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  system: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
  device: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' }
};

export const ALERT_PRIORITY_CLASSES: Record<string, string> = {
  3: "bg-red-500/20 text-red-500 border-red-500/20",
  2: "bg-orange-500/20 text-orange-500 border-orange-500/20",
  1: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  0: "bg-green-500/20 text-green-500 border-green-500/20",
};

export const ALERT_PRIORITY_LABELS: Record<string, string> = {
  3: "CRÍTICA",
  2: "ALTA",
  1: "MEDIA",
  0: "BAJA",
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  1: "Activa",
  2: "Cancelada",
  3: "Finalizada",
};

export function getAlertTypeBorderClass(type: string): string {
  return ALERT_TYPE_COLORS[type]?.border ?? 'border-yellow-500';
}
