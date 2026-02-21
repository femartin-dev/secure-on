package com.secureon.appmovil.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.model.entity.Dispositivo;
import com.secureon.appmovil.model.entity.Usuario;

import java.util.Optional;


@Repository
public interface ConfiguracionRepository extends JpaRepository<ConfiguracionUsuario, UUID> {
    Optional<ConfiguracionUsuario> findByUsuarioAndDispositivo(Usuario usuario, Dispositivo dispositivo);

}
