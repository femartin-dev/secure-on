package com.secureon.seguridad.security;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.secureon.common.model.entity.Operador;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.repository.OperadorRepository;
import com.secureon.seguridad.repository.UsuarioRepository;
import com.secureon.seguridad.util.RolesProperties;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private OperadorRepository operadorRepository;

    @Autowired
    private MessagesService messageService;

    @Autowired
    private RolesProperties rolesProps;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // normalize/sanitize input same way as authentication service
        if (username != null) {
            username = username.trim();
            username = Normalizer.normalize(username, Normalizer.Form.NFC);
        }

        // Primero intentamos como usuario móvil
        Usuario usuario = usuarioRepository.findById(username != null && username.matches(messageService.getMessage("pattern.uuid")) ? UUID.fromString(username) : UUID.fromString(messageService.getMessage("mock.uuid"))).orElse(
                        usuarioRepository.findByEmail(username).orElse( 
                        usuarioRepository.findByTelefono(username).orElse(null) ));
        if (usuario != null) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(rolesProps.getRolUsuario()));
            return new User(usuario.getId().toString(), usuario.getHashContrasena(), authorities);
        }

        // Luego como operador CdM
        Operador operador = operadorRepository.findById(username != null && username.matches(messageService.getMessage("pattern.uuid")) ? UUID.fromString(username) : UUID.fromString(messageService.getMessage("mock.uuid"))).orElse(
                            operadorRepository.findByEmail(username).orElse(
                            operadorRepository.findByLegajo(username != null && username.matches(messageService.getMessage("pattern.only-numbers")) ? Integer.valueOf(username) : null).orElse(null) ));
        
        if (operador != null) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            String role = operador.getEsAdministrador() ? rolesProps.getRolAdministrador(): rolesProps.getRolOperador();
            authorities.add(new SimpleGrantedAuthority(role));
            return new User(operador.getId().toString(), operador.getHashContrasena(), authorities);
        }

        throw new UsernameNotFoundException(messageService.getMessage("err.usr.not-found.email", username));
    }
}
