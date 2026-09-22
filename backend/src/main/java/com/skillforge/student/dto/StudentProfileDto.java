package com.skillforge.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {

    private UUID userId;

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    @Email(message = "Please provide a valid email address")
    private String email;

    private String headline;
    private String bio;
    private String targetRole;
    private String phone;
    private String githubUrl;
    private String linkedinUrl;
    private String avatarUrl;
    private List<String> skills;
    private ZonedDateTime createdAt;
}
