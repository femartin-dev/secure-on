package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.TipoEvidencia;

@Repository
public interface TipoEvidenciaRepository extends JpaRepository<TipoEvidencia, Integer> {
    Optional<TipoEvidencia> findById(Integer id);
    List<TipoEvidencia> findByHabilitadaTrue();

}
