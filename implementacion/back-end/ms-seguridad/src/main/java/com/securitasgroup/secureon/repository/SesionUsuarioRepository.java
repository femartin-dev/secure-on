package com.securitasgroup.secureon.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securitasgroup.secureon.model.entity.Dispositivo;
import com.securitasgroup.secureon.model.entity.Sesion;
import com.securitasgroup.secureon.model.entity.SesionUsuario;
import com.securitasgroup.secureon.model.entity.Usuario;

@Repository
public interface SesionUsuarioRepository extends JpaRepository<SesionUsuario, UUID> {
    Optional<SesionUsuario> findBySesionTokenRestablecimiento(String token);
    void deleteByUsuarioAndDispositivo(Usuario usuario, Dispositivo dispositivo);
    void deleteBySesion(Sesion sesion);
}