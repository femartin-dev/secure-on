package com.secureon.appmovil.model.entity;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Entity
@Table(name = "configuracion_usuario", schema = "secure_on_movil")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue
    @Column(name = "config_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) 
    private Usuario usuario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispositivo_id", nullable = false)
    private Dispositivo dispositivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idioma_id")
    private Idioma idioma;

    @Column(name = "frase_activacion_voz", length = 100)
    private String fraseActivacionVoz;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "patron_activacion", columnDefinition = "jsonb")
    private PatronDefinition patronActivacion;

    @Column(name = "sensibilidad_movimiento", length = 10)
    private String sensibilidadMovimiento;

    @Column(name = "tiempo_cancelacion_seg")
    private Integer tiempoCancelacionSeg;

    @Column(name = "modo_sigiloso_activo")
    private Boolean modoSigilosoActivo;

    @Column(name = "notificar_siempre_sms")
    private Boolean notificarSiempreSms;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "patron_desbloqueo", columnDefinition = "jsonb")
    private PatronDefinition patronDesbloqueo;

    @Column(name = "pin_desbloqueo")
    private Integer pinDesbloqueo;

    @Column(name = "pass_desbloqueo", length = 20)
    private String passDesbloqueo;

    @Column(name = "umbral_bateria_media")
    private Integer umbralBateriaMedia;

    @Column(name = "umbral_bateria_baja")
    private Integer umbralBateriaBaja;

    @Column(name = "umbral_bateria_critica")
    private Integer umbralBateriaCritica;

    @Column(name = "nro_intentos_fallidos")
    private Integer nroIntentosFallidos;

    @Column(name = "template_mensaje")
    private String templateMensaje;

    @Column(name = "frecuencia_captura_fotos")
    private Integer frecuenciaCapturaFotos;

    @Column(name = "frecuencia_graba_audio")
    private Integer frecuenciaGrabaAudio;

    @Column(name = "frecuencia_ubicacion")
    private Integer frecuenciaUbicacion;

    @Column(name = "conservar_evidencias")
    private Boolean conservarEvidencias;

    @Column(name = "retencion_evidencias_dias")
    private Integer retencionEvidenciasDias;

    @Column(name = "limite_espacio_evidencias")
    private Integer limiteEspacioEvidencias;

    @Column(name = "borrar_antiguas")
    private Boolean borrarAntiguas;

    @Column(name = "borrar_enviadas")
    private Boolean borrarEnviadas;

    @Column(name = "espacio_critico_pct")
    private Double espacioCriticoPct;

    @Column(name = "conservar_historial_local")
    private Integer conservarHistorialLocal;

    @Column(name = "usar_datos_moviles")
    private Boolean usarDatosMoviles;

    @Column(name = "limite_datos")
    private Integer limiteDatos;

    @Column(name = "envio_solo_wifi")
    private Boolean envioSoloWifi;

    @Column(name = "precision_red")
    private Integer precisionRed;

    @Column(name = "ubicacion_wifi")
    private Boolean ubicacionWifi;

    @Column(name = "usar_filtros_ruido")
    private Boolean usarFiltrosRuido;

    @Column(name = "compresion_audio", length = 3)
    private String compresionAudio;

    @Column(name = "resolucion_fotos_dpi")
    private Double resolucionFotosDpi;

    @Column(name = "umbral_minimo_lux")
    private Integer umbralMinimoLux;
}
