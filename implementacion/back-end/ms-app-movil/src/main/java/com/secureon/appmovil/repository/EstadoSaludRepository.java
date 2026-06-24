package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.EstadoSalud;


@Repository
public interface EstadoSaludRepository extends JpaRepository<EstadoSalud, Integer> {
    Optional<EstadoSalud> findById(Integer id);
    Optional<EstadoSalud> findByDescripcion(String descripcion);
    List<EstadoSalud> findByHabilitadaTrue();

}
