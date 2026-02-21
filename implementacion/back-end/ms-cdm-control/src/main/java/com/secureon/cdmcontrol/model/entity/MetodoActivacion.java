package com.secureon.cdmcontrol.model.entity;


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
@Table(name = "metodo_activacion", schema = "secure_on_utils")
@Getter
@Setter
public class MetodoActivacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metodo_id")
    private Integer id;

    @Column(length = 50)
    private String descripcion;

    @Column(nullable = false)
    private Boolean habilitada = true;
}
