package com.secureon.cdmcontrol.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.AlarmaOperador;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.EstadoAsignacion;
import com.secureon.common.model.entity.Operador;
import com.secureon.common.model.entity.PrioridadAlarma;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlarmaOperadorRepository extends JpaRepository<AlarmaOperador, UUID> {
        
        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.alarma.id = :alarma AND " +
                "((cast(:operador AS uuid) IS NULL AND ao.operador.id IS NULL) OR ao.operador.id = :operador)")
        Optional<AlarmaOperador> findByAlarmaYOperador(@Param("alarma") UUID alarmaId, @Param("operador") UUID operadorId);
        List<AlarmaOperador> findByAlarma(Alarma alarma);
        List<AlarmaOperador> findByOperadorIdAndFechaVerificacionIsNull(UUID operadorId);
        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.operador = :operador AND ao.estadoAsignacion.id " + 
                "NOT IN (1,5,6) AND ao.alarma.estadoAlarma.id = 1")
        List<AlarmaOperador> findAlarmasActivasByOperador(@Param("operador") Operador operador);

        @Query("SELECT ao FROM AlarmaOperador ao WHERE ao.operador.supervisor = :supervisor AND " + 
                "ao.estadoAsignacion.id NOT IN (5,6) AND ao.alarma.estadoAlarma.id = 1")
        List<AlarmaOperador> findAlarmasActivasBySupervisor(@Param("supervisor") Operador supervisor);

        /*@Query("SELECT ao FROM AlarmaOperador ao " + 
                "WHERE (cast(:estado AS integer) IS NULL OR ao.alarma.estadoAlarma.id = :estado) " +
                "  AND (cast(:prioridad AS integer) IS NULL OR ao.alarma.prioridad.id = :prioridad) " + 
                "  AND (cast(:fechaDesde AS timestamp) IS NULL OR ao.alarma.fechaActivacion >= :fechaDesde) " + 
                "  AND (cast(:fechaHasta AS timestamp) IS NULL OR ao.alarma.fechaActivacion <= :fechaHasta) " + 
                "  AND (cast(:operador AS uuid) IS NULL OR (ao.operador.esAdministrador = false " +
                "       AND ao.operador.id = :operador AND ao.estadoAsignacion.id NOT IN (1,5,6)) " + 
                "        OR (ao.operador.esAdministrador = true AND ao.estadoAsignacion.id NOT IN (5,6) )) " + 
                "  AND (cast(:asignacion AS integer) IS NULL OR ao.estadoAsignacion.id = :asignacion )")*/
        @Query("""
        SELECT ao FROM AlarmaOperador ao
        JOIN ao.alarma a
        JOIN ao.operador o
        WHERE (cast(:estado AS integer) IS NULL OR a.estadoAlarma.id = :estado)
        AND (cast(:prioridad AS integer) IS NULL OR a.prioridad.id = :prioridad)
        AND (cast(:fechaDesde AS timestamp) IS NULL OR a.fechaActivacion >= :fechaDesde)
        AND (cast(:fechaHasta AS timestamp) IS NULL OR a.fechaActivacion <= :fechaHasta)
        AND (cast(:operador AS uuid) IS NULL OR 
                (o.esAdministrador = false AND o.id = :operador AND ao.estadoAsignacion.id NOT IN (1,5,6))
                OR
                (o.esAdministrador = true AND ao.estadoAsignacion.id NOT IN (5,6)))
        AND (cast(:asignacion AS integer) IS NULL OR ao.estadoAsignacion.id = :asignacion)
        """)
        Page<AlarmaOperador> buscarConFiltros(@Param("estado") Integer estado,
                                                @Param("prioridad") Integer prioridad,
                                                @Param("fechaDesde") OffsetDateTime fechaDesde,
                                                @Param("fechaHasta") OffsetDateTime fechaHasta,
                                                @Param("operador") UUID operador,
                                                @Param("asignacion") Integer asignacion,
                                                Pageable pageable);
}