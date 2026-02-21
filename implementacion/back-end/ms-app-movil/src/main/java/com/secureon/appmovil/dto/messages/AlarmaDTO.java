package com.secureon.appmovil.dto.messages;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlarmaDTO  {
    private UUID alarmaId;
    private UUID userId;
    private Integer estadoId;
    private Integer prioridadId;
    @Builder.Default
    private OffsetDateTime timesamp = OffsetDateTime.now();
    private UbicacionDTO ultimaUbicacion;

    public static AlarmaDTO fromEntity(Alarma a) {
        return AlarmaDTO.builder()
                        .alarmaId(a.getId())
                        .userId(a.getUsuario().getId())
                        .estadoId(a.getEstadoAlarma().getId())
                        .prioridadId(a.getPrioridad().getId())
                        .ultimaUbicacion(ultimaUbicaion(a.getUbicaciones()))
                        .build();
    }

    private static UbicacionDTO ultimaUbicaion(List<Ubicacion> u) { 
        return u.stream()
                .max(Comparator.comparing(Ubicacion::getFechaToma))
                .map(UbicacionDTO::fromEntity)
                .orElse(null);
    }
    
}
