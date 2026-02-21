package com.secureon.appmovil.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.request.ContactoRequest;
import com.secureon.appmovil.dto.response.ContactoResponse;
import com.secureon.appmovil.model.entity.Contacto;
import com.secureon.appmovil.service.ContactoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/app-movil/v1/contacto")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    @PostMapping("/nuevo")
    public ResponseEntity<ContactoResponse> crearContacto(@RequestBody ContactoRequest request) {
        Contacto contacto = contactoService.crearContacto(request);
        ContactoResponse response = ContactoResponse.fromEntity(contacto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{contactoId}/editar")
    public ResponseEntity<Void> actualizarContacto(@PathVariable UUID contactoId,
                                                    @RequestBody ContactoRequest request) {
        contactoService.editarContacto(contactoId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{contactoId}/eliminar")
    public ResponseEntity<Void> eliminarContacto(@PathVariable UUID contactoId) {
        contactoService.eliminarContacto(contactoId);
        return ResponseEntity.ok().build();
    }
}
