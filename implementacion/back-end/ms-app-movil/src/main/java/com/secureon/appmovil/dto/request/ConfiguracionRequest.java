package com.secureon.appmovil.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ConfiguracionRequest {
    @NotNull
    private UUID usuarioId;

    @NotNull
    private UUID dispositivoId;

    @Size(min = 2, max = 2)
    private String idiomaId = "es";

    @Size(max = 100)
    private String fraseActivacionVoz = "Secureon Ayuda";

    private JsonNode patronActivacion;

    private String sensibilidadMovimiento;

    private Integer tiempoCancelacionSeg = 15;

    private Boolean modoSigilosoActivo = false;

    private Boolean notificarSiempreSms = false;

    private JsonNode patronDesbloqueo;

    private Integer pinDesbloqueo;

    private String passDesbloqueo;

    private Integer umbralBateriaMedia = 50;

    private Integer umbralBateriaBaja = 20;

    private Integer umbralBateriaCritica = 5;

    private Integer nroIntentosFallidos = 5;

    private String templateMensaje;

    private Integer frecuenciaCapturaFotos = 30;

    private Integer frecuenciaGrabaAudio = 60;

    private Integer frecuenciaUbicacion = 15;

    private Boolean conservarEvidencias = true;

    private Integer retencionEvidenciasDias = 30;

    private Integer limiteEspacioEvidencias = 1000;

    private Boolean borrarAntiguas = true;

    private Boolean borrarEnviadas = true;

    private Double espacioCriticoPct = 1000.0;

    private Integer conservarHistorialLocal = 30;

    private Boolean usarDatosMoviles = true;

    private Integer limiteDatos = 1000;

    private Boolean envioSoloWifi = false;

    private Integer precisionRed = 2000;

    private Boolean ubicacionWifi = true;

    private Boolean usarFiltrosRuido = true;

    private String compresionAudio = "MP3";

    private Double resolucionFotosDpi = 300.0;

    private Integer umbralMinimoLux;
}
