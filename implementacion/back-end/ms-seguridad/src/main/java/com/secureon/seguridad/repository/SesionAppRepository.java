package com.secureon.seguridad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.model.entity.SesionApp;
import com.secureon.common.model.entity.Usuario;

@Repository
public interface SesionAppRepository extends JpaRepository<SesionApp, UUID> {
    Optional<SesionApp> findBySesionTokenRestablecimiento(String token);
    Optional<SesionApp> findBySesion(Sesion sesion);
    void deleteByUsuarioAndDispositivo(Usuario usuario, Dispositivo dispositivo);
    void deleteBySesion(Sesion sesion);
}