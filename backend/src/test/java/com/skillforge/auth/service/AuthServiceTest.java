package com.skillforge.auth.service;

import com.skillforge.auth.dto.AuthResponse;
import com.skillforge.auth.dto.LoginRequest;
import com.skillforge.auth.dto.RegisterRequest;
import com.skillforge.auth.dto.UserSummaryDto;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.auth.security.JwtTokenProvider;
import com.skillforge.common.exception.AuthException;
import com.skillforge.common.service.RateLimiterService;
import com.skillforge.student.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .email("student@skillforge.ai")
                .passwordHash("hashed_secret_password")
                .role(User.Role.STUDENT)
                .isVerified(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register new student candidate")
    void shouldRegisterNewStudent() {
        RegisterRequest request = RegisterRequest.builder()
                .email("newstudent@skillforge.ai")
                .password("Password@123")
                .role(User.Role.STUDENT)
                .fullName("Alex Morgan")
                .build();

        when(userRepository.existsByEmail("newstudent@skillforge.ai")).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        UserSummaryDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("newstudent@skillforge.ai", response.getEmail());
        assertEquals(User.Role.STUDENT, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw AuthException when registering existing email")
    void shouldThrowExceptionWhenRegisteringExistingEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .email("student@skillforge.ai")
                .password("Password@123")
                .role(User.Role.STUDENT)
                .build();

        when(userRepository.existsByEmail("student@skillforge.ai")).thenReturn(true);

        assertThrows(AuthException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
        LoginRequest request = LoginRequest.builder()
                .email("student@skillforge.ai")
                .password("Secret@123")
                .build();

        CustomUserDetails userDetails = CustomUserDetails.create(sampleUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findById(sampleUser.getId())).thenReturn(Optional.of(sampleUser));
        when(jwtTokenProvider.generateAccessToken(any(), any(), any())).thenReturn("sample_jwt_token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("sample_refresh_token");

        AuthResponse response = authService.login(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("sample_jwt_token", response.getAccessToken());
        assertEquals("student@skillforge.ai", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Should throw AuthException on invalid password login")
    void shouldThrowExceptionOnInvalidPasswordLogin() {
        LoginRequest request = LoginRequest.builder()
                .email("student@skillforge.ai")
                .password("WrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Bad credentials"));

        assertThrows(AuthException.class, () -> authService.login(request, "127.0.0.1"));
    }
}
