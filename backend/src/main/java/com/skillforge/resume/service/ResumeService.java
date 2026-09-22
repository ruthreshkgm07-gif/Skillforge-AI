package com.skillforge.resume.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.common.exception.AuthException;
import com.skillforge.resume.dto.ResumeAnalysisResultDto;
import com.skillforge.resume.entity.Resume;
import com.skillforge.resume.entity.ResumeEmbedding;
import com.skillforge.resume.repository.ResumeEmbeddingRepository;
import com.skillforge.resume.repository.ResumeRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeService {

    private final DocumentParserService documentParserService;
    private final CloudinaryStorageService storageService;
    private final GeminiResumeAnalyzerService geminiAnalyzerService;
    private final ResumeRepository resumeRepository;
    private final ResumeEmbeddingRepository resumeEmbeddingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final com.skillforge.student.service.StudentProfileService studentProfileService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, String> memoryCache = new ConcurrentHashMap<>();

    @Transactional
    public Map<String, Object> uploadAndAnalyzeResume(MultipartFile file, UUID studentId) {
        log.info("Processing resume upload for student ID: {}", studentId);

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new AuthException("Student profile not found", "STUDENT_NOT_FOUND"));

        // 1. Extract text
        String extractedText = documentParserService.extractText(file);

        // 2. Upload file to Cloudinary / storage
        String fileUrl = storageService.uploadFile(file, studentId);

        // 3. Gemini AI Analysis
        String targetRole = student.getTargetRole() != null ? student.getTargetRole() : "Software Engineer";
        ResumeAnalysisResultDto analysisResult = geminiAnalyzerService.analyzeResume(extractedText, targetRole);

        String fullAnalysisJson = null;
        String pastJobTitlesJson = null;
        String certsJson = null;
        String keywordsJson = null;

        try {
            // Save the complete ResumeAnalysisResultDto JSON
            fullAnalysisJson = objectMapper.writeValueAsString(analysisResult);
            if (analysisResult.getPastJobTitles() != null) {
                pastJobTitlesJson = objectMapper.writeValueAsString(analysisResult.getPastJobTitles());
            }
            if (analysisResult.getCertifications() != null) {
                certsJson = objectMapper.writeValueAsString(analysisResult.getCertifications());
            }
            if (analysisResult.getExtractedKeywords() != null) {
                keywordsJson = objectMapper.writeValueAsString(analysisResult.getExtractedKeywords());
            }
        } catch (Exception ex) {
            log.warn("Failed to serialize resume fields JSON: {}", ex.getMessage());
        }

        // 4. Save Resume entity with full analysis JSON
        Resume resume = Resume.builder()
                .student(student)
                .fileUrl(fileUrl)
                .parsedText(extractedText)
                .atsScore(analysisResult.getAtsScore())
                .resumeScore(analysisResult.getResumeScore())
                .skillAnalysisJson(fullAnalysisJson)
                .yearsOfExperience(analysisResult.getYearsOfExperience())
                .education(analysisResult.getExtractedEducation())
                .pastJobTitlesJson(pastJobTitlesJson)
                .certificationsJson(certsJson)
                .extractedKeywordsJson(keywordsJson)
                .build();

        resume = resumeRepository.save(resume);

        // Record student activity to update streak
        try {
            studentProfileService.recordStudentActivityAndGetStreak(studentId);
        } catch (Exception ex) {
            log.warn("Failed to update student streak on resume upload: {}", ex.getMessage());
        }

        // 5. Generate and store pgvector embedding (768 dimensions)
        try {
            String embeddingVector = geminiAnalyzerService.generateEmbeddingVector(extractedText);
            ResumeEmbedding embedding = ResumeEmbedding.builder()
                    .resume(resume)
                    .embedding(embeddingVector)
                    .build();
            resumeEmbeddingRepository.save(embedding);
        } catch (Exception ex) {
            log.warn("Could not save vector embedding for resume ID {}: {}", resume.getId(), ex.getMessage());
        }

        // 6. Cache analysis result in Redis/memory (keyed by student & specific resumeId)
        cacheAnalysisResult(studentId, resume.getId(), analysisResult);

        Map<String, Object> response = new HashMap<>();
        response.put("resumeId", resume.getId());
        response.put("fileUrl", fileUrl);
        response.put("analysis", analysisResult);
        response.put("uploadedAt", resume.getUploadedAt());

        return response;
    }

    public Map<String, Object> getLatestAnalysis(UUID studentId) {
        Optional<Resume> latestResume = resumeRepository.findFirstByStudentUserIdOrderByUploadedAtDesc(studentId);

        if (latestResume.isEmpty()) {
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("hasResume", false);
            emptyResponse.put("analysis", null);
            return emptyResponse;
        }

        Resume resume = latestResume.get();

        // Check cache for this specific resume ID
        ResumeAnalysisResultDto cachedAnalysis = getCachedAnalysisResult(studentId, resume.getId());

        if (cachedAnalysis == null && resume.getSkillAnalysisJson() != null && !resume.getSkillAnalysisJson().isBlank()) {
            try {
                cachedAnalysis = objectMapper.readValue(resume.getSkillAnalysisJson(), ResumeAnalysisResultDto.class);
            } catch (Exception ex) {
                log.warn("Could not deserialize saved skillAnalysisJson for resume {}: {}", resume.getId(), ex.getMessage());
            }
        }

        if (cachedAnalysis == null) {
            StudentProfile profile = studentProfileRepository.findById(studentId).orElse(null);
            String targetRole = profile != null && profile.getTargetRole() != null ? profile.getTargetRole() : "Software Engineer";
            cachedAnalysis = geminiAnalyzerService.analyzeResume(resume.getParsedText(), targetRole);
            cacheAnalysisResult(studentId, resume.getId(), cachedAnalysis);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("resumeId", resume.getId());
        response.put("fileUrl", resume.getFileUrl());
        response.put("analysis", cachedAnalysis);
        response.put("uploadedAt", resume.getUploadedAt());

        return response;
    }

    public List<Map<String, Object>> getResumeHistory(UUID studentId) {
        List<Resume> resumes = resumeRepository.findByStudentUserIdOrderByUploadedAtDesc(studentId);
        List<Map<String, Object>> history = new ArrayList<>();

        for (Resume r : resumes) {
            history.add(Map.of(
                    "resumeId", r.getId(),
                    "fileUrl", r.getFileUrl() != null ? r.getFileUrl() : "",
                    "atsScore", r.getAtsScore() != null ? r.getAtsScore() : 0,
                    "resumeScore", r.getResumeScore() != null ? r.getResumeScore() : 0,
                    "uploadedAt", r.getUploadedAt() != null ? r.getUploadedAt().toString() : ""
            ));
        }
        return history;
    }

    private void cacheAnalysisResult(UUID studentId, UUID resumeId, ResumeAnalysisResultDto result) {
        String key = "resume:analysis:" + studentId + ":" + (resumeId != null ? resumeId : "latest");
        String latestKey = "resume:analysis:" + studentId + ":latest";
        try {
            String json = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(key, json, 24, TimeUnit.HOURS);
            redisTemplate.opsForValue().set(latestKey, json, 24, TimeUnit.HOURS);
        } catch (Exception ex) {
            try {
                String json = objectMapper.writeValueAsString(result);
                memoryCache.put(key, json);
                memoryCache.put(latestKey, json);
            } catch (Exception ignored) {}
        }
    }

    private ResumeAnalysisResultDto getCachedAnalysisResult(UUID studentId, UUID resumeId) {
        String key = "resume:analysis:" + studentId + ":" + (resumeId != null ? resumeId : "latest");
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json != null) {
                return objectMapper.readValue(json, ResumeAnalysisResultDto.class);
            }
        } catch (Exception ex) {
            String json = memoryCache.get(key);
            if (json != null) {
                try {
                    return objectMapper.readValue(json, ResumeAnalysisResultDto.class);
                } catch (Exception ignored) {}
            }
        }
        return null;
    }
}
