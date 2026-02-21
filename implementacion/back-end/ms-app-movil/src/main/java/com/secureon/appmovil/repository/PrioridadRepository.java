package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.PrioridadAlarma;

@Repository
public interface PrioridadRepository extends JpaRepository<PrioridadAlarma, Integer> {
    Optional<PrioridadAlarma> findById(Integer id);

    Optional<PrioridadAlarma> findByDescripcion(String id);

    List<PrioridadAlarma> findByHabilitadaTrue();
}
