package vn.backend.core.config.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.backend.core.config.web.PrincipalRequestWrapper;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.exception.AppException;
import vn.backend.core.service.JWTService;

import java.io.IOException;
import java.security.Principal;
import vn.backend.core.util.HttpResponseUtils;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromRequest(request);

        try {
            if (token != null) {
                if (jwtService.isTokenExpired(token)) {
                    HttpResponseUtils.writeError(response, request, ErrorCode.TOKEN_EXPIRED);
                    return;
                }

                Principal principal = jwtService.extractPrincipal(token, request);
                if (principal != null) {
                    request = new PrincipalRequestWrapper(request, principal);
                }
            }

            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            HttpResponseUtils.writeError(response, request, ErrorCode.TOKEN_EXPIRED);
            return;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            HttpResponseUtils.writeError(response, request, ErrorCode.UNAUTHORIZED);
            return;
        } catch (AppException e) {
            HttpResponseUtils.writeError(response, request, e.getStatusCode(), e.getMessage());
            return;
        }
    }



    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

}
