package com.secureon.seguridad.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.seguridad.model.entity.Dispositivo;
import com.secureon.seguridad.model.entity.Usuario;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, UUID> {
    Optional<Dispositivo> findByUsuarioAndDispositivoAppId(Usuario usuario, UUID dispositivoAppId);
    Optional<Dispositivo> findByUsuarioAndNumero(Usuario usuario, String numero);
    List<Dispositivo> findByUsuario(Usuario usuario);
    List<Dispositivo> findByUsuarioAndEstaActivoTrue(Usuario usuario);
}
