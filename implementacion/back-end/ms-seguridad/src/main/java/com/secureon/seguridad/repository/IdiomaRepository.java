package com.secureon.seguridad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secureon.common.model.entity.Idioma;

public interface IdiomaRepository extends JpaRepository<Idioma, String> {
    Optional<Idioma> findById(String idiomaId);
    
}
