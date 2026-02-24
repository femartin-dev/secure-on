package com.secureon.cdmcontrol.dto.messages;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlarmaDTO {
    private UUID alarmaId;
    private UUID userId;
    private Integer estadoId;
    private Integer prioridadId;
    private OffsetDateTime timesamp;
}
