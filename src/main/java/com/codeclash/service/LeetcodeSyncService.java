package com.codeclash.service;

import com.codeclash.entity.LeetcodeProfile;
import com.codeclash.entity.User;
import com.codeclash.repository.LeetcodeProfileRepository;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeetcodeSyncService {

    private final LeetcodeProfileRepository leetcodeProfileRepository;
    private final UserRepository userRepository;
    private final CoinService coinService;

    private static final int COINS_EASY = 5;
    private static final int COINS_MEDIUM = 10;
    private static final int COINS_HARD = 15;

    @Transactional
    public LeetcodeProfile connectProfile(String username, String leetcodeUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<LeetcodeProfile> existing = leetcodeProfileRepository.findByUserId(user.getId());
        LeetcodeProfile profile;

        if (existing.isPresent()) {
            profile = existing.get();
            profile.setLeetcodeUsername(leetcodeUsername);
        } else {
            profile = LeetcodeProfile.builder()
                    .user(user)
                    .leetcodeUsername(leetcodeUsername)
                    .build();
        }

        return leetcodeProfileRepository.save(profile);
    }

    @Transactional
    public LeetcodeProfile syncProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeetcodeProfile profile = leetcodeProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("LeetCode profile not connected"));

        // Check 24h limit
        if (profile.getLastSyncedAt() != null && profile.getLastSyncedAt().plusHours(24).isAfter(LocalDateTime.now())) {
            throw new RuntimeException("You can only sync once every 24 hours.");
        }

        try {
            // Fetch and parse LeetCode profile
            // LeetCode URLs are typically leetcode.com/u/username or leetcode.com/username
            String url = "https://leetcode.com/u/" + profile.getLeetcodeUsername();
            log.info("Syncing LeetCode profile for {} from {}", profile.getLeetcodeUsername(), url);

            Document doc = Jsoup.connect(url)
                    .userAgent(
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(10000)
                    .get();

            // Extract solved counts
            int easy = parseCount(doc, "Easy");
            int medium = parseCount(doc, "Medium");
            int hard = parseCount(doc, "Hard");

            log.info("Parsed counts for {}: Easy={}, Medium={}, Hard={}",
                    profile.getLeetcodeUsername(), easy, medium, hard);

            // Calculate new solved counts
            int newEasy = Math.max(0, easy - (profile.getEasySolved() != null ? profile.getEasySolved() : 0));
            int newMedium = Math.max(0, medium - (profile.getMediumSolved() != null ? profile.getMediumSolved() : 0));
            int newHard = Math.max(0, hard - (profile.getHardSolved() != null ? profile.getHardSolved() : 0));

            int earnedCoins = (newEasy * COINS_EASY) + (newMedium * COINS_MEDIUM) + (newHard * COINS_HARD);

            if (earnedCoins > 0) {
                String reason = String.format("LeetCode Sync: +%d Easy, +%d Medium, +%d Hard", newEasy, newMedium,
                        newHard);
                coinService.awardCoins(user, earnedCoins, reason);
                profile.setTotalCoinsEarned(
                        (profile.getTotalCoinsEarned() != null ? profile.getTotalCoinsEarned() : 0) + earnedCoins);
                log.info("Awarded {} coins to user {} for LeetCode sync", earnedCoins, user.getUsername());
            }

            profile.setEasySolved(easy);
            profile.setMediumSolved(medium);
            profile.setHardSolved(hard);
            profile.setLastSyncedAt(LocalDateTime.now());

            return leetcodeProfileRepository.save(profile);

        } catch (IOException e) {
            log.error("Failed to fetch LeetCode profile for {}", profile.getLeetcodeUsername(), e);
            throw new RuntimeException("Could not fetch LeetCode profile. Please check the username and try again.");
        }
    }

    private int parseCount(Document doc, String difficulty) {
        try {
            // Try to find elements containing the difficulty text
            Elements elements = doc.getElementsContainingOwnText(difficulty);
            for (Element el : elements) {
                // LeetCode often has "Easy", "Medium", "Hard" labels
                // We want to find the number associated with it.
                // In the current profile layout, the count is often in a sibling or parent
                // sibling

                // Strategy 1: Look at parent text
                Element parent = el.parent();
                if (parent != null) {
                    String text = parent.text();
                    if (text.contains("/")) {
                        String countPart = extractCountFromText(text, difficulty);
                        if (countPart != null)
                            return Integer.parseInt(countPart);
                    }
                }

                // Strategy 2: Look at siblings
                Element next = el.nextElementSibling();
                if (next != null && next.text().contains("/")) {
                    String countPart = extractCountFromText(next.text(), "");
                    if (countPart != null)
                        return Integer.parseInt(countPart);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse {} count: {}", difficulty, e.getMessage());
        }
        return 0;
    }

    private String extractCountFromText(String text, String difficulty) {
        try {
            // Remove difficulty word if present
            String cleanText = text;
            if (!difficulty.isEmpty() && text.contains(difficulty)) {
                cleanText = text.substring(text.indexOf(difficulty) + difficulty.length()).trim();
            }
            // Find the "/" and take what's before it
            if (cleanText.contains("/")) {
                String countStr = cleanText.split("/")[0].replaceAll("[^0-9]", "");
                if (!countStr.isEmpty())
                    return countStr;
            }
        } catch (Exception e) {
        }
        return null;
    }

    public Optional<LeetcodeProfile> getProfile(String username) {
        return userRepository.findByUsername(username)
                .flatMap(user -> leetcodeProfileRepository.findByUserId(user.getId()));
    }
}
