package com.secureon.cdmcontrol.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private Long expirationMs;

    public String getSecret() {
        return secret;
    }

    public Long getExpirationMs() {
        return expirationMs;
    }
}
