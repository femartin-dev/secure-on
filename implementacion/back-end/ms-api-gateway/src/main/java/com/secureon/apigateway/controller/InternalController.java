package com.secureon.apigateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.apigateway.service.PublisherService;
import com.secureon.common.dto.EventoDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ws/internal")
@RequiredArgsConstructor
public class InternalController {

    private final PublisherService service;

    @PostMapping("/enviar")
    public ResponseEntity<Void> emitir(@RequestBody EventoDTO event) {
        service.sendToDestination(event.getDestino(), event.getPayload());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/enviar/{user}")
    public ResponseEntity<Void> emitirUsuario( @PathVariable String user,
                                                @RequestBody EventoDTO event) {
        service.sendToUser(user, event.getDestino(), event.getPayload());
        return ResponseEntity.ok().build();
    }
    
}