package com.skillforge.student.service;

import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.student.dto.StudentProfileDto;
import com.skillforge.student.entity.Skill;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.entity.StudentSkill;
import com.skillforge.student.entity.StudentSkillId;
import com.skillforge.student.repository.SkillRepository;
import com.skillforge.student.repository.StudentProfileRepository;
import com.skillforge.student.repository.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(UUID studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseGet(() -> createDefaultProfile(studentId));

        List<String> skills = profile.getStudentSkills() != null
                ? profile.getStudentSkills().stream()
                    .map(ss -> ss.getSkill() != null ? ss.getSkill().getName() : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList())
                : Collections.emptyList();

        return StudentProfileDto.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .email(profile.getUser() != null ? profile.getUser().getEmail() : "")
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .targetRole(profile.getTargetRole())
                .phone(profile.getPhone())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .avatarUrl(profile.getAvatarUrl())
                .skills(skills)
                .createdAt(profile.getCreatedAt())
                .build();
    }

    @Transactional
    public StudentProfileDto updateProfile(UUID studentId, StudentProfileDto dto) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseGet(() -> createDefaultProfile(studentId));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            profile.setFullName(dto.getFullName().trim());
        }
        if (dto.getHeadline() != null) {
            profile.setHeadline(dto.getHeadline().trim());
        }
        if (dto.getBio() != null) {
            profile.setBio(dto.getBio().trim());
        }
        if (dto.getTargetRole() != null && !dto.getTargetRole().isBlank()) {
            profile.setTargetRole(dto.getTargetRole().trim());
        }
        if (dto.getPhone() != null) {
            profile.setPhone(dto.getPhone().trim());
        }
        if (dto.getGithubUrl() != null) {
            profile.setGithubUrl(dto.getGithubUrl().trim());
        }
        if (dto.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(dto.getLinkedinUrl().trim());
        }
        if (dto.getAvatarUrl() != null) {
            profile.setAvatarUrl(dto.getAvatarUrl().trim());
        }

        // Update email on user entity if changed
        if (dto.getEmail() != null && !dto.getEmail().isBlank() && profile.getUser() != null) {
            String cleanEmail = dto.getEmail().trim().toLowerCase();
            if (!cleanEmail.equalsIgnoreCase(profile.getUser().getEmail())) {
                if (userRepository.existsByEmail(cleanEmail)) {
                    throw new IllegalArgumentException("Email " + cleanEmail + " is already registered by another account.");
                }
                User user = profile.getUser();
                user.setEmail(cleanEmail);
                userRepository.save(user);
            }
        }

        // Update skills
        if (dto.getSkills() != null) {
            if (profile.getStudentSkills() == null) {
                profile.setStudentSkills(new HashSet<>());
            } else {
                profile.getStudentSkills().clear();
            }

            for (String rawName : dto.getSkills()) {
                if (rawName != null && !rawName.isBlank()) {
                    String cleanSkill = rawName.trim();
                    Skill skill = skillRepository.findByNameIgnoreCase(cleanSkill)
                            .orElseGet(() -> skillRepository.save(
                                    Skill.builder()
                                            .name(cleanSkill)
                                            .category("Technical")
                                            .build()
                            ));

                    StudentSkillId skillId = new StudentSkillId(studentId, skill.getId());
                    StudentSkill studentSkill = StudentSkill.builder()
                            .id(skillId)
                            .student(profile)
                            .skill(skill)
                            .proficiencyLevel(4)
                            .verifiedBy(StudentSkill.VerificationSource.SELF)
                            .build();

                    profile.getStudentSkills().add(studentSkill);
                }
            }
        }

        profile = studentProfileRepository.save(profile);
        log.info("Successfully updated student profile for ID: {}", studentId);

        return getProfile(studentId);
    }

    private StudentProfile createDefaultProfile(UUID studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new AuthException("User not found: " + studentId, "USER_NOT_FOUND"));

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .fullName(user.getEmail().split("@")[0])
                .targetRole("Software Engineer")
                .headline("Engineering Student & Developer")
                .bio("Passionate about full-stack development, algorithms, and AI.")
                .build();

        return studentProfileRepository.save(profile);
    }

    @Transactional
    public int recordStudentActivityAndGetStreak(UUID studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseGet(() -> createDefaultProfile(studentId));

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate lastActive = profile.getLastActiveDate();
        int currentStreak = profile.getStreakDays();

        if (lastActive == null) {
            currentStreak = 1;
            profile.setLastActiveDate(today);
            profile.setStreakDays(currentStreak);
            studentProfileRepository.save(profile);
        } else if (lastActive.equals(today.minusDays(1))) {
            currentStreak = Math.max(1, currentStreak + 1);
            profile.setLastActiveDate(today);
            profile.setStreakDays(currentStreak);
            studentProfileRepository.save(profile);
        } else if (!lastActive.equals(today)) {
            // Gap of 2+ days: reset streak to 1
            currentStreak = 1;
            profile.setLastActiveDate(today);
            profile.setStreakDays(currentStreak);
            studentProfileRepository.save(profile);
        } else if (currentStreak <= 0) {
            currentStreak = 1;
            profile.setStreakDays(1);
            studentProfileRepository.save(profile);
        }

        return currentStreak;
    }
}
