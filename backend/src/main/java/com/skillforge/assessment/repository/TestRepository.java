package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, UUID> {
    List<Test> findByIsActiveTrue();
    List<Test> findByTypeAndIsActiveTrue(String type);
    List<Test> findByModuleIdAndIsActiveTrue(String moduleId);
}
