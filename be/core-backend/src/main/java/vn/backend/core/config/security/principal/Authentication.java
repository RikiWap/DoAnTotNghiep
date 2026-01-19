package vn.backend.core.config.security.principal;

import java.util.List;

public interface Authentication {
    List<Integer> getAuthorities();
}
