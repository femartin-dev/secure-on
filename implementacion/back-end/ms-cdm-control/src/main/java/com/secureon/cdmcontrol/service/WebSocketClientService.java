package com.secureon.cdmcontrol.service;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import com.secureon.cdmcontrol.dto.response.AlarmaResponse;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@EnableScheduling
public class WebSocketClientService {

    private final WebSocketStompClient stompClient;
    private final String gatewayUrl;
    private StompSession session;
    private final BlockingQueue<Object> pendingMessages = new LinkedBlockingQueue<>();

    public WebSocketClientService(WebSocketStompClient stompClient, 
                                @Value("${app.api-gateway.url}")String gatewayUrl) {
        this.stompClient = stompClient;
        this.gatewayUrl = gatewayUrl;
    }

    @PostConstruct
    public void connect() {
        try {
            StompSessionHandler sessionHandler = new StompSessionHandlerAdapter() {
                @Override
                public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                    log.info("Conectado a ms-ws-gateway en {}", gatewayUrl);
                    WebSocketClientService.this.session = session;
                    // Enviar mensajes pendientes
                    while (!pendingMessages.isEmpty()) {
                        Object msg = pendingMessages.poll();
                        if (msg != null) {
                            enviarAlarmaAlWS(msg);
                        }
                    }
                }

                @Override
                public void handleTransportError(StompSession session, Throwable exception) {
                    log.error("Error de transporte WebSocket", exception);
                    WebSocketClientService.this.session = null;
                }

                @Override
                public void handleFrame(StompHeaders headers, Object payload) {
                    // No necesitamos recibir nada del gateway
                }
            };

            // Conectar de forma asíncrona
            stompClient.connectAsync(gatewayUrl, sessionHandler);
        } catch (Exception e) {
            log.error("Error al conectar con ms-api-gateway", e);
        }
    }

    @PreDestroy
    public void disconnect() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }

    public void enviarAlarma(Object alarma) {
        if (session != null && session.isConnected()) {
            enviarAlarmaAlWS(alarma);
        } else {
            log.warn("Sin conexión al gateway, encolando mensaje");
            pendingMessages.offer(alarma);
        }
    }

    private void enviarAlarmaAlWS(Object alarma) {
        try {
            session.send("/topic/alertas", alarma);
            log.debug("Alerta enviada al ws gateway: {}");
        } catch (Exception e) {
            log.error("Error al enviar alerta al ws gateway", e);
            pendingMessages.offer(alarma);
        }
    }

    // Reintentar conexión periódicamente si está caída
    @Scheduled(fixedDelay = 30000)
    public void reconnectIfNeeded() {
        if (session == null || !session.isConnected()) {
            log.info("Reintentando conexión con ms-api-gateway...");
            connect();
        }
    }
}