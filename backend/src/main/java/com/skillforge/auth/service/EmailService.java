package com.skillforge.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = "http://localhost:3000/verify-email?token=" + token;
        String htmlContent = "<h2>Welcome to SkillForge AI!</h2>" +
                "<p>Please click the link below to verify your email address:</p>" +
                "<p><a href=\"" + verificationUrl + "\">Verify Email Address</a></p>";
        sendEmail(toEmail, "SkillForge AI - Email Verification", htmlContent);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String htmlContent = "<h2>SkillForge AI - Password Reset Request</h2>" +
                "<p>You requested to reset your password. Click the link below to set a new password:</p>" +
                "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>";
        sendEmail(toEmail, "SkillForge AI - Reset Your Password", htmlContent);
    }

    public void sendApplicationStatusUpdateEmail(String toEmail, String candidateName, String jobTitle, String companyName, String newStatus) {
        String subject = "Application Status Update: " + jobTitle + " at " + companyName;
        String htmlContent = "<div style=\"font-family:Arial,sans-serif;background-color:#0f172a;color:#f8fafc;padding:24px;border-radius:12px;\">" +
                "<h2 style=\"color:#6366f1;\">SkillForge AI — Application Update</h2>" +
                "<p>Dear <strong>" + candidateName + "</strong>,</p>" +
                "<p>Your application for <strong>" + jobTitle + "</strong> at <strong>" + companyName + "</strong> has been updated to: <span style=\"color:#10b981;font-weight:bold;\">" + newStatus + "</span>.</p>" +
                "<p><a href=\"http://localhost:3000/student/jobs\" style=\"display:inline-block;background-color:#6366f1;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;\">View Application Dashboard</a></p>" +
                "</div>";
        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendWeeklyRoadmapNudgeEmail(String toEmail, String studentName, String targetRole, int completedMilestones, int totalMilestones) {
        String subject = "SkillForge AI — Weekly Career Roadmap Nudge: " + targetRole;
        String htmlContent = "<div style=\"font-family:Arial,sans-serif;background-color:#0f172a;color:#f8fafc;padding:24px;border-radius:12px;\">" +
                "<h2 style=\"color:#6366f1;\">SkillForge AI — Weekly Progress Check-in</h2>" +
                "<p>Hello <strong>" + studentName + "</strong>,</p>" +
                "<p>You are making progress towards your target role: <strong>" + targetRole + "</strong>!</p>" +
                "<p>Completed: <strong>" + completedMilestones + " / " + totalMilestones + " Milestones</strong>.</p>" +
                "<p><a href=\"http://localhost:3000/student/roadmap\" style=\"display:inline-block;background-color:#6366f1;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;\">Continue Your Learning Roadmap</a></p>" +
                "</div>";
        sendEmail(toEmail, subject, htmlContent);
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Sent email successfully to: {}", to);
        } catch (Exception ex) {
            log.warn("Failed to send SMTP email to {} (Fallback to log output). Reason: {}", to, ex.getMessage());
            log.info("MOCK EMAIL SENT TO: {} | SUBJECT: {} | CONTENT: {}", to, subject, htmlContent);
        }
    }
}
