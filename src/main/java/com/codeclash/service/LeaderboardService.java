package com.codeclash.service;

import com.codeclash.dto.LeaderboardDto;
import com.codeclash.entity.User;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    public List<LeaderboardDto> getLeaderboard() {
        List<User> users = userRepository.findTopByOrderByCoinsDesc();
        List<LeaderboardDto> leaderboard = new ArrayList<>();
        long rank = 1;
        for (User user : users) {
            leaderboard.add(LeaderboardDto.builder()
                    .rank(rank++)
                    .username(user.getUsername())
                    .displayName(user.getDisplayName())
                    .totalCoins(user.getCoins())
                    .problemsSolved(user.getProblemsSolved())
                    .build());
        }
        return leaderboard;
    }
}
