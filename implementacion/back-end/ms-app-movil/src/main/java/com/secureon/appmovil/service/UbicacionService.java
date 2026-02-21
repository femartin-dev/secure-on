package com.secureon.appmovil.service;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.UbicacionRequest;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.Ubicacion;
import com.secureon.appmovil.repository.UbicacionRepository;
import com.secureon.appmovil.util.GeometryUtils;

import jakarta.transaction.Transactional;

@Service
public class UbicacionService {
    @Autowired
    private UbicacionRepository ubicacionRepository;

    @Autowired
    private CatalogoService catalogoService;

    @Transactional
    public Ubicacion actualizarUbicacion(Alarma alarma, UbicacionRequest request) {
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setAlarma(alarma);
        ubicacion.setPosicion(GeometryUtils.createPoint(request.getLng(), request.getLat()));
        ubicacion.setPrecision(request.getPrecision());
        ubicacion.setMetodoUbicacion(catalogoService.getMetodoUbicacion(request.getMetodo()));
        ubicacion.setBateriaNivel(request.getBateria());
        ubicacion.setFechaToma(request.getFecha() != null ? request.getFecha() : OffsetDateTime.now());
        return ubicacionRepository.save(ubicacion);
    }
}
