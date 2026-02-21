package com.secureon.cdmcontrol.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table( name = "dispositivos", schema = "secure_on_movil")
@Getter
@Setter
public class Dispositivo {

    @Id
    @GeneratedValue
    @Column(name = "dispositivo_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @Column(name = "dispositivo_app_id", nullable = false)
    private UUID dispositivoAppId;

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(length = 50)
    private String fabricante;

    @Column(length = 50)
    private String modelo;

    @Column(length = 50)
    private String plataforma;

    @Column(name = "sistema_operativo", length = 50)
    private String sistemaOperativo;

    @Column(name = "version_del_so", length = 50)
    private String versionSO;

    @Column(name = "zona_horaria", length = 50)
    private String zonaHoraria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idioma_id")
    private Idioma idioma;

    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal = false;

    @Column(name = "esta_activo", nullable = false)
    private Boolean estaActivo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private OffsetDateTime fechaCreacion;
}
