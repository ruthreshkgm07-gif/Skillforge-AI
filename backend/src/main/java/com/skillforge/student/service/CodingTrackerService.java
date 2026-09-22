package com.skillforge.student.service;

import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.resume.service.GitHubIntegrationService;
import com.skillforge.student.dto.CodingTrackerSummaryDto;
import com.skillforge.student.dto.LogCodingStatsRequestDto;
import com.skillforge.student.entity.CodingTrackerStats;
import com.skillforge.student.entity.CodingTrackerTrend;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.CodingTrackerStatsRepository;
import com.skillforge.student.repository.CodingTrackerTrendRepository;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CodingTrackerService {

    private final CodingTrackerStatsRepository statsRepository;
    private final CodingTrackerTrendRepository trendRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final GitHubIntegrationService gitHubIntegrationService;

    @Transactional
    public CodingTrackerSummaryDto logManualStats(UUID studentId, LogCodingStatsRequestDto request) {
        User user = userRepository.findById(studentId)
                .orElseThrow(AuthException::userNotFound);

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseGet(() -> StudentProfile.builder().userId(studentId).user(user).build());

        CodingTrackerStats.Platform platform;
        try {
            platform = CodingTrackerStats.Platform.valueOf(request.getPlatform().toUpperCase());
        } catch (Exception ex) {
            throw new RuntimeException("Invalid platform: " + request.getPlatform() + ". Supported: LEETCODE, CODEFORCES, GITHUB");
        }

        CodingTrackerStats stats = statsRepository.findByStudentUserIdAndPlatform(studentId, platform)
                .orElseGet(() -> CodingTrackerStats.builder()
                        .student(student)
                        .platform(platform)
                        .problemsSolved(0)
                        .rating(0)
                        .build());

        if (request.getProblemsSolved() != null) {
            stats.setProblemsSolved(request.getProblemsSolved());
        }
        if (request.getRating() != null) {
            stats.setRating(request.getRating());
        }
        stats.setLastSynced(ZonedDateTime.now());
        statsRepository.save(stats);

        // Append historical trend log for sparkline
        CodingTrackerTrend trend = CodingTrackerTrend.builder()
                .student(student)
                .platform(platform)
                .problemsSolved(stats.getProblemsSolved())
                .rating(stats.getRating())
                .build();
        trendRepository.save(trend);

        log.info("Logged coding stats for student {} on platform {}: {} problems, {} rating",
                studentId, platform, stats.getProblemsSolved(), stats.getRating());

        return getCodingSummary(studentId);
    }

    @Transactional
    public CodingTrackerSummaryDto syncGitHubStats(UUID studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new AuthException("Student profile not found", "STUDENT_NOT_FOUND"));

        var ghStats = gitHubIntegrationService.fetchGitHubProfileStats(student.getGithubUrl());
        int estimatedCommits = ghStats.getPublicReposCount() * 15;

        LogCodingStatsRequestDto req = LogCodingStatsRequestDto.builder()
                .platform("GITHUB")
                .problemsSolved(estimatedCommits)
                .rating(ghStats.getTotalStars() * 10)
                .build();

        return logManualStats(studentId, req);
    }

    /**
     * External Sync Stub for LeetCode.
     * TODO: LeetCode does not provide an official public OAuth REST API.
     * Unofficial API / Scraping Approach:
     * 1. Send POST request to LeetCode GraphQL API endpoint: 'https://leetcode.com/graphql'
     * 2. OperationName: 'getUserProfile', Query: '{ matchedUser(username: "YOUR_USERNAME") { submitStats { acSubmissionNum { count } } } }'
     * 3. Extract total solved count and contest rating.
     */
    @Transactional
    public CodingTrackerSummaryDto syncLeetCodeStub(UUID studentId, String username) {
        log.info("LeetCode sync stub invoked for student {} with username {}", studentId, username);
        // Default simulated fallback stats until unofficial API connection is established
        return logManualStats(studentId, LogCodingStatsRequestDto.builder()
                .platform("LEETCODE")
                .problemsSolved(245)
                .rating(1780)
                .build());
    }

    /**
     * External Sync Stub for Codeforces.
     * TODO: Official Codeforces API Integration Approach:
     * 1. GET 'https://codeforces.com/api/user.info?handles={handle}' to fetch current rating & maxRating.
     * 2. GET 'https://codeforces.com/api/user.status?handle={handle}' to count OK submissions for solved problems count.
     */
    @Transactional
    public CodingTrackerSummaryDto syncCodeforcesStub(UUID studentId, String handle) {
        log.info("Codeforces sync stub invoked for student {} with handle {}", studentId, handle);
        return logManualStats(studentId, LogCodingStatsRequestDto.builder()
                .platform("CODEFORCES")
                .problemsSolved(110)
                .rating(1450)
                .build());
    }

    @Transactional(readOnly = true)
    public CodingTrackerSummaryDto getCodingSummary(UUID studentId) {
        List<CodingTrackerStats> statsList = statsRepository.findByStudentUserId(studentId);
        List<CodingTrackerTrend> trendList = trendRepository.findByStudentUserIdOrderByRecordedAtAsc(studentId);

        if (statsList.isEmpty()) {
            // Seed initial stats for clean initial UI view
            List.of("LEETCODE", "CODEFORCES", "GITHUB").forEach(p ->
                    statsRepository.save(CodingTrackerStats.builder()
                            .student(studentProfileRepository.findById(studentId).orElse(null))
                            .platform(CodingTrackerStats.Platform.valueOf(p))
                            .problemsSolved(p.equals("LEETCODE") ? 180 : (p.equals("CODEFORCES") ? 85 : 140))
                            .rating(p.equals("LEETCODE") ? 1650 : (p.equals("CODEFORCES") ? 1380 : 250))
                            .build())
            );
            statsList = statsRepository.findByStudentUserId(studentId);
        }

        int totalSolved = 0;
        int maxRating = 0;
        List<CodingTrackerSummaryDto.PlatformStatItem> items = new ArrayList<>();

        for (CodingTrackerStats s : statsList) {
            totalSolved += s.getProblemsSolved();
            if (s.getRating() != null && s.getRating() > maxRating) {
                maxRating = s.getRating();
            }
            items.add(CodingTrackerSummaryDto.PlatformStatItem.builder()
                    .platform(s.getPlatform().name())
                    .problemsSolved(s.getProblemsSolved())
                    .rating(s.getRating() != null ? s.getRating() : 0)
                    .lastSynced(s.getLastSynced() != null ? s.getLastSynced().toString() : ZonedDateTime.now().toString())
                    .build());
        }

        // Build Trend Data Points for Sparkline
        List<CodingTrackerSummaryDto.TrendDataPoint> trendPoints = new ArrayList<>();
        if (trendList.isEmpty()) {
            // Generate 5 historical trend points
            ZonedDateTime now = ZonedDateTime.now();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
            trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(now.minusDays(20).format(fmt), 120, 70, 30, 20));
            trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(now.minusDays(15).format(fmt), 180, 100, 45, 35));
            trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(now.minusDays(10).format(fmt), 260, 140, 65, 55));
            trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(now.minusDays(5).format(fmt), 340, 175, 80, 85));
            trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(now.format(fmt), totalSolved, 180, 85, 140));
        } else {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
            for (CodingTrackerTrend t : trendList) {
                trendPoints.add(new CodingTrackerSummaryDto.TrendDataPoint(
                        t.getRecordedAt().format(fmt),
                        t.getProblemsSolved(),
                        t.getPlatform() == CodingTrackerStats.Platform.LEETCODE ? t.getProblemsSolved() : 0,
                        t.getPlatform() == CodingTrackerStats.Platform.CODEFORCES ? t.getProblemsSolved() : 0,
                        t.getPlatform() == CodingTrackerStats.Platform.GITHUB ? t.getProblemsSolved() : 0
                ));
            }
        }

        return CodingTrackerSummaryDto.builder()
                .totalProblemsSolved(totalSolved)
                .overallRating(maxRating)
                .platformStats(items)
                .trendHistory(trendPoints)
                .build();
    }
}
