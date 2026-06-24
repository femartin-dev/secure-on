package com.secureon.appmovil.service;

import java.time.OffsetDateTime;

import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.UbicacionRequest;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Ubicacion;
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
        ubicacion.setPosicion(getPuntoCoordenadasFromRequest(request));
        ubicacion.setAltura(request.getAltitud());
        ubicacion.setPrecision(request.getPrecision());
        ubicacion.setMetodoUbicacion(catalogoService.getMetodoUbicacion(request.getMetodoUbicacionId()));
        ubicacion.setBateriaNivel(request.getBateria());
        ubicacion.setVelocidad(request.getVelocidad());
        ubicacion.setRumbo(request.getRumbo());
        ubicacion.setFechaToma(request.getFecha() != null ? request.getFecha() : OffsetDateTime.now());
        return ubicacionRepository.save(ubicacion);
    }

    public Point getPuntoCoordenadasFromRequest(UbicacionRequest request) {
        return GeometryUtils.createPoint(request.getLongitud(), request.getLatitud());
    }

    public Ubicacion getUltimaUbicacion(Alarma alarma) {
        return ubicacionRepository.findByAlarmaIdOrderByFechaTomaDesc(alarma.getId()).stream().findFirst().orElse(null);
    }
}
