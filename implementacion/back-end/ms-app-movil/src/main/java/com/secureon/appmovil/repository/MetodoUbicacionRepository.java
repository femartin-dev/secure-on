package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Idioma;
import com.secureon.appmovil.model.entity.MetodoUbicacion;

@Repository
public interface MetodoUbicacionRepository extends JpaRepository<MetodoUbicacion, Integer> {
    Optional<MetodoUbicacion> findById(Integer id);

    Optional<Idioma> findByDescripcion(String id);

    List<MetodoUbicacion> findByHabilitadaTrue();
}
