package com.skillforge.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneDto {

    private Integer milestoneIndex;
    private String monthRange;
    private String focusArea;
    private List<String> skillsToLearn;
    private List<ResourceItem> recommendedResources;
    private SuggestedProject suggestedProject;
    private String checkpointGoal;
    private Boolean isCompleted;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceItem {
        private String name;
        private String type; // e.g. "DOCUMENTATION", "COURSE", "TUTORIAL"
        private Integer estHours;
        private String url;
        private Boolean isFree;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedProject {
        private String title;
        private String description;
        private List<String> techStack;
    }
}
