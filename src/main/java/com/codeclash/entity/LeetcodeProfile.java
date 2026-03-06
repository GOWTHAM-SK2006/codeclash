package com.codeclash.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leetcode_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeetcodeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String leetcodeUsername;

    @Builder.Default
    private Integer easySolved = 0;

    @Builder.Default
    private Integer mediumSolved = 0;

    @Builder.Default
    private Integer hardSolved = 0;

    @Builder.Default
    private Integer totalCoinsEarned = 0;

    @Column(name = "leetcode_email")
    private String leetcodeEmail;

    @Column(name = "otp_code")
    private String otpCode;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean verified = false;

    @Column(name = "otp_created_at")
    private LocalDateTime otpCreatedAt;

    private LocalDateTime lastSyncedAt;
}
