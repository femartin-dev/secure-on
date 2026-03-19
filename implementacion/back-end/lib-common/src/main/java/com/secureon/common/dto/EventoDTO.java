package com.secureon.common.dto;

import java.time.OffsetDateTime;

import com.secureon.common.property.WsDestinoEnum;

import lombok.Data;

@Data
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
