package com.secureon.cdmcontrol.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.PrioridadAlarma;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface AlarmaRepository extends JpaRepository<Alarma, UUID> {
    Page<Alarma> findByEstadoAlarma(EstadoAlarma estado, Pageable pageable);
    Page<Alarma> findByPrioridad(PrioridadAlarma prioridad, Pageable pageable);
    // Filtros combinados
    @Query("SELECT a FROM Alarma a WHERE " +
            "(:estado IS NULL OR a.estadoAlarma = :estado) AND " +
            "(:prioridad IS NULL OR a.prioridad = :prioridad) AND " +
            "(:fechaDesde IS NULL OR a.fechaActivacion >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR a.fechaActivacion <= :fechaHasta)")
    Page<Alarma> buscarConFiltros(@Param("estado") EstadoAlarma estado,
                                    @Param("prioridad") PrioridadAlarma prioridad,
                                    @Param("fechaDesde") OffsetDateTime fechaDesde,
                                    @Param("fechaHasta") OffsetDateTime fechaHasta,
                                    Pageable pageable);
    Optional<Alarma> findById(UUID alarmaId);
}
