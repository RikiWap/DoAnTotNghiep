package vn.backend.entity.data.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenResponse {
    private String token;

    public TokenResponse() {
    }

    public TokenResponse(String token) {
        this.token = token;
    }
}