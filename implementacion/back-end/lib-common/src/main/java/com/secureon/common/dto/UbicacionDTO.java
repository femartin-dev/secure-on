package com.secureon.common.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.common.model.entity.Ubicacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionDTO {
    private UUID ubicacionId;
    private UUID alarmaId;
    private Double latitud;
    private Double longitud;
    private Double altitud;
    private Integer bateriaNivel;
    @Builder.Default
    private OffsetDateTime fechaToma = OffsetDateTime.now();
    

    public static UbicacionDTO fromEntity(Ubicacion u) {
        return UbicacionDTO.builder()
                            .ubicacionId(u.getId())
                            .alarmaId(u.getAlarma().getId())
                            .latitud(u.getPosicion().getCoordinate().getY())
                            .longitud(u.getPosicion().getCoordinate().getX())
                            .fechaToma(u.getFechaToma())
                            .build();
    }
}
