package com.secureon.appmovil.dto.messages;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.appmovil.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UbicacionDTO {
    private UUID ubicacionId;
    private Double latitud;
    private Double longitud;
    private Double altitud;
    private Integer bateriaNivel;
    @Builder.Default
    private OffsetDateTime fechaToma = OffsetDateTime.now();
    private UUID alarmaId;

    public static UbicacionDTO fromEntity(Ubicacion u) {
        return UbicacionDTO.builder()
                            .ubicacionId(u.getId())
                            .latitud(u.getPosicion().getCoordinate().getY())
                            .longitud(u.getPosicion().getCoordinate().getX())
                            .fechaToma(u.getFechaToma())
                            .build();
    }

    public static UbicacionDTO fromEntity(Ubicacion u, UUID alarmaId) {
        return UbicacionDTO.builder()
                            .alarmaId(alarmaId)
                            .ubicacionId(u.getId())
                            .latitud(u.getPosicion().getCoordinate().getY())
                            .longitud(u.getPosicion().getCoordinate().getX())
                            .fechaToma(u.getFechaToma())
                            .build();
    }
}
