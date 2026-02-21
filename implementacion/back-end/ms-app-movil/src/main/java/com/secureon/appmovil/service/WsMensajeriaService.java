package com.secureon.appmovil.service;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.secureon.appmovil.dto.messages.AlarmaDTO;
import com.secureon.appmovil.dto.messages.EventDTO;
import com.secureon.appmovil.dto.messages.UbicacionDTO;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.Ubicacion;
import com.secureon.appmovil.property.DestinoWSEnum;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WsMensajeriaService {

    private final String url;
    private final RestTemplate restTemplate;
    
    public WsMensajeriaService(RestTemplate restTemplate, 
                                @Value("${api-gateway.server_url}") String url,
                                @Value("${api-gateway.endpoints.ws-internal}") String path) {
        this.restTemplate = restTemplate;
        this.url = url + path;
    }
    
    private void enviarMensajeHttp(EventDTO mensaje) {
        
        try {
            ResponseEntity<Void> response = 
                    restTemplate.postForEntity( url, mensaje, Void.class );

            if (response.getStatusCode() == HttpStatus.ACCEPTED) {
                log.info("Mensaje encolado correctamente");
            }
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error HTTP al enviar mensaje: {} - {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error al enviar mensaje: {}", e.getMessage());
        }
    }

    public void publicarNuevaAlarma(Alarma alarma) {
        this.enviarMensajeHttp(EventDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            DestinoWSEnum.TOPIC_ALARMA_NUEVA));
    }

    public void publicarUbicacion(UUID alarmaId, Ubicacion ubicacion) {
        this.enviarMensajeHttp(EventDTO.fromObject(UbicacionDTO.fromEntity(ubicacion, alarmaId), 
                                            DestinoWSEnum.TOPIC_UBICACION_REALTIME));
    }

    public void publicarFinalizacion(Alarma alarma) {
        this.enviarMensajeHttp(EventDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            DestinoWSEnum.TOPIC_ALARMA_FINALIZACION));
    }

    public void publicarReactivacion(Alarma alarma) {
        this.enviarMensajeHttp(EventDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            DestinoWSEnum.TOPIC_ALARMA_REACTIVACION));
    }
}