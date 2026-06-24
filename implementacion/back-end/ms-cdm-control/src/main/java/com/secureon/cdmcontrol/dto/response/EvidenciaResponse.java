package com.secureon.cdmcontrol.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.common.model.entity.Evidencia;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EvidenciaResponse {
    private UUID id;
    private UUID alarmaId;
    private Integer tipoEvidencia;
    private byte[] rawData;
    private String mimeType;
    private Boolean enviadoCdm;
    private OffsetDateTime fechaCaptura;

    public static EvidenciaResponse fromEntity(Evidencia evidencia) {
        return EvidenciaResponse.builder()
                .id(evidencia.getId())
                .alarmaId(evidencia.getAlarma().getId())
                .tipoEvidencia(evidencia.getTipoEvidencia().getId())
                .rawData(evidencia.getRawData())
                .mimeType(evidencia.getMimeType())
                .fechaCaptura(evidencia.getFechaCaptura())
                .enviadoCdm(evidencia.getEnviadoCdm())
                .build();
    }


}