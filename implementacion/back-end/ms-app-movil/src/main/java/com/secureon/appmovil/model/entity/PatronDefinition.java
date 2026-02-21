package com.secureon.appmovil.model.entity;

import java.util.List;

import lombok.Data;

@Data
public class PatronDefinition {
    private List<Integer> secuencia;
    private Integer filas;
    private Integer columnas;
}
