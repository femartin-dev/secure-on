package com.secureon.appmovil.dto.messages;

import java.time.OffsetDateTime;

import com.secureon.appmovil.property.DestinoWSEnum;

import lombok.Data;

@Data
public class EventDTO {
    private String destino;
    private Object payload;
    private OffsetDateTime time;

    public static EventDTO fromObject(Object payload, DestinoWSEnum destino) {
        EventDTO event = new EventDTO();
        event.setDestino(destino.getPath());
        event.setPayload(payload);
        event.setTime(OffsetDateTime.now());
        return event;
    }
}
