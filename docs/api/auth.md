# SkillForge AI — Authentication & Security API Reference

This document outlines the REST API endpoints for authentication, registration, session management, token refresh, and password recovery in **SkillForge AI**.

---

## Base Path
```text
/api/v1/auth
```

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new Student or Recruiter account | Public | No |
| `GET` | `/auth/verify-email` | Verify email address using token | Public | No |
| `POST` | `/auth/login` | Authenticate user & return JWT tokens | Public | Yes (5 attempts / 15m) |
| `POST` | `/auth/refresh-token` | Obtain new Access Token using Refresh Token | Public | No |
| `POST` | `/auth/logout` | Revoke Refresh Token & end session | Public | No |
| `POST` | `/auth/forgot-password` | Request password reset email | Public | Yes (3 attempts / 15m) |
| `POST` | `/auth/reset-password` | Set new password using reset token | Public | No |
| `GET` | `/auth/me` | Fetch authenticated user profile summary | Bearer Token | No |

---

## Endpoint Details & Payload Specs

### 1. Register User
`POST /auth/register`

#### Request Payload
```json
{
  "email": "alex.student@example.com",
  "password": "Password123!",
  "fullName": "Alex Student",
  "role": "STUDENT",
  "targetRole": "Full Stack Engineer"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "User registered successfully. Verification email sent.",
  "data": {
    "id": "c1f7a4b2-9d3e-4f81-a67b-123456789abc",
    "email": "alex.student@example.com",
    "fullName": "Alex Student",
    "role": "STUDENT",
    "isVerified": false
  },
  "timestamp": "2026-08-07T21:05:00.000Z"
}
```

---

### 2. Login
`POST /auth/login`

#### Request Payload
```json
{
  "email": "alex.student@example.com",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": "c1f7a4b2-9d3e-4f81-a67b-123456789abc",
      "email": "alex.student@example.com",
      "fullName": "Alex Student",
      "role": "STUDENT",
      "isVerified": true
    }
  },
  "timestamp": "2026-08-07T21:05:10.000Z"
}
```

---

### 3. Refresh Token
`POST /auth/refresh-token`

#### Request Payload
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": { ... }
  },
  "timestamp": "2026-08-07T21:05:20.000Z"
}
```

---

## Standard Error Response & Codes

When an error occurs, the server responds with a consistent envelope and structured error code:

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": {
    "errorCode": "AUTH_INVALID_CREDENTIALS"
  },
  "timestamp": "2026-08-07T21:05:30.000Z"
}
```

### Error Code Reference
* `AUTH_INVALID_CREDENTIALS`: Email or password incorrect.
* `AUTH_USER_ALREADY_EXISTS`: Registration email already registered.
* `AUTH_USER_NOT_FOUND`: Account does not exist.
* `AUTH_TOKEN_EXPIRED`: JWT Access Token expired.
* `AUTH_TOKEN_INVALID`: JWT structure, signature, or token store mismatch.
* `AUTH_TOO_MANY_REQUESTS`: Rate limit exceeded on login/reset endpoint.
* `AUTH_EMAIL_UNVERIFIED`: Email verification pending.
