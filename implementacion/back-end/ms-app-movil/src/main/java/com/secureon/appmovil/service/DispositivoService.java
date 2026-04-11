package com.secureon.appmovil.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.DispositivoRepository;


@Service
public class DispositivoService {

    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private MessagesService messagesService;


    public Dispositivo getDispositivo(UUID dispositivoId) {
        return dispositivoRepository.findById(dispositivoId)
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.dispositivo.not-found")));
    }

}

