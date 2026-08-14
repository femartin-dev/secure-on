package com.secureon.common.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.common.model.entity.Evidencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EvidenciaDTO {
    private UUID evidenciaId;
    private UUID alarmaId;
    private Integer bateriaNivel;
    private Integer tipoEvidenciaId;
    @Builder.Default
    private OffsetDateTime fechaCaptura = OffsetDateTime.now();

    public static EvidenciaDTO fromEntity(Evidencia e) {
        return EvidenciaDTO.builder()
                            .evidenciaId(e.getId())
                            .alarmaId(e.getAlarma().getId())
                            .bateriaNivel(e.getBateriaNivel())
                            .tipoEvidenciaId(e.getTipoEvidencia() == null ? null : e.getTipoEvidencia().getId())
                            .fechaCaptura(e.getFechaCaptura())
                            .build();
    }
}
