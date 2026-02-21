package com.secureon.appmovil.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.EstadoAlarma;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AlarmaResponse {
    private UUID alertaId;
    private OffsetDateTime fechaActivacion;
    private EstadoAlarma estadoAlarma;

    public static AlarmaResponse fromEntity(Alarma alarma) {
        return AlarmaResponse.builder()
                            .alertaId(alarma.getId())
                            .fechaActivacion(alarma.getFechaActivacion())
                            .estadoAlarma(alarma.getEstadoAlarma())
                            .build();
    }
}