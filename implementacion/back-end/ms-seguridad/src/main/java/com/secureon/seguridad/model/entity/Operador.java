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
@Table(schema = "secure_on_cdmso", name = "operadores_cdm")
@Getter
@Setter
public class Operador {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "operador_id")
    private UUID operadorId;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellido;

    @Column(unique = true, nullable = false)
    private Integer legajo;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false, length = 50)
    private String usuario;

    @Column(name = "hash_contrasena", nullable = false)
    private String hashContrasena;

    @Column(name = "es_administrador")
    private Boolean esAdministrador = false;

    @Column(name = "esta_activo")
    private Boolean estaActivo = true;

    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private Operador supervisor;

    @Column(name = "fecha_registro")
    private OffsetDateTime fechaRegistro;
}
