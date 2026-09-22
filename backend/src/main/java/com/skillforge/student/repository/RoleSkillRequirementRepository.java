package com.skillforge.student.repository;

import com.skillforge.student.entity.RoleSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoleSkillRequirementRepository extends JpaRepository<RoleSkillRequirement, UUID> {
    List<RoleSkillRequirement> findByRoleNameIgnoreCase(String roleName);
}
