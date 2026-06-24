package com.secureon.cdmcontrol.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Evidencia;

@Repository
public interface EvidenciaRepository extends JpaRepository<Evidencia, UUID>{
    Optional<Evidencia> findById(UUID id);

    List<Evidencia> findByAlarma(Alarma alarma);
}
