package com.secureon.cdmcontrol.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.AlarmaOperador;
import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;
import com.secureon.cdmcontrol.model.entity.Operador;
import com.secureon.cdmcontrol.model.entity.PrioridadAlarma;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlarmaOperadorRepository extends JpaRepository<AlarmaOperador, UUID> {
        
        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.alarma = :alarma AND " +
                "((:operador IS NULL AND ao.operador IS NULL) OR ao.operador = :operador)")
        Optional<AlarmaOperador> findByAlarmaYOperador(@Param("alarma") Alarma alarma, @Param("operador") Operador operador);
        List<AlarmaOperador> findByAlarma(Alarma alarma);
        List<AlarmaOperador> findByOperadorIdAndFechaVerificacionIsNull(Operador operador);
        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.operador = :operador AND ao.estadoAsignacion.id " + 
                "NOT IN (1,5,6) AND ao.alarma.estadoAlarma.id = 1")
        List<AlarmaOperador> findAlarmasActivasByOperador(@Param("operador") Operador operador);

        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.operador.supervisor = :supervisor AND " + 
                "ao.estadoAsignacion.id NOT IN (5,6) AND ao.alarma.estadoAlarma.id = 1")
        List<AlarmaOperador> findAlarmasActivasBySupervisor(@Param("supervisor") Operador supervisor);

        @Query("SELECT ao FROM AlarmaOperador ao " + 
                "WHERE (:estado IS NULL OR ao.alarma.estadoAlarma = :estado) " + 
                "  AND (:prioridad IS NULL OR ao.alarma.prioridad = :prioridad) " + 
                "  AND (:fechaDesde IS NULL OR ao.alarma.fechaActivacion >= :fechaDesde) " + 
                "  AND (:fechaHasta IS NULL OR ao.alarma.fechaActivacion <= :fechaHasta) " + 
                "  AND (:operador IS NULL OR (ao.operador.esAdministrador = false " +
                "       AND ao.operador = :operador AND ao.estadoAsignacion.id NOT IN (1,5,6)) " + 
                "        OR (ao.operador.esAdministrador = true AND ao.estadoAsignacion.id NOT IN (5,6) )) " + 
                "  AND (:asignacion IS NULL OR ao.estadoAsignacion = :asignacion )")
        Page<AlarmaOperador> buscarConFiltros(@Param("estado") EstadoAlarma estado,
                                                @Param("prioridad") PrioridadAlarma prioridad,
                                                @Param("fechaDesde") OffsetDateTime fechaDesde,
                                                @Param("fechaHasta") OffsetDateTime fechaHasta,
                                                @Param("operador") Operador operador,
                                                @Param("asignacion") EstadoAsignacion asignacion,
                                                Pageable pageable);
}