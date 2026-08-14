
export class Constants {
  public static readonly BATTERY_MIN_THRESHOLD = 5;
  public static readonly BATTERY_MAX_THRESHOLD = 90;

  public static readonly EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  public static readonly PHONE_REGEXP = /^\+?[\d\s\-().]{7,15}$/;

  public static readonly MIN_PASSWORD_LENGTH = 8;
  public static readonly MAX_PASSWORD_LENGTH = 20;
}

export const notificationChannelsConfig: Record<number, { icon: string; svgIcon?: string; color: string; title: string }> = {
  0: { icon: 'notifications', color: 'text-slate-400', title: 'Otro' },
  1: { icon: 'sms', color: 'text-orange-500', title: 'SMS' },
  2: { icon: 'chat', svgIcon: 'assets/icons/whatsapp-svgrepo-com.svg', color: 'text-green-600', title: 'WhatsApp' },
  3: { icon: 'send', svgIcon: 'assets/icons/telegram-svgrepo-com.svg', color: 'text-blue-500', title: 'Telegram' },
  4: { icon: 'chat_bubble', svgIcon: 'assets/icons/messenger-svgrepo-com.svg', color: 'text-indigo-500', title: 'Messenger' },
  5: { icon: 'mail', color: 'text-slate-500', title: 'Mail' },
  6: { icon: 'phone', color: 'text-teal-500', title: 'Llamada' },
};


export const arrayGenerator = (size: number, ini: number = 0,  step: number = 1): number[] => {
  return Array.from({ length: size }, (_, i) => ini + (i * step));
};

export enum MetodoActivacion {
  MANUAL = 1,
  PATRON_TACTIL = 2,
  COMANDO_VOZ = 3,
  MOVIMIENTO = 4,
  REACTIVACION = 5,
}

export enum PrioridadAlarma {
  BAJA = 0,
  NORMAL = 1,
  ALTA = 2,
  CRITICA = 3,
}

export enum EstadoAlarma {
  ACTIVA = 1,
  CANCELADA = 2,
  FINALIZADA = 3,
  PENDIENTE = 0
}

