package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, UUID> {

    @Query("SELECT DISTINCT q.topic FROM QuestionBank q WHERE (:category IS NULL OR LOWER(q.category) = LOWER(:category))")
    List<String> findDistinctTopics(@Param("category") String category);

    @Query("SELECT DISTINCT q.category FROM QuestionBank q")
    List<String> findDistinctCategories();

    List<QuestionBank> findByTopicIn(List<String> topics);

    List<QuestionBank> findByTopic(String topic);

    List<QuestionBank> findByCategory(String category);

    @Query("SELECT q FROM QuestionBank q WHERE " +
           "(:topics IS NULL OR q.topic IN :topics) AND " +
           "(:difficulty IS NULL OR LOWER(q.difficulty) = LOWER(:difficulty))")
    List<QuestionBank> findMatchingQuestions(@Param("topics") List<String> topics, @Param("difficulty") String difficulty);
}
