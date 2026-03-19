package com.secureon.cdmcontrol.service;

import java.lang.reflect.Type;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import com.secureon.cdmcontrol.dto.messages.AlarmaDTO;
import com.secureon.cdmcontrol.property.DestinoWSEnum;

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

    @Value("${ws-gateway.server-urls.http}${ws-gateway.endpoints}")
    private String wsGatewayUrl;

    @Value("${ws-gateway.auth-token:}")
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
        String destinoAlarmaNueva = DestinoWSEnum.TOPIC_ALARMA_NUEVA.getPath();
        if (!StringUtils.hasText(destinoAlarmaNueva)) {
            log.warn("Destino TOPIC_ALARMA_NUEVA no configurado");
            return;
        }

        session.subscribe(destinoAlarmaNueva, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return AlarmaDTO.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                if (payload instanceof AlarmaDTO alarmaDTO) {
                    alarmaWsProcessor.procesarNueva(alarmaDTO, "ws-gateway");
                } else {
                    log.warn("Payload inesperado en {}: {}",
                            destinoAlarmaNueva,
                            payload != null ? payload.getClass().getName() : "null");
                }
            }
        });

        log.info("Suscrito a {}", destinoAlarmaNueva);
    }
}
