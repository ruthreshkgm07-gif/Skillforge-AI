package com.skillforge.common.exception;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {

    private final String errorCode;

    public AuthException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public static AuthException invalidCredentials() {
        return new AuthException("Invalid email or password", "AUTH_INVALID_CREDENTIALS");
    }

    public static AuthException userExists(String email) {
        return new AuthException("User with email " + email + " already exists", "AUTH_USER_ALREADY_EXISTS");
    }

    public static AuthException userNotFound() {
        return new AuthException("User account not found", "AUTH_USER_NOT_FOUND");
    }

    public static AuthException tokenExpired() {
        return new AuthException("Token has expired", "AUTH_TOKEN_EXPIRED");
    }

    public static AuthException tokenInvalid() {
        return new AuthException("Invalid authentication token", "AUTH_TOKEN_INVALID");
    }

    public static AuthException tooManyRequests() {
        return new AuthException("Too many authentication attempts. Please try again later.", "AUTH_TOO_MANY_REQUESTS");
    }

    public static AuthException tooManyRequests(String message) {
        return new AuthException(message, "AUTH_TOO_MANY_REQUESTS");
    }

    public static AuthException unverifiedEmail() {
        return new AuthException("Email is not verified. Please check your inbox.", "AUTH_EMAIL_UNVERIFIED");
    }
}
