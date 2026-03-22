package com.codeclash.service;

import com.codeclash.dto.LeaderboardDto;
import com.codeclash.entity.User;
import com.codeclash.repository.BattleParticipantRepository;
import com.codeclash.repository.BattleRepository;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;

    public List<LeaderboardDto> getLeaderboard() {
        List<User> users = userRepository.findAll();
        List<LeaderboardDto> leaderboard = new ArrayList<>();

        for (User user : users) {
            leaderboard.add(LeaderboardDto.builder()
                    .username(user.getUsername())
                    .displayName(user.getDisplayName())
                    .totalCoins(user.getCoins())
                    .problemsSolved(user.getProblemsSolved())
                    .battleWins(battleRepository.countByWinnerId(user.getId()))
                    .battlesAttended(participantRepository.countByUserId(user.getId()))
                    .build());
        }
        return leaderboard;
    }
}
