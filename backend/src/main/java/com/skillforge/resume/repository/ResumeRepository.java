package com.skillforge.resume.repository;

import com.skillforge.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    Optional<Resume> findFirstByStudentUserIdOrderByUploadedAtDesc(UUID studentId);
    java.util.List<Resume> findByStudentUserIdOrderByUploadedAtDesc(UUID studentId);
}
