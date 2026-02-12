package com.securitasgroup.secureon.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securitasgroup.secureon.model.entity.Dispositivo;
import com.securitasgroup.secureon.model.entity.Usuario;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, UUID> {
    Optional<Dispositivo> findByUsuarioAndDispositivoAppId(Usuario usuario, UUID dispositivoAppId);
    List<Dispositivo> findByUsuario(Usuario usuario);
    List<Dispositivo> findByUsuarioAndEstaActivoTrue(Usuario usuario);
}
