package com.secureon.seguridad.service;

import com.secureon.seguridad.model.entity.Sesion;

@FunctionalInterface
public interface SesionInterface {
    void cerrarSesion(Sesion sesion);
}
