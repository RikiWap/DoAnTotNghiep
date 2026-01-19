package vn.backend.core.config.security.principal.impl;

import vn.backend.core.config.security.principal.Authentication;

import java.util.List;

public class SimpleAuthentication implements Authentication {
    private List<Integer> authorities;

    public SimpleAuthentication(List<Integer> authorities) {
        this.authorities = authorities;
    }

    @Override
    public List<Integer> getAuthorities() {
        return authorities;
    }
}
