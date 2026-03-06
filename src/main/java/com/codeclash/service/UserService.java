package com.codeclash.service;

import com.codeclash.dto.DashboardDto;
import com.codeclash.entity.User;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public DashboardDto getDashboard(String username) {
        User user = getUserByUsername(username);
        List<User> ranked = userRepository.findTopByOrderByCoinsDesc();
        long rank = 1;
        for (User u : ranked) {
            if (u.getId().equals(user.getId()))
                break;
            rank++;
        }

        return DashboardDto.builder()
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .totalCoins(user.getCoins())
                .problemsSolved(user.getProblemsSolved())
                .userRank(rank)
                .totalUsers((long) ranked.size())
                .build();
    }
}
