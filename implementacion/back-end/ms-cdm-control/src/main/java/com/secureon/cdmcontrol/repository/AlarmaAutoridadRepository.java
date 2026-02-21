package com.secureon.cdmcontrol.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.cdmcontrol.model.entity.AlarmaAutoridad;

@Repository
public interface AlarmaAutoridadRepository extends JpaRepository<AlarmaAutoridad, UUID>{

}


