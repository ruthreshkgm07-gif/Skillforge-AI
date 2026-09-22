package com.skillforge.student.repository;

import com.skillforge.student.entity.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, UUID> {

    List<CodingProblem> findByTopic(String topic);

    List<CodingProblem> findByTopicIn(List<String> topics);

    @Query("SELECT DISTINCT p.topic FROM CodingProblem p")
    List<String> findDistinctTopics();

    @Query("SELECT p FROM CodingProblem p WHERE " +
           "(:topic IS NULL OR LOWER(p.topic) = LOWER(:topic)) AND " +
           "(:difficulty IS NULL OR LOWER(p.difficulty) = LOWER(:difficulty))")
    List<CodingProblem> findMatchingProblems(@Param("topic") String topic, @Param("difficulty") String difficulty);
}
