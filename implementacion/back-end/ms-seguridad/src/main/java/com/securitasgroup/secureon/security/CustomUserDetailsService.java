package com.securitasgroup.secureon.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.securitasgroup.secureon.model.entity.OperadorCdm;
import com.securitasgroup.secureon.model.entity.Usuario;
import com.securitasgroup.secureon.repository.OperadorCdmRepository;
import com.securitasgroup.secureon.repository.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private OperadorCdmRepository operadorRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Primero intentamos como usuario móvil
        Usuario usuario = usuarioRepository.findByEmail(username).orElse(null);
        if (usuario != null) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            return new User(usuario.getEmail(), usuario.getHashContrasena(), authorities);
        }

        // Luego como operador CdM
        OperadorCdm operador = operadorRepository.findByEmail(username).orElse(null);
        if (operador != null) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            String role = operador.getEsAdministrador() ? "ROLE_ADMIN_CDM" : "ROLE_OPERATOR_CDM";
            authorities.add(new SimpleGrantedAuthority(role));
            return new User(operador.getEmail(), operador.getHashContrasena(), authorities);
        }

        throw new UsernameNotFoundException("Usuario no encontrado con email: " + username);
    }
}
