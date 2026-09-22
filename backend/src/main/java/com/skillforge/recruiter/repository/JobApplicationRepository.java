package com.skillforge.recruiter.repository;

import com.skillforge.recruiter.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByStudentUserId(UUID studentId);
    List<JobApplication> findByJobId(UUID jobId);
}
