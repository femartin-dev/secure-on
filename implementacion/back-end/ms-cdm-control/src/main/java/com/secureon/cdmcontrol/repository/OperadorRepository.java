package com.secureon.cdmcontrol.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.secureon.cdmcontrol.model.entity.Operador;


@Repository
public interface OperadorRepository extends JpaRepository<Operador, UUID> {
    @Query("SELECT o FROM Operador o WHERE o.email = :username")
    Optional<Operador> findByEmail(@Param("username") String username);
    Optional<Operador> findById(UUID id);
    @Query("SELECT o FROM Operador o WHERE o.estaActivo = true AND esAdministrador = false")
    List<Operador> findOperadoresActivos();
    @Query("SELECT o FROM Operador o WHERE o.supervisor = :supervisor AND o.estaActivo = true AND esAdministrador = false")
    List<Operador> findOperadoresPorSupervisor(@Param("supervisor") Operador supervisor);
    @Query("SELECT o FROM Operador o WHERE o.estaActivo = true AND esAdministrador = true")
    List<Operador> findSupervisoresActivos();

}