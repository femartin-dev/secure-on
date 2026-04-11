package com.secureon.common.dto;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Ubicacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlarmaDTO {
    private UUID alarmaId;
    private UUID userId;
    private Integer estadoId;
    private Integer prioridadId;
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now();
    private UbicacionDTO ultimaUbicacion;

    public static AlarmaDTO fromEntity(Alarma a) {
        return AlarmaDTO.builder()
                        .alarmaId(a.getId())
                        .userId(a.getUsuario() == null ? null : a.getUsuario().getId())
                        .estadoId(a.getEstadoAlarma() == null ? null : a.getEstadoAlarma().getId())
                        .prioridadId(a.getPrioridad() == null ? null : a.getPrioridad().getId())
                        .ultimaUbicacion(ultimaUbicaion(a.getUbicaciones()))
                        .build();
    }

    
    private static UbicacionDTO ultimaUbicaion(List<Ubicacion> u) { 
        return u == null ? null : u.stream()
                .max(Comparator.comparing(Ubicacion::getFechaToma))
                .map(UbicacionDTO::fromEntity)
                .orElse(null);
    }


}
