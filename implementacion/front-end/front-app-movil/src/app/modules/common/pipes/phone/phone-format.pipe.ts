import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true,
  pure: false,
})
export class PhoneFormatPipe implements PipeTransform {
  private countryConfigs: { [key: string]: any } = {
    '54': {
      // Argentina
      code: 'ar',
      format: (phone: string) => {
        const areaBeginIdx = phone.startsWith('549') ? 3 : phone.startsWith('54') ? 2 : phone.startsWith('0') ? 1 : 0;
        const areaPlusIdx = phone.substring(areaBeginIdx).startsWith('11') ? 2 : 3;
        const phoneRemovalIdx = phone.substring(areaBeginIdx + areaPlusIdx).startsWith('15') ? 2 : 0;
        const phoneFPBeginIdx = areaBeginIdx + areaPlusIdx + phoneRemovalIdx;
        const phoneFPEndIdx = phone.length - 4;
        const areaCode = phone.substring(areaBeginIdx, areaBeginIdx + areaPlusIdx);
        const phoneFirstPart = phone.substring(phoneFPBeginIdx, phoneFPEndIdx);
        const phoneSecondPart = phone.substring(phoneFPEndIdx);
        return `+54 9 (${areaCode}) ${phoneFirstPart}-${phoneSecondPart}`;
      },
    },
    '55': {
      // Brasil
      code: 'br',
      format: (phone: string) => {
        if (phone.length === 11) {
          return `+55 (${phone.substring(2, 4)}) ${phone.substring(4, 5)} ${phone.substring(5, 9)}-${phone.substring(9)}`;
        }
        return `+55 (${phone.substring(2, 4)}) ${phone.substring(4, 8)}-${phone.substring(8)}`;
      },
    },
    '56': {
      // Chile
      code: 'cl',
      format: (phone: string) => {
        return `+56 9 ${phone.substring(2, 6)} ${phone.substring(6, 10)}`;
      },
    },
    '57': {
      // Colombia
      code: 'co',
      format: (phone: string) => {
        return `+57 ${phone.substring(2, 5)} ${phone.substring(5)}`;
      },
    },
    '593': {
      // Ecuador
      code: 'ec',
      format: (phone: string) => {
        return `+593 9 ${phone.substring(3, 7)} ${phone.substring(7)}`;
      },
    },
    '595': {
      // Paraguay
      code: 'py',
      format: (phone: string) => {
        return `+595 ${phone.substring(3, 6)} ${phone.substring(6)}`;
      },
    },
    '51': {
      // Perú
      code: 'pe',
      format: (phone: string) => {
        return `+51 ${phone.substring(2, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
      },
    },
    '591': {
      // Bolivia
      code: 'bo',
      format: (phone: string) => {
        return `+591 ${phone.substring(3, 4)} ${phone.substring(4)}`;
      },
    },
    '598': {
      // Uruguay
      code: 'uy',
      format: (phone: string) => {
        return `+598 ${phone.substring(3, 5)} ${phone.substring(5)}`;
      },
    },
    '58': {
      // Venezuela
      code: 've',
      format: (phone: string) => {
        return `+58 ${phone.substring(2, 5)} ${phone.substring(5)}`;
      },
    },
    '34': {
      // España
      code: 'es',
      format: (phone: string) => {
        return `+34 ${phone.substring(2, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
      },
    },
    '1': {
      // Estados Unidos
      code: 'us',
      format: (phone: string) => {
        return `+1 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7)}`;
      },
    },
    '52': {
      // México
      code: 'mx',
      format: (phone: string) => {
        if (phone.length === 11 && phone.substring(2, 3) === '1') {
          return `+52 1 ${phone.substring(3, 5)} ${phone.substring(5, 9)} ${phone.substring(9)}`;
        }
        return `+52 ${phone.substring(2, 4)} ${phone.substring(4, 8)} ${phone.substring(8)}`;
      },
    },
    '44': {
      // Reino Unido
      code: 'gb',
      format: (phone: string) => {
        return `+44 ${phone.substring(2, 6)} ${phone.substring(6)}`;
      },
    },
    '33': {
      // Francia
      code: 'fr',
      format: (phone: string) => {
        const digits = phone.substring(2);
        return `+33 ${digits.charAt(0)} ${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7)}`;
      },
    },
    '39': {
      // Italia
      code: 'it',
      format: (phone: string) => {
        return `+39 ${phone.substring(2, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
      },
    },
    '49': {
      // Alemania
      code: 'de',
      format: (phone: string) => {
        return `+49 ${phone.substring(2, 5)} ${phone.substring(5, 9)} ${phone.substring(9)}`;
      },
    },
  };

  transform(value: string | number): string {
    if (!value) return '';

    const clean = value.toString().replace(/\D/g, '');

    // Detectar el país por el prefijo
    for (const [prefix, config] of Object.entries(this.countryConfigs)) {
      if (clean.startsWith(prefix)) {
        return config.format(clean);
      }
    }

    // Si no se detecta país, devolver el número limpio
    return clean;
  }
}
