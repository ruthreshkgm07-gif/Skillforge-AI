package com.skillforge.auth.dto;

import com.skillforge.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private UUID id;
    private String email;
    private String fullName;
    private User.Role role;
    private Boolean isVerified;
    private String avatarUrl;
}
