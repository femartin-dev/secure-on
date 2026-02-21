package com.secureon.seguridad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.seguridad.model.entity.Dispositivo;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.model.entity.SesionApp;
import com.secureon.seguridad.model.entity.Usuario;

@Repository
public interface SesionAppRepository extends JpaRepository<SesionApp, UUID> {
    Optional<SesionApp> findBySesionTokenRestablecimiento(String token);
    void deleteByUsuarioAndDispositivo(Usuario usuario, Dispositivo dispositivo);
    void deleteBySesion(Sesion sesion);
}