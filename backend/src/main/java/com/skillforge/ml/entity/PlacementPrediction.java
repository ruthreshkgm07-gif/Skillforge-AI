package com.skillforge.ml.entity;

import com.skillforge.student.entity.StudentProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "placement_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal probability;

    @Column(name = "predicted_salary_lpa", precision = 6, scale = 2)
    private BigDecimal predictedSalaryLpa;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String factors; // Key factors influencing probability & salary

    @CreationTimestamp
    @Column(name = "predicted_at", updatable = false)
    private ZonedDateTime predictedAt;
}
