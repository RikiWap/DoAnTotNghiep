package vn.backend.core.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.backend.core.constant.ErrorCode;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex, HttpServletRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("path", request.getRequestURI());
        body.put("message", ex.getMessage());
        body.put("code", ex.getStatusCode());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex, HttpServletRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("path", request.getRequestURI());
        body.put("message", "Lỗi hệ thống: " + ex.getMessage());
        body.put("code", 500);
        return ResponseEntity.status(500).body(body);
    }
}
