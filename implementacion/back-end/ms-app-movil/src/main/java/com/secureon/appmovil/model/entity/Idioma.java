package com.secureon.appmovil.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "idiomas", schema = "secure_on_utils")
@Getter
@Setter
public class Idioma {

    @Id
    @Column(name = "idioma_id", length = 2)
    private String id;

    @Column(length = 20)
    private String descripcion;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private Boolean habilitada = true;
}
