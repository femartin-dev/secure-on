package com.secureon.cdmcontrol.listerner;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.secureon.cdmcontrol.dto.messages.AlarmaDTO;
import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.service.AlarmaService;
import com.secureon.cdmcontrol.service.AsignacionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketMessageListener {

    private final AlarmaService alarmaService;
    private final AsignacionService asignacionService;

    @MessageMapping("/topic/alarma/nueva")
    public void onAlarmaNueva(@Payload AlarmaDTO alarmaDTO, Principal principal) {
        log.info("Alarma nueva recibida: alarmaId={}, de usuario: {}",
                alarmaDTO.getAlarmaId(),
                principal != null ? principal.getName() : "anónimo");

        Alarma alarma = alarmaService.obtenerAlarma(alarmaDTO.getAlarmaId())
                .orElseThrow(() -> new RuntimeException(
                        "Alarma no encontrada: " + alarmaDTO.getAlarmaId()));

        asignacionService.asignarAlarma(alarma);
        log.info("Alarma {} asignada correctamente", alarmaDTO.getAlarmaId());
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
