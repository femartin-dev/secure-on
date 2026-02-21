package com.secureon.cdmcontrol.listerner;

import java.security.Principal;
import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class WebSocketMessageListener {

    // Escucha mensajes enviados a /app/topic/ cualquier cosa
    @MessageMapping("/topic/{topico}")
    public void listenTopicMessages(@DestinationVariable String topico,
                                    @Payload Map<String, Object> mensaje,
                                    Principal principal) {
        
        log.info("🎧 LISTENER: Mensaje recibido en TOPIC [{}]", topico);
        log.info("   → De usuario: {}", principal != null ? principal.getName() : "anónimo");
        log.info("   → Contenido: {}", mensaje);
        
        // AQUÍ HACES LO QUE NECESITES CON EL MENSAJE
        // Por ejemplo: guardarlo en base de datos
        // enviarlo a otro servicio, procesarlo, etc.
        procesarMensajeRecibido(topico, mensaje, principal);
    }
    
    // Escucha mensajes enviados a /app/queue/ cualquier cosa
    @MessageMapping("/queue/{destino}")
    public void listenQueueMessages(@DestinationVariable String destino,
                                    @Payload Map<String, Object> mensaje,
                                    Principal principal) {
        
        log.info("🎧 LISTENER: Mensaje recibido en QUEUE [{}]", destino);
        log.info("   → De usuario: {}", principal != null ? principal.getName() : "anónimo");
        log.info("   → Contenido: {}", mensaje);
        
        // AQUÍ HACES LO QUE NECESITES CON EL MENSAJE
        procesarMensajeRecibido(destino, mensaje, principal);
    }
    
    private void procesarMensajeRecibido(String destino, 
                                         Map<String, Object> mensaje,
                                         Principal principal) {
        // Tu lógica de negocio aquí
        // Por ejemplo:
        String tipoMensaje = (String) mensaje.get("tipo");
        String contenido = (String) mensaje.get("contenido");
        
        log.info("Procesando mensaje tipo: {}, contenido: {}", tipoMensaje, contenido);
        
        // Hacer algo con el mensaje...
    }
}
