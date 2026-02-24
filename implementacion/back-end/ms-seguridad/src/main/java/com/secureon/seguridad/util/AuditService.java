package com.secureon.seguridad.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${app.audit.enabled:true}")
    private boolean auditEnabled;

    public void setAuditContext(String usuario, String ip) {
        if (!auditEnabled) {
            return;
        }
        jdbcTemplate.update("CALL secure_on_utils.set_audit_context(?, ?)",usuario, ip);
    }

    public void clearAuditContext() {
        if (!auditEnabled) {
            return;
        }
        jdbcTemplate.execute("CALL secure_on_utils.clear_audit_context()");
    }
}
