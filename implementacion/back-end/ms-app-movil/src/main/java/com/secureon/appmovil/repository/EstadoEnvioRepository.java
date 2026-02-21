package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.EstadoEnvio;

@Repository
public interface EstadoEnvioRepository extends JpaRepository<EstadoEnvio, Integer> {
    Optional<EstadoEnvio> findById(Integer id);

    Optional<EstadoEnvio> findByDescripcion(String id);

    List<EstadoEnvio> findByHabilitadaTrue();
}
