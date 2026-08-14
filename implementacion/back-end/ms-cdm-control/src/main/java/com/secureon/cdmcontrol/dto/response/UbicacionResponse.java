package com.secureon.cdmcontrol.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.secureon.common.model.converter.PointSerializer;
import com.secureon.common.model.entity.MetodoUbicacion;
import com.secureon.common.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UbicacionResponse {
    private UUID id;
    private UUID alarmaId;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Integer precisionToma;
    private MetodoUbicacion metodoUbicacion;
    private Integer bateriaNivel;    
    private BigDecimal velocidad;
    private BigDecimal altura;
    private BigDecimal rumbo;
    private OffsetDateTime fechaToma;

    private static final String LAT = "Y";
    private static final String LNG = "X";
    private static final String ALT = "Z";

    public static UbicacionResponse fromEntity(Ubicacion u) {
        return UbicacionResponse.builder()
                                .id(u.getId())
                                .alarmaId(u.getAlarma().getId())
                                .precisionToma(u.getPrecision())
                                .latitud(getValorCoordenadas(u,LAT))
                                .longitud(getValorCoordenadas(u,LNG))
                                .metodoUbicacion(u.getMetodoUbicacion())
                                .bateriaNivel(u.getBateriaNivel())
                                .velocidad(u.getVelocidad())
                                .altura(u.getAltura())
                                .rumbo(u.getRumbo())
                                .fechaToma(u.getFechaToma())
                                .build();
    }

    private static BigDecimal getValorCoordenadas(Ubicacion u, String eje) {
        return LAT.equals(eje) ? BigDecimal.valueOf(u.getPosicion().getCoordinate().getY()) :
               LNG.equals(eje) ? BigDecimal.valueOf(u.getPosicion().getCoordinate().getX()) :
               ALT.equals(eje) ? BigDecimal.valueOf(u.getPosicion().getCoordinate().getZ()) : BigDecimal.ZERO;
    }
}

