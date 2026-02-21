package com.secureon.apigateway.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.secureon.apigateway.security.WebSocketAuthInterceptor;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;
    private final String[] brokers;
    private final String appPrefix;
    private final String userPrefix;
    private final String wsEndpoint;

    public WebSocketConfig(WebSocketAuthInterceptor webSocketAuthInterceptor,
                        @Value("${ws-gateway.config.enabled-brokers}") String brokers,
                        @Value("${ws-gateway.config.app-destination}") String appPrefix,
                        @Value("${ws-gateway.config.user-destination}") String userPrefix,
                        @Value("${ws-gateway.config.endpoint-ws}") String wsEndpoint ) {
        this.webSocketAuthInterceptor = webSocketAuthInterceptor;
        this.brokers = brokers.split(",");
        this.appPrefix = appPrefix;
        this.userPrefix = userPrefix;
        this.wsEndpoint = wsEndpoint;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker(brokers);
        config.setApplicationDestinationPrefixes(appPrefix);
        config.setUserDestinationPrefix(userPrefix);

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(wsEndpoint)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
