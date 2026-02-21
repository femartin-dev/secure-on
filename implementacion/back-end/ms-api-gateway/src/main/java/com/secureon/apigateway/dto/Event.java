package com.secureon.apigateway.dto;

import java.time.Instant;

import lombok.Data;

@Data
public class Event {
    private String destination;
    private Object payload;
    private Instant timestamp = Instant.now();
}
