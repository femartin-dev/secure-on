package com.securitasgroup.secureon.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.securitasgroup.secureon.dto.request.DeviceRegistrationRequest;
import com.securitasgroup.secureon.exeptions.BadRequestException;
import com.securitasgroup.secureon.exeptions.ResourceNotFoundException;
import com.securitasgroup.secureon.model.entity.Dispositivo;
import com.securitasgroup.secureon.model.entity.Usuario;
import com.securitasgroup.secureon.repository.DispositivoRepository;
import com.securitasgroup.secureon.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class DispositivoService {
    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Dispositivo registrarDispositivo(DeviceRegistrationRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
            .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));
        Optional<Dispositivo> existente = dispositivoRepository
            .findByUsuarioAndDispositivoAppId(usuario, request.getDispositivoAppId());
        
        if (existente.isPresent()) {
            Dispositivo dispositivo = existente.get();
            // Actualizar datos del dispositivo
            dispositivo.setNumero(request.getNumero());
            dispositivo.setFabricante(request.getFabricante());
            dispositivo.setModelo(request.getModelo());
            dispositivo.setPlataforma(request.getPlataforma());
            dispositivo.setSistemaOperativo(request.getSistemaOperativo());
            dispositivo.setVersionDelSO(request.getVersionDelSO());
            dispositivo.setZonaHoraria(request.getZonaHoraria());
            dispositivo.setIdiomaId(request.getIdiomaId());
            dispositivo.setEsPrincipal(request.getEsPrincipal());
            dispositivo.setEstaActivo(true);
            return dispositivoRepository.save(dispositivo);
        } else {
            boolean esPrincipal = dispositivoRepository.findByUsuarioAndEstaActivoTrue(usuario).stream().count() == 0;
            Dispositivo nuevo = new Dispositivo();
            nuevo.setUsuario(usuario);
            nuevo.setDispositivoAppId(request.getDispositivoAppId());
            nuevo.setNumero(request.getNumero());
            nuevo.setFabricante(request.getFabricante());
            nuevo.setModelo(request.getModelo());
            nuevo.setPlataforma(request.getPlataforma());
            nuevo.setSistemaOperativo(request.getSistemaOperativo());
            nuevo.setVersionDelSO(request.getVersionDelSO());
            nuevo.setZonaHoraria(request.getZonaHoraria());
            nuevo.setIdiomaId(request.getIdiomaId());
            nuevo.setEsPrincipal(esPrincipal); // Se puede marcar como principal si es el primero
            return dispositivoRepository.save(nuevo);
        }
    }

    public Dispositivo obtenerDispositivoPorAppId(Usuario usuario, UUID dispositivoAppId) {
        return dispositivoRepository.findByUsuarioAndDispositivoAppId(usuario, dispositivoAppId)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo encontrar el dispositivo para el usuario"));
    }

    public Dispositivo obtenerDispositivoPorNumero(Usuario usuario, String nroTelefono) {
        return dispositivoRepository.findByUsuarioAndNumero(usuario, nroTelefono)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo encontrar el dispositivo para el usuario"));
    }
}
