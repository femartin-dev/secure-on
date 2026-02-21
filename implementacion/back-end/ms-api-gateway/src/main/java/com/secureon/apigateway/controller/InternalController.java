package com.secureon.apigateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.apigateway.dto.Event;
import com.secureon.apigateway.service.PublisherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ws/internal")
@RequiredArgsConstructor
public class InternalController {

    private final PublisherService service;

    @PostMapping("/enviar")
    public ResponseEntity<Void> emitir(@RequestBody Event event) {
        service.sendToDestination(event.getDestination(), event.getPayload());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/enviar/{user}")
    public ResponseEntity<Void> emitirUsuario( @PathVariable String user,
                                                @RequestBody Event event) {
        service.sendToUser(user, event.getDestination(), event.getPayload());
        return ResponseEntity.ok().build();
    }
    
}