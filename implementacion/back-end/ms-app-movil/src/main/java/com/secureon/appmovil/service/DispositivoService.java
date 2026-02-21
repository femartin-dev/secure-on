package com.secureon.appmovil.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.model.entity.Dispositivo;
import com.secureon.appmovil.repository.DispositivoRepository;


@Service
public class DispositivoService {

    @Autowired
    private DispositivoRepository dispositivoRepository;

    public Dispositivo getDispositivo(UUID dispositivoId) {
        return dispositivoRepository.findById(dispositivoId)
            .orElseThrow(()-> new RuntimeException("Dispositivo no encontrado"));
    }

}

