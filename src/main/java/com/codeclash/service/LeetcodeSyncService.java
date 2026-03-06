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
            String url = "https://leetcode.com/" + profile.getLeetcodeUsername();
            Document doc = Jsoup.connect(url)
                    .userAgent(
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .get();

            // Extract solved counts
            // Note: LeetCode's DOM structure might change, but typically solved counts are
            // in specific spans/divs.
            // We'll look for specific text patterns if classes are dynamic.
            int easy = parseCount(doc, "Easy");
            int medium = parseCount(doc, "Medium");
            int hard = parseCount(doc, "Hard");

            // Calculate new solved counts
            int newEasy = Math.max(0, easy - profile.getEasySolved());
            int newMedium = Math.max(0, medium - profile.getMediumSolved());
            int newHard = Math.max(0, hard - profile.getHardSolved());

            int earnedCoins = (newEasy * COINS_EASY) + (newMedium * COINS_MEDIUM) + (newHard * COINS_HARD);

            if (earnedCoins > 0) {
                String reason = String.format("LeetCode Sync: +%d Easy, +%d Medium, +%d Hard", newEasy, newMedium,
                        newHard);
                coinService.awardCoins(user, earnedCoins, reason);
                profile.setTotalCoinsEarned(profile.getTotalCoinsEarned() + earnedCoins);
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
        // LeetCode solved counts are often in elements containing the difficulty text
        // Example: <span>Easy</span> ... <span>40/700</span>
        // This is a heuristic based on common profile structures.
        try {
            Elements elements = doc.getElementsContainingOwnText(difficulty);
            for (Element el : elements) {
                // Look at the parent or sibling for the numeric value
                Element parent = el.parent();
                if (parent != null) {
                    String text = parent.text();
                    // Text usually looks like "Easy 40/700" or similar
                    // We want the number right after the difficulty word
                    String part = text.substring(text.indexOf(difficulty) + difficulty.length()).trim();
                    String countStr = part.split("/")[0].replaceAll("[^0-9]", "");
                    if (!countStr.isEmpty()) {
                        return Integer.parseInt(countStr);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse {} count", difficulty);
        }
        return 0;
    }

    public Optional<LeetcodeProfile> getProfile(String username) {
        return userRepository.findByUsername(username)
                .flatMap(user -> leetcodeProfileRepository.findByUserId(user.getId()));
    }
}
