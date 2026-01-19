package vn.backend.core.config.security.principal.impl;

import lombok.Builder;
import lombok.Data;
import vn.backend.core.config.security.principal.Authentication;

import java.security.Principal;
import java.util.Map;

@Data
@Builder
public class SimplePrincipal implements Principal {
    private Authentication authentication;
    private Object otherInfo;
    private Object id;
    private Map<String, String> clientInfo;

    @Override
    public String getName() {
        return id != null ? id.toString() : null;
    }

    public Authentication getAuthentication() {
        return authentication;
    }

    public Object otherInfo() {
        return otherInfo;
    }

    public Object id() {
        return id;
    }
}
