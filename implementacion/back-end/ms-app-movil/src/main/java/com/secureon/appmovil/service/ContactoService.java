package com.secureon.appmovil.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.ContactoRequest;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Contacto;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.ContactoRepository;

@Service
public class ContactoService {
    @Autowired
    private ContactoRepository contactoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private MessagesService messagesService;

    public Contacto getContacto(UUID contactoId) {
        return contactoRepository.findById(contactoId)
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.contacto.not-found")));
    }

    public List<Contacto> getContactosUsuario(UUID usuarioId) {
        Usuario usuario = usuarioService.getUsuario(usuarioId);
        return contactoRepository.findByUsuario(usuario);
    }

    private Contacto guardarContacto(UUID contactoId, ContactoRequest request) {
        Contacto contacto;
        if (contactoId == null) {
            contacto = new Contacto();
            Usuario user = usuarioService.getUsuario(request.getUserId());
            contacto.setUsuario(user);
        } else {
            contacto = contactoRepository.findById(contactoId)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.contacto.not-found")));
            if (contacto.getUsuario() == null || !contacto.getUsuario().getId().equals(request.getUserId())) {
                throw new ResourceNotFoundException(messagesService.getMessage("error.contacto.not-found"));
            } 
        }
        Usuario user = usuarioService.getUsuario(request.getUserId());
        contacto.setUsuario(user);
        contacto.setNombre(request.getNombre());
        contacto.setTelefono(request.getTelefono());
        contacto.setRelacion(request.getRelacion());
        contacto.setCanalNotificacion(catalogoService.getCanalNotificacion(request.getCanalId()));
        contacto.setEsPrincipal(request.getEsPrincipal());
        return contactoRepository.save(contacto);
    }

    public Contacto crearContacto(ContactoRequest request) {
        return guardarContacto(null, request);
    }

    public Contacto editarContacto(UUID contactoId, ContactoRequest request) {
        return guardarContacto(contactoId, request);
    }

    public void eliminarContacto(UUID contactoId) {
        if (!contactoRepository.existsById(contactoId))
            throw new ResourceNotFoundException(messagesService.getMessage("error.contacto.not-found"));
        contactoRepository.deleteById(contactoId);
    }

}
