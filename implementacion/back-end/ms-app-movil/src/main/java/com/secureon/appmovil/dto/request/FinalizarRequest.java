package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;

import lombok.Data;

@Data
public class FinalizarRequest {
    private Integer motivoActivacion;
    private Integer estadoUsuario; 
    private String observaciones;
    private OffsetDateTime fechaFinalizacion;
}
