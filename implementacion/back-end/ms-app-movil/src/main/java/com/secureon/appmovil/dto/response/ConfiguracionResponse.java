package com.secureon.appmovil.dto.response;

import java.util.UUID;

import com.secureon.appmovil.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.model.entity.Idioma;
import com.secureon.appmovil.model.entity.PatronDefinition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionResponse {

    private UUID id;
    private UUID usuarioId;
    private UUID dispositivoId;
    private Idioma idioma;
    private String fraseActivacionVoz;
    private PatronDefinition patronActivacion;
    private String sensibilidadMovimiento;
    private Integer tiempoCancelacionSeg;
    private Boolean modoSigilosoActivo;
    private Boolean notificarSiempreSms;
    private PatronDefinition patronDesbloqueo;
    private Integer pinDesbloqueo;
    private String passDesbloqueo;
    private Integer umbralBateriaMedia;
    private Integer umbralBateriaBaja;
    private Integer umbralBateriaCritica;
    private Integer nroIntentosFallidos;
    private String templateMensaje;
    private Integer frecuenciaCapturaFotos;
    private Integer frecuenciaGrabaAudio;
    private Integer frecuenciaUbicacion;
    private Boolean conservarEvidencias;
    private Integer retencionEvidenciasDias;
    private Integer limiteEspacioEvidencias;
    private Boolean borrarAntiguas;
    private Boolean borrarEnviadas;
    private Double espacioCriticoPct;
    private Integer conservarHistorialLocal;
    private Boolean usarDatosMoviles;
    private Integer limiteDatos;
    private Boolean envioSoloWifi;
    private Integer precisionRed;
    private Boolean ubicacionWifi;
    private Boolean usarFiltrosRuido;
    private String compresionAudio;
    private Double resolucionFotosDpi;
    private Integer umbralMinimoLux;

    public static ConfiguracionResponse fromEntity(ConfiguracionUsuario config) {
        return ConfiguracionResponse.builder()
                                    .id(config.getId())
                                    .usuarioId(config.getUsuario().getId())
                                    .dispositivoId(config.getDispositivo().getId())
                                    .idioma(config.getIdioma())
                                    .fraseActivacionVoz(config.getFraseActivacionVoz())
                                    .patronActivacion(config.getPatronActivacion())
                                    .sensibilidadMovimiento(config.getSensibilidadMovimiento())
                                    .tiempoCancelacionSeg(config.getTiempoCancelacionSeg())
                                    .modoSigilosoActivo(config.getModoSigilosoActivo())
                                    .notificarSiempreSms(config.getNotificarSiempreSms())
                                    .patronDesbloqueo(config.getPatronDesbloqueo())
                                    .pinDesbloqueo(config.getPinDesbloqueo())
                                    .passDesbloqueo(config.getPassDesbloqueo())
                                    .umbralBateriaMedia(config.getUmbralBateriaMedia())
                                    .umbralBateriaBaja(config.getUmbralBateriaBaja())
                                    .umbralBateriaCritica(config.getUmbralBateriaCritica())
                                    .nroIntentosFallidos(config.getNroIntentosFallidos())
                                    .templateMensaje(config.getTemplateMensaje())
                                    .frecuenciaCapturaFotos(config.getFrecuenciaCapturaFotos())
                                    .frecuenciaGrabaAudio(config.getFrecuenciaGrabaAudio())
                                    .frecuenciaUbicacion(config.getFrecuenciaUbicacion())
                                    .conservarEvidencias(config.getConservarEvidencias())
                                    .retencionEvidenciasDias(config.getRetencionEvidenciasDias())
                                    .limiteEspacioEvidencias(config.getLimiteEspacioEvidencias())
                                    .borrarAntiguas(config.getBorrarAntiguas())
                                    .borrarEnviadas(config.getBorrarEnviadas())
                                    .espacioCriticoPct(config.getEspacioCriticoPct())
                                    .conservarHistorialLocal(config.getConservarHistorialLocal())
                                    .usarDatosMoviles(config.getUsarDatosMoviles())
                                    .limiteDatos(config.getLimiteDatos())
                                    .envioSoloWifi(config.getEnvioSoloWifi())
                                    .precisionRed(config.getPrecisionRed())
                                    .ubicacionWifi(config.getUbicacionWifi())
                                    .usarFiltrosRuido(config.getUsarFiltrosRuido())
                                    .compresionAudio(config.getCompresionAudio())
                                    .resolucionFotosDpi(config.getResolucionFotosDpi())
                                    .umbralMinimoLux(config.getUmbralMinimoLux())
                                    .build();
    }
}
