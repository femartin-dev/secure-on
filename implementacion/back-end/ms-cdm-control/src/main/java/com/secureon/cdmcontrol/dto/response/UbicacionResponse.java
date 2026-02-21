package com.secureon.cdmcontrol.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.cdmcontrol.model.entity.MetodoUbicacion;
import com.secureon.cdmcontrol.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UbicacionResponse {
    private UUID id;
    private UUID alarmaId;
    private Point posicion;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Integer precisionToma;
    private MetodoUbicacion metodoUbicacion;
    private Integer bateriaNivel;
    private Boolean esEstimada;
    @JsonIgnore
    private BigDecimal velocidad;
    private BigDecimal altura;
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
                                .metodoUbicacion(u.getMetodoUbicacion())
                                .bateriaNivel(u.getBateriaNivel())
                                .esEstimada(u.getEsEstimada())
                                //.velocidad(u.getVelocidad())
                                .altura(getValorCoordenadas(u,ALT))
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

