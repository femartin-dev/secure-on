package com.secureon.cdmcontrol.model.entity;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "prioridades", schema = "secure_on_utils")
@Getter
@Setter
public class PrioridadAlarma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prioridad_id")
    private Integer id;

    @Column(length = 20)
    private String descripcion;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private Boolean habilitada = true;

    @JsonIgnore
    @Transient
    private Integer valoracion = 1;

    @Override
    public boolean equals(Object o) {
        try {
            PrioridadAlarma p = (PrioridadAlarma)o;
            return  this.id.equals(p.getId()) &&
                    this.descripcion.equals(p.getDescripcion());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, descripcion);
    }
}