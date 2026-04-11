package com.secureon.cdmcontrol.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Operador;
import com.secureon.common.util.MessagesService;
import com.secureon.cdmcontrol.repository.OperadorRepository;

import java.util.List;
import java.util.UUID;

@Service
public class OperadorService {

    @Autowired
    private OperadorRepository operadorRepository;
    
    @Autowired
    private MessagesService messagesService;

    public List<Operador> listarOperadoresActivos() {
        return operadorRepository.findOperadoresActivos();
    }

    public Operador obtenerPorId(UUID id) {
        return operadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.operador.not-found")));
    }

    public List<Operador> listarSupervisoresActivos() {
        return operadorRepository.findSupervisoresActivos();
    }

    public List<Operador>  listarPorSupervisor(Operador supervisor) {
        if (supervisor == null)
            throw new RuntimeException(messagesService.getMessage("error.supervisor.not-found"));
        return operadorRepository.findOperadoresPorSupervisor(supervisor);
    }
}
