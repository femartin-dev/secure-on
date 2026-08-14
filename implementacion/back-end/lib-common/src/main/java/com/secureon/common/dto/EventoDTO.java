package com.secureon.common.dto;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.common.property.WsDestinoEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventoDTO {
    private String destino;
    private Object payload;
    private OffsetDateTime time;

    public static EventoDTO fromObject(Object payload, WsDestinoEnum destino) {
        EventoDTO event = new EventoDTO();
        event.setDestino(destino.getPath());
        event.setPayload(payload);
        event.setTime(OffsetDateTime.now());
        return event;
    }
}
