package com.secureon.appmovil.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.UsuarioRepository;


@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MessagesService messagesService;

    public Usuario getUsuario(UUID userId) {
        return usuarioRepository.findById(userId)
            .orElseThrow(()-> new RuntimeException(messagesService.getMessage("error.usuario.not-found")));
    }

}
