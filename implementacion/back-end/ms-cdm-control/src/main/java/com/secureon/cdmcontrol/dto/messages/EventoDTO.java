package com.secureon.cdmcontrol.dto.messages;

import java.time.OffsetDateTime;

import com.secureon.cdmcontrol.property.DestinoWSEnum;

import lombok.Data;

@Data
public class EventoDTO {
    private String destino;
    private Object payload;
    private OffsetDateTime time;

    public static EventoDTO fromObject(Object payload, DestinoWSEnum destino) {
        EventoDTO event = new EventoDTO();
        event.setDestino(destino.getPath());
        event.setPayload(payload);
        event.setTime(OffsetDateTime.now());
        return event;
    }
}