package com.skillforge.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResultDto {

    private int atsScore;
    private int resumeScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingKeywords;
    private List<String> formattingIssues;
    private SectionFeedback sectionFeedback;
    private List<SkillSuggestionDto> skillSuggestions;

    // Resume Extraction Fields
    private List<String> extractedSkills;
    private Double yearsOfExperience;
    private String extractedEducation;
    private List<String> pastJobTitles;
    private List<String> certifications;
    private List<String> extractedKeywords;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillSuggestionDto {
        private String skill;
        private String level; // "Strong", "Moderate", "Needs More Evidence"
        private String evidenceFound;
        private String suggestion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionFeedback {
        private SectionDetail summary;
        private SectionDetail experience;
        private SectionDetail education;
        private SectionDetail skills;
        private SectionDetail projects;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionDetail {
        private int score;
        private String feedback;
        private List<String> suggestions;
    }
}
