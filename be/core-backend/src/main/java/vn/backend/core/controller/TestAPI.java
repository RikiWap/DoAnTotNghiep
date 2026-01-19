package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.security.SimpleSecurityUser;
import java.security.Principal;
import vn.backend.core.service.JWTService;
import vn.backend.core.util.SecurityUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test1")
public class TestAPI {

    @Autowired
    private JWTService jwtService;

    /**
     * Endpoint để tạo JWT token (login)
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(Principal principal) {
        String jwt = SecurityUtils.getJwt(principal);
        // Tạo SimpleSecurityUser từ thông tin login
        SimpleSecurityUser user = SimpleSecurityUser.builder()
                .id(1)
                .fullName("Test User")
                .phone("0123456789")
                .active(true)
                .build();

        // Tạo JWT token
        String token = jwtService.generateJwt(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        
        return ResponseEntity.ok(response);
    }
}
