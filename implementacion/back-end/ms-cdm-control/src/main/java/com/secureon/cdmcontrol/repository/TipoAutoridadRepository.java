package com.secureon.cdmcontrol.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.secureon.cdmcontrol.model.entity.TipoAutoridad;

@Repository
public interface TipoAutoridadRepository extends JpaRepository<TipoAutoridad, Integer>{
    Optional<TipoAutoridad> findById(Integer id);
    Optional<TipoAutoridad> findByDescripcion(String id);
    List<TipoAutoridad> findByHabilitadaTrue();
}