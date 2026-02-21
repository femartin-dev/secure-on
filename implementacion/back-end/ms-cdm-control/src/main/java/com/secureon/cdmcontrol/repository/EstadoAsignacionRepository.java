package com.secureon.cdmcontrol.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;

@Repository
public interface EstadoAsignacionRepository extends JpaRepository<EstadoAsignacion, Integer>{
    Optional<EstadoAsignacion> findById(Integer id);

    Optional<EstadoAsignacion> findByDescripcion(String id);

    List<EstadoAsignacion> findByHabilitadaTrue();
}
