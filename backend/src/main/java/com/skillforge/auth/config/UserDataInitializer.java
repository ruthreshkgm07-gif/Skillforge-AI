package com.skillforge.auth.config;

import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.recruiter.entity.Company;
import com.skillforge.recruiter.entity.Job;
import com.skillforge.recruiter.entity.RecruiterProfile;
import com.skillforge.recruiter.repository.CompanyRepository;
import com.skillforge.recruiter.repository.JobRepository;
import com.skillforge.recruiter.repository.RecruiterProfileRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByEmail("student@skillforge.ai")) {
            log.info("Seeding default student user: student@skillforge.ai");
            User studentUser = userRepository.save(User.builder()
                    .email("student@skillforge.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.STUDENT)
                    .isVerified(true)
                    .build());

            studentProfileRepository.save(StudentProfile.builder()
                    .user(studentUser)
                    .fullName("Alex Johnson")
                    .headline("Aspiring Full Stack Engineer")
                    .bio("Passionate student developer learning Java Spring Boot, React, and AI ML techniques.")
                    .targetRole("Full Stack Engineer")
                    .build());
        }

        Company company = companyRepository.findByName("TechCorp Global")
                .orElseGet(() -> companyRepository.save(Company.builder().name("TechCorp Global").website("https://techcorp.example.com").build()));

        RecruiterProfile recruiterProfile = null;
        if (!userRepository.existsByEmail("recruiter@skillforge.ai")) {
            log.info("Seeding default recruiter user: recruiter@skillforge.ai");
            User recruiterUser = userRepository.save(User.builder()
                    .email("recruiter@skillforge.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.RECRUITER)
                    .isVerified(true)
                    .build());

            recruiterProfile = recruiterProfileRepository.save(RecruiterProfile.builder()
                    .user(recruiterUser)
                    .company(company)
                    .designation("Senior Talent Acquisition Lead")
                    .build());
        } else {
            recruiterProfile = recruiterProfileRepository.findAll().stream().findFirst().orElse(null);
        }

        if (!userRepository.existsByEmail("ruthreshkgm07@gmail.com")) {
            log.info("Seeding user account for: ruthreshkgm07@gmail.com");
            User user = userRepository.save(User.builder()
                    .email("ruthreshkgm07@gmail.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.STUDENT)
                    .isVerified(true)
                    .build());

            studentProfileRepository.save(StudentProfile.builder()
                    .user(user)
                    .fullName("Ruthresh")
                    .headline("Full Stack Software Engineer")
                    .targetRole("Full Stack Engineer")
                    .build());
        } else {
            userRepository.findByEmail("ruthreshkgm07@gmail.com").ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode("password123"));
                u.setIsVerified(true);
                userRepository.save(u);
            });
        }

        if (!userRepository.existsByEmail("admin@skillforge.ai")) {
            log.info("Seeding default admin user: admin@skillforge.ai");
            userRepository.save(User.builder()
                    .email("admin@skillforge.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.ADMIN)
                    .isVerified(true)
                    .build());
        }

        // Seed Sample Campus Jobs in DB if empty
        if (jobRepository.count() == 0 && recruiterProfile != null) {
            log.info("Seeding sample campus & fresher jobs into database");
            jobRepository.save(Job.builder()
                    .company(company)
                    .recruiter(recruiterProfile)
                    .title("Graduate Software Engineer (Fresher)")
                    .description("Role for 2025/2026 CS grads. Core Java, Spring Boot, React, and REST APIs.")
                    .requiredSkills("[\"Java\", \"Spring Boot\", \"React\", \"SQL\"]")
                    .minExperience(0)
                    .location("Bengaluru, India (Hybrid)")
                    .salaryMin(new BigDecimal("12.0"))
                    .salaryMax(new BigDecimal("16.0"))
                    .employmentType(Job.EmploymentType.FULL_TIME)
                    .status(Job.JobStatus.ACTIVE)
                    .build());

            jobRepository.save(Job.builder()
                    .company(company)
                    .recruiter(recruiterProfile)
                    .title("SDE Intern - Summer 2026")
                    .description("3-month internship for pre-final year engineering students. Data Structures & Algorithms focus.")
                    .requiredSkills("[\"Java\", \"Python\", \"Data Structures\", \"Algorithms\"]")
                    .minExperience(0)
                    .location("Remote / Hyderabad")
                    .salaryMin(new BigDecimal("6.0"))
                    .salaryMax(new BigDecimal("8.0"))
                    .employmentType(Job.EmploymentType.INTERNSHIP)
                    .status(Job.JobStatus.ACTIVE)
                    .build());

            jobRepository.save(Job.builder()
                    .company(company)
                    .recruiter(recruiterProfile)
                    .title("Full Stack Engineer - Campus Drive")
                    .description("Exclusive campus placement drive for B.Tech CSE, IT, ECE, MCA candidates.")
                    .requiredSkills("[\"React\", \"Node.js\", \"Java\", \"PostgreSQL\"]")
                    .minExperience(0)
                    .location("Pune, India")
                    .salaryMin(new BigDecimal("10.0"))
                    .salaryMax(new BigDecimal("14.0"))
                    .employmentType(Job.EmploymentType.FULL_TIME)
                    .status(Job.JobStatus.ACTIVE)
                    .build());
        }

        log.info("Default user credentials ready: student@skillforge.ai / recruiter@skillforge.ai / admin@skillforge.ai (password: password123)");
    }
}
