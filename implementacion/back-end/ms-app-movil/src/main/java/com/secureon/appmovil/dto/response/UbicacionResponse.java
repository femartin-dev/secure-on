package com.secureon.appmovil.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.secureon.common.model.entity.MetodoUbicacion;
import com.secureon.common.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UbicacionResponse {
    private UUID id;
    private UUID alarmaId;
    private Point posicion;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Integer precisionToma;
    private MetodoUbicacion metodoUbicacion;
    private Integer bateriaNivel;
    private BigDecimal altura;
    private BigDecimal velocidad;
    private BigDecimal rumbo;
    private OffsetDateTime fechaToma;

    private static final String LAT = "Y";
    private static final String LNG = "X";
    private static final String ALT = "Z";

    public static UbicacionResponse fromEntity(Ubicacion u) {
        return UbicacionResponse.builder()
                                .id(u.getId())
                                .alarmaId(u.getAlarma().getId())
                                .posicion(u.getPosicion())
                                .precisionToma(u.getPrecision())
                                .latitud(getValorCoordenadas(u,LAT))
                                .longitud(getValorCoordenadas(u,LNG))
                                .altura(u.getAltura())
                                .metodoUbicacion(u.getMetodoUbicacion())
                                .bateriaNivel(u.getBateriaNivel())
                                .velocidad(u.getVelocidad())
                                .rumbo(u.getRumbo())
                                .fechaToma(u.getFechaToma())
                                .build();
    }

    private static BigDecimal getValorCoordenadas(Ubicacion u, String eje) {
        double val = LAT.equals(eje) ? u.getPosicion().getCoordinate().getY() :
                     LNG.equals(eje) ? u.getPosicion().getCoordinate().getX() :
                     ALT.equals(eje) ? u.getPosicion().getCoordinate().getZ() : 0.0; 
        return BigDecimal.valueOf(val);
    }
}
