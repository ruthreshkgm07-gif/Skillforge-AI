package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.SuggestionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuggestionConfigRepository extends JpaRepository<SuggestionConfig, UUID> {
    Optional<SuggestionConfig> findBySkillCategoryIgnoreCase(String skillCategory);
    List<SuggestionConfig> findByTestTypeInAndSkillCategoryIgnoreCase(List<String> testTypes, String skillCategory);
}
