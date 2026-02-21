package com.secureon.seguridad.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "secure_on_movil", name = "dispositivos")
@Getter
@Setter
public class Dispositivo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "dispositivo_id")
    private UUID dispositivoId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @Column(name = "dispositivo_app_id", nullable = false)
    private UUID dispositivoAppId; // ID único generado por la app

    @Column(nullable = false, length = 20)
    private String numero; // número de teléfono del dispositivo

    private String fabricante;
    private String modelo;
    private String plataforma;

    @Column(name = "sistema_operativo")
    private String sistemaOperativo;

    @Column(name = "version_del_so")
    private String versionDelSO;

    @Column(name = "zona_horaria")
    private String zonaHoraria;

    @Column(name = "idioma_id", length = 2)
    private String idiomaId;

    @Column(name = "es_principal")
    private Boolean esPrincipal = false;

    @Column(name = "esta_activo")
    private Boolean estaActivo = true;

    @Column(name = "fecha_creacion")
    private OffsetDateTime fechaCreacion;

}
