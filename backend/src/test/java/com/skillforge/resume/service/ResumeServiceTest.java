package com.skillforge.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.auth.entity.User;
import com.skillforge.resume.dto.ResumeAnalysisResultDto;
import com.skillforge.resume.entity.Resume;
import com.skillforge.resume.entity.ResumeEmbedding;
import com.skillforge.resume.repository.ResumeEmbeddingRepository;
import com.skillforge.resume.repository.ResumeRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockMultipartFile;

import java.time.ZonedDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private DocumentParserService documentParserService;
    @Mock
    private CloudinaryStorageService storageService;
    @Mock
    private GeminiResumeAnalyzerService geminiAnalyzerService;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private ResumeEmbeddingRepository resumeEmbeddingRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ResumeService resumeService;

    private UUID studentId;
    private StudentProfile sampleStudent;
    private ResumeAnalysisResultDto sampleAnalysis;
    private Resume sampleResume;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();

        User user = User.builder()
                .id(studentId)
                .email("student@skillforge.ai")
                .role(User.Role.STUDENT)
                .build();

        sampleStudent = StudentProfile.builder()
                .userId(studentId)
                .user(user)
                .fullName("Alex Student")
                .targetRole("Full Stack Engineer")
                .build();

        sampleAnalysis = ResumeAnalysisResultDto.builder()
                .atsScore(88)
                .resumeScore(90)
                .strengths(List.of("Strong Java background"))
                .weaknesses(List.of("Missing metrics"))
                .missingKeywords(List.of("Docker"))
                .formattingIssues(List.of())
                .sectionFeedback(ResumeAnalysisResultDto.SectionFeedback.builder()
                        .summary(new ResumeAnalysisResultDto.SectionDetail(85, "Good", List.of()))
                        .experience(new ResumeAnalysisResultDto.SectionDetail(90, "Strong", List.of()))
                        .education(new ResumeAnalysisResultDto.SectionDetail(95, "Clear", List.of()))
                        .skills(new ResumeAnalysisResultDto.SectionDetail(88, "Complete", List.of()))
                        .projects(new ResumeAnalysisResultDto.SectionDetail(84, "Good", List.of()))
                        .build())
                .build();

        sampleResume = Resume.builder()
                .id(UUID.randomUUID())
                .student(sampleStudent)
                .fileUrl("https://cloudinary.com/resume.pdf")
                .parsedText("Extracted resume text for Alex Student")
                .atsScore(88)
                .resumeScore(90)
                .uploadedAt(ZonedDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should process resume upload, call Gemini AI analysis, and store pgvector embedding")
    void uploadAndAnalyzeResume_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "dummy pdf content".getBytes());

        when(studentProfileRepository.findById(studentId)).thenReturn(Optional.of(sampleStudent));
        when(documentParserService.extractText(any())).thenReturn("Extracted resume text for Alex Student");
        when(storageService.uploadFile(any(), eq(studentId))).thenReturn("https://cloudinary.com/resume.pdf");
        when(geminiAnalyzerService.analyzeResume(anyString(), anyString())).thenReturn(sampleAnalysis);
        when(resumeRepository.save(any(Resume.class))).thenReturn(sampleResume);
        when(geminiAnalyzerService.generateEmbeddingVector(anyString())).thenReturn("[0.1, 0.2, ...]");

        Map<String, Object> response = resumeService.uploadAndAnalyzeResume(file, studentId);

        assertNotNull(response);
        assertEquals("https://cloudinary.com/resume.pdf", response.get("fileUrl"));
        assertNotNull(response.get("analysis"));

        verify(resumeRepository, times(1)).save(any(Resume.class));
        verify(resumeEmbeddingRepository, times(1)).save(any(ResumeEmbedding.class));
    }
}
