package com.secureon.cdmcontrol.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.cdmcontrol.model.entity.Operador;
import com.secureon.cdmcontrol.repository.OperadorRepository;

import java.util.List;
import java.util.UUID;

@Service
public class OperadorService {

    @Autowired
    private OperadorRepository operadorRepository;

    public List<Operador> listarOperadoresActivos() {
        return operadorRepository.findOperadoresActivos();
    }

    public Operador obtenerPorId(UUID id) {
        return operadorRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(""));
    }

    public List<Operador> listarSupervisoresActivos() {
        return operadorRepository.findSupervisoresActivos();
    }

    public List<Operador>  listarPorSupervisor(Operador supervisor) {
        if (supervisor == null || !supervisor.getEsAdministrador())
            throw new RuntimeException("El operador tiene que ser supervisor administrador");
        return operadorRepository.findOperadoresPorSupervisor(supervisor);
    }
}
