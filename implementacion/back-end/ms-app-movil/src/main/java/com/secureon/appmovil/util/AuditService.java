package com.secureon.appmovil.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void setAuditContext(String usuario, String ip) {
        jdbcTemplate.update("CALL secure_on_utils.set_audit_context(?, ?)",usuario, ip);
    }

    public void clearAuditContext() {
        jdbcTemplate.execute("CALL secure_on_utils.clear_audit_context()");
    }
}
