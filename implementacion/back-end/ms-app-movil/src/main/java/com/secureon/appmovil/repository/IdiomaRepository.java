package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Idioma;

@Repository
public interface IdiomaRepository extends JpaRepository<Idioma, String> {
    Optional<Idioma> findById(String id);

    Optional<Idioma> findByDescripcion(String id);

    List<Idioma> findByHabilitadaTrue();
}