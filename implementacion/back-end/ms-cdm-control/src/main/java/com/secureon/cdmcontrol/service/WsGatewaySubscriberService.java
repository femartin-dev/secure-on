package com.secureon.cdmcontrol.service;

import java.lang.reflect.Type;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import com.secureon.common.dto.AlarmaDTO;
import com.secureon.common.dto.UbicacionDTO;
import com.secureon.common.property.WsDestinoEnum;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class WsGatewaySubscriberService {

    private final WebSocketStompClient stompClient;
    private final AlarmaWsProcessor alarmaWsProcessor;

    @Value("${ws-gateway.config.server-url}${ws-gateway.config.endpoint-ws}")
    private String wsGatewayUrl;

    @Value("${ws-gateway.config.auth-token:}")
    private String authToken;

    private volatile StompSession session;

    @PostConstruct
    public void connect() {
        StompHeaders connectHeaders = new StompHeaders();
        if (StringUtils.hasText(authToken)) {
            connectHeaders.add("Authorization", "Bearer " + authToken);
        }

        WebSocketHttpHeaders handshakeHeaders = new WebSocketHttpHeaders();

        CompletableFuture<StompSession> future =
            stompClient.connectAsync(
                wsGatewayUrl,
                handshakeHeaders,
                connectHeaders,
                new StompSessionHandlerAdapter() {
                    @Override
                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                        log.info("Conectado a WS gateway: {}", wsGatewayUrl);
                        WsGatewaySubscriberService.this.session = session;
                        subscribeToTopics(session);
                    }

                    @Override
                    public void handleTransportError(StompSession session, Throwable exception) {
                        log.error("Error de transporte STOMP: {}", exception.getMessage(), exception);
                    }

                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        log.debug("Frame recibido por session handler. headers={}, payloadType={}",
                                headers,
                                payload != null ? payload.getClass().getName() : "null");
                    }

                    @Override
                    public void handleException(StompSession session, StompCommand command,
                            StompHeaders headers, byte[] payload, Throwable exception) {
                        log.error("Error procesando frame STOMP. command={}, headers={}, payload={} ",
                                command,
                                headers,
                                payload != null ? new String(payload) : null,
                                exception);
                    }
                });

        future.whenComplete((result, error) -> {
            if (error != null) {
                log.error("No se pudo conectar a WS gateway: {}", error.getMessage(), error);
            }
        });
    }

    @PreDestroy
    public void disconnect() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }

    private void subscribeToTopics(StompSession session) {
        String destinoAlarmaNueva = WsDestinoEnum.TOPIC_ALARMA_NUEVA.getPath();
        String destinoAlarmaFinalizacion = WsDestinoEnum.TOPIC_ALARMA_FINALIZACION.getPath();
        String destinoAlertaUbicacion = WsDestinoEnum.TOPIC_UBICACION_REALTIME.getPath();
        if (!StringUtils.hasText(destinoAlarmaNueva)) {
            log.warn("Destino TOPIC_ALARMA_NUEVA no configurado");
            return;
        }

        session.subscribe(destinoAlarmaNueva, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                log.debug("Suscripcion {} recibe headers {}", destinoAlarmaNueva, headers);
                return AlarmaDTO.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                log.debug("handleFrame ejecutado en {} con payloadType={}",
                        destinoAlarmaNueva,
                        payload != null ? payload.getClass().getName() : "null");
                if (payload instanceof AlarmaDTO alarmaDTO) {
                    alarmaWsProcessor.procesarNuevaAlarma(alarmaDTO, "ws-gateway");
                } else {
                    log.warn("Payload inesperado en {}: {}",
                            destinoAlarmaNueva,
                            payload != null ? payload.getClass().getName() : "null");
                }
            }
        });
        log.info("Suscrito a {}", destinoAlarmaNueva);
        session.subscribe(destinoAlarmaFinalizacion, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                log.debug("Suscripcion {} recibe headers {}", destinoAlarmaFinalizacion, headers);
                return AlarmaDTO.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                log.debug("handleFrame ejecutado en {} con payloadType={}",
                        destinoAlarmaFinalizacion,
                        payload != null ? payload.getClass().getName() : "null");
            }
        });
        log.info("Suscrito a {}", destinoAlarmaFinalizacion);

        session.subscribe(destinoAlertaUbicacion, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                log.debug("Suscripcion {} recibe headers {}", destinoAlertaUbicacion, headers);
                return UbicacionDTO.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                log.debug("handleFrame ejecutado en {} con payloadType={}",
                        destinoAlertaUbicacion,
                        payload != null ? payload.getClass().getName() : "null");
            }
        });
        log.info("Suscrito a {}", destinoAlertaUbicacion);


        
    }

}
