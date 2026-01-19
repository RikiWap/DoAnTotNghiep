package vn.backend.core.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.backend.core.config.security.SimpleSecurityUser;
import java.security.Principal;
import vn.backend.core.config.security.principal.impl.SimpleAuthentication;
import vn.backend.core.config.security.principal.impl.SimplePrincipal;

import javax.crypto.SecretKey;

import jakarta.servlet.http.HttpServletRequest;
import vn.backend.core.util.CommonUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expired-in}")
    private Long expiresIn;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public Principal extractPrincipal(String token) {
        return extractPrincipal(token, null);
    }

    public Principal extractPrincipal(String token, HttpServletRequest request) {
        try {
            Claims body = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userString = (String) body.get("user");
            SimpleSecurityUser user = objectMapper.readValue(userString, SimpleSecurityUser.class);
            SimpleAuthentication authentication = new SimpleAuthentication(user.getRoles());

            Map<String, String> clientInfo = new HashMap<>();
            if (request != null) {
                clientInfo.put("User-Agent", request.getHeader("User-Agent"));
                clientInfo.put("X-Forwarded-For", request.getHeader("X-Forwarded-For"));
                clientInfo.put("X-Real-IP", request.getHeader("X-Real-IP"));
                clientInfo.put("Authorization", request.getHeader("Authorization"));
            }

            return SimplePrincipal.builder()
                    .authentication(authentication)
                    .otherInfo(user)
                    .id(user.getId())
                    .clientInfo(clientInfo)
                    .build();
        } catch (Exception e) {
            Map<String, String> clientInfo = new HashMap<>();
            if (request != null) {
                clientInfo.put("User-Agent", request.getHeader("User-Agent"));
                clientInfo.put("X-Forwarded-For", request.getHeader("X-Forwarded-For"));
                clientInfo.put("X-Real-IP", request.getHeader("X-Real-IP"));
            }
            return SimplePrincipal.builder()
                    .clientInfo(clientInfo)
                    .build();
        }
    }

    /**
     * Kiểm tra token đã hết hạn hay chưa
     *
     * @param token
     * @return
     */
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String generateJwt(SimpleSecurityUser securityUser) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("user", objectMapper.writeValueAsString(securityUser));

            return Jwts.builder()
                    .subject(securityUser.getId().toString())
                    .claims(claims)
                    .expiration(new Date(System.currentTimeMillis() + expiresIn))
                    .signWith(getSignInKey())
                    .compact();
        } catch (JsonProcessingException e) {
            System.out.println("error jwt =>" + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
