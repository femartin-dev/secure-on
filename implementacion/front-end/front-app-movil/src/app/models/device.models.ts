export interface DeviceRegistration extends DeviceInformation {
  id: string;
  usuarioId: string;
  numero: string;
  esPrincipal?: boolean;
  estaActivo?: boolean;
}

export interface DeviceInformation {
  dispositivoAppId: string;
  fabricante?: string;
  modelo?: string;
  plataforma?: string;
  sistemaOperativo?: string;
  versionDelSO?: string;
  zonaHoraria?: string;
  idiomaId?: string;
}
