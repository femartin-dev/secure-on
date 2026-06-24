package com.secureon.common.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "motivos_activacion", schema = "secure_on_utils")
@Getter
@Setter
public class MotivoActivacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "motivo_id")
    private Integer id;

    @Column(length = 50, nullable = false, unique = true)
    private String descripcion;

    @Column(nullable = false)
    private Boolean habilitada = true;
}
