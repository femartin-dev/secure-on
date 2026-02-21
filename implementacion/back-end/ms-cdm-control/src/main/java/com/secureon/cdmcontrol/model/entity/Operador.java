package com.secureon.cdmcontrol.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(schema = "secure_on_cdmso", name = "operadores_cdm")
@Data
public class Operador {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "operador_id")
    private UUID id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    private Integer legajo;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String telefono;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "hash_contrasena", nullable = false, length = 255)
    private String hashContrasena;

    @Column(name = "es_administrador")
    private Boolean esAdministrador = false;

    @Column(name = "esta_activo")
    private Boolean estaActivo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", referencedColumnName = "operador_id")
    private Operador supervisor;

    @Column(name = "fecha_registro")
    private OffsetDateTime fechaRegistro = OffsetDateTime.now();

}
