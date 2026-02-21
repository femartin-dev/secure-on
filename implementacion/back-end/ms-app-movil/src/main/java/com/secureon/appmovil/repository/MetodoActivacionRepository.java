package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Idioma;
import com.secureon.appmovil.model.entity.MetodoActivacion;

@Repository
public interface MetodoActivacionRepository extends JpaRepository<MetodoActivacion, Integer> {
    Optional<MetodoActivacion> findById(Integer id);

    Optional<Idioma> findByDescripcion(String id);

    List<MetodoActivacion> findByHabilitadaTrue();
}