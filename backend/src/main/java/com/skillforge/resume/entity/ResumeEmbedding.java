package com.skillforge.resume.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeEmbedding {

    @Id
    @Column(name = "resume_id")
    private UUID resumeId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(name = "embedding", columnDefinition = "TEXT", nullable = false)
    private String embedding; // Formatted vector string representation e.g. "[0.01, 0.02, ...]"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
