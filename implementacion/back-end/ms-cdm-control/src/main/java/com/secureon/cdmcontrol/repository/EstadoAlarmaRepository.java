package com.secureon.cdmcontrol.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.cdmcontrol.model.entity.EstadoAlarma;

@Repository
public interface EstadoAlarmaRepository extends JpaRepository<EstadoAlarma, Integer>{
    Optional<EstadoAlarma> findById(Integer id);

    Optional<EstadoAlarma> findByDescripcion(String id);

    List<EstadoAlarma> findByHabilitadaTrue();
}
