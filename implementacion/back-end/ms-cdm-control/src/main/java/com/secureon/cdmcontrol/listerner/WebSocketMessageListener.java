package com.secureon.cdmcontrol.listerner;

import java.security.Principal;
import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.secureon.cdmcontrol.dto.messages.AlarmaDTO;
import com.secureon.cdmcontrol.service.AlarmaWsProcessor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketMessageListener {

    private final AlarmaWsProcessor alarmaWsProcessor;

    @MessageMapping("/topic/alarma/nueva")
    public void onAlarmaNueva(@Payload AlarmaDTO alarmaDTO, Principal principal) {
        alarmaWsProcessor.procesarNueva(
                alarmaDTO,
                principal != null ? principal.getName() : "anonimo");
    }

    @MessageMapping("/topic/{topico}")
    public void listenTopicMessages(@DestinationVariable String topico,
                                    @Payload Map<String, Object> mensaje,
                                    Principal principal) {
        log.info("Mensaje recibido en TOPIC [{}] de: {}", topico,
                principal != null ? principal.getName() : "anónimo");
        log.debug("Contenido: {}", mensaje);
        procesarMensajeRecibido(topico, mensaje, principal);
    }

    @MessageMapping("/queue/{destino}")
    public void listenQueueMessages(@DestinationVariable String destino,
                                    @Payload Map<String, Object> mensaje,
                                    Principal principal) {
        log.info("Mensaje recibido en QUEUE [{}] de: {}", destino,
                principal != null ? principal.getName() : "anónimo");
        log.debug("Contenido: {}", mensaje);
        procesarMensajeRecibido(destino, mensaje, principal);
    }

    private void procesarMensajeRecibido(String destino,
                                         Map<String, Object> mensaje,
                                         Principal principal) {
        String tipoMensaje = (String) mensaje.get("tipo");
        log.info("Procesando mensaje tipo: {} en destino: {}", tipoMensaje, destino);
    }
}
