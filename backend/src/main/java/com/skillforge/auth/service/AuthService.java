package com.skillforge.auth.service;

import com.skillforge.auth.dto.*;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.auth.security.JwtTokenProvider;
import com.skillforge.common.exception.AuthException;
import com.skillforge.common.service.RateLimiterService;
import com.skillforge.recruiter.entity.Company;
import com.skillforge.recruiter.entity.RecruiterProfile;
import com.skillforge.recruiter.repository.CompanyRepository;
import com.skillforge.recruiter.repository.RecruiterProfileRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RateLimiterService rateLimiterService;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.login-max-attempts:50}")
    private int loginMaxAttempts;

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.login-window-minutes:15}")
    private int loginWindowMinutes;

    // In-memory token storage fallback if Redis is unavailable during local development
    private final ConcurrentHashMap<String, String> memoryTokenStore = new ConcurrentHashMap<>();

    @Transactional
    public UserSummaryDto register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw AuthException.userExists(cleanEmail);
        }

        if (request.getRole() == User.Role.ADMIN) {
            throw new AuthException("Admin accounts cannot be registered publicly", "AUTH_FORBIDDEN_ROLE");
        }

        User user = User.builder()
                .email(cleanEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isVerified(true) // Auto-verified for seamless authentication
                .build();

        user = userRepository.save(user);

        if (request.getRole() == User.Role.STUDENT) {
            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .targetRole("Software Engineer")
                    .build();
            studentProfileRepository.save(profile);
        } else if (request.getRole() == User.Role.RECRUITER) {
            String companyName = request.getCompanyName() != null ? request.getCompanyName() : "Independent Company";
            Company company = companyRepository.findByName(companyName)
                    .orElseGet(() -> companyRepository.save(Company.builder().name(companyName).build()));

            RecruiterProfile profile = RecruiterProfile.builder()
                    .user(user)
                    .company(company)
                    .designation(request.getDesignation() != null ? request.getDesignation() : "Recruiter")
                    .build();
            recruiterProfileRepository.save(profile);
        }

        // Generate verification token (24 hrs)
        String verifyToken = UUID.randomUUID().toString();
        storeToken("verify:" + verifyToken, user.getEmail(), 24, TimeUnit.HOURS);
        emailService.sendVerificationEmail(user.getEmail(), verifyToken);

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(request.getFullName())
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        String email = getTokenValue("verify:" + token);
        if (email == null) {
            throw AuthException.tokenInvalid();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(AuthException::userNotFound);

        user.setIsVerified(true);
        userRepository.save(user);
        removeToken("verify:" + token);
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String rateLimitKey = "login:" + cleanEmail + ":" + clientIp;

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
            );
        } catch (Exception ex) {
            // Track and enforce rate limit only on failed bad-credential attempts
            rateLimiterService.checkRateLimit(rateLimitKey, loginMaxAttempts, loginWindowMinutes);
            throw AuthException.invalidCredentials();
        }

        // On successful authentication, reset the failed attempt counter
        rateLimiterService.resetRateLimit(rateLimitKey);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(AuthException::userNotFound);

        String accessToken = tokenProvider.generateAccessToken(userDetails, user.getId(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Store refresh token in Redis (7 days expiration)
        storeToken("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        String fullName = getFullNameForUser(user);

        UserSummaryDto userSummary = UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userSummary)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!tokenProvider.validateToken(token)) {
            throw AuthException.tokenInvalid();
        }

        String email = tokenProvider.getEmailFromToken(token);
        String storedToken = getTokenValue("refresh:" + email);

        if (storedToken == null || !storedToken.equals(token)) {
            throw AuthException.tokenInvalid();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(AuthException::userNotFound);

        CustomUserDetails userDetails = CustomUserDetails.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(userDetails, user.getId(), user.getRole().name());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        storeToken("refresh:" + user.getEmail(), newRefreshToken, 7, TimeUnit.DAYS);

        String fullName = getFullNameForUser(user);

        UserSummaryDto userSummary = UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .build();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(userSummary)
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getEmailFromToken(refreshToken);
            removeToken("refresh:" + email);
        }
    }

    public void forgotPassword(ForgotPasswordRequest request, String clientIp) {
        rateLimiterService.checkRateLimit("forgot_pw:" + clientIp, 3, 15);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(AuthException::userNotFound);

        String resetToken = UUID.randomUUID().toString();
        storeToken("reset_pw:" + resetToken, user.getEmail(), 1, TimeUnit.HOURS);
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = getTokenValue("reset_pw:" + request.getToken());
        if (email == null) {
            throw AuthException.tokenInvalid();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(AuthException::userNotFound);

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        removeToken("reset_pw:" + request.getToken());
        removeToken("refresh:" + user.getEmail()); // Invalidate active sessions
    }

    public UserSummaryDto getCurrentUserSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(AuthException::userNotFound);
        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(getFullNameForUser(user))
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .build();
    }

    private String getFullNameForUser(User user) {
        if (user.getRole() == User.Role.STUDENT) {
            return studentProfileRepository.findById(user.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(user.getEmail());
        }
        return user.getEmail();
    }

    private void storeToken(String key, String value, long timeout, TimeUnit unit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        } catch (Exception ex) {
            log.warn("Redis store unavailable. Using memory token store fallback: {}", ex.getMessage());
            memoryTokenStore.put(key, value);
        }
    }

    private String getTokenValue(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception ex) {
            return memoryTokenStore.get(key);
        }
    }

    private void removeToken(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ex) {
            memoryTokenStore.remove(key);
        }
    }
}
