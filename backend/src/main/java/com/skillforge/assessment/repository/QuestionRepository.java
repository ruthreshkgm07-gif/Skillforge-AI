package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByTestId(UUID testId);
    List<Question> findByTestIdAndSkillCategoryIgnoreCase(UUID testId, String skillCategory);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT q.skillCategory FROM Question q WHERE q.skillCategory IS NOT NULL AND LOWER(q.test.type) = LOWER(:testType)")
    List<String> findDistinctSkillCategoriesByTestType(@org.springframework.data.repository.query.Param("testType") String testType);
}
