package com.codeclash.service;

import com.codeclash.dto.*;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BattleService {

    private final BattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final CoinService coinService;

    @Transactional
    public Battle createBattle(String username, BattleRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        Battle battle = Battle.builder()
                .problem(problem)
                .status("WAITING")
                .build();
        battleRepository.save(battle);

        BattleParticipant participant = BattleParticipant.builder()
                .battle(battle)
                .user(user)
                .build();
        participantRepository.save(participant);

        return battle;
    }

    @Transactional
    public Battle joinBattle(Long battleId, String username) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"WAITING".equals(battle.getStatus())) {
            throw new RuntimeException("Battle already started or finished");
        }

        if (participantRepository.countByBattleId(battleId) >= 2) {
            throw new RuntimeException("Battle is full");
        }

        BattleParticipant participant = BattleParticipant.builder()
                .battle(battle)
                .user(user)
                .build();
        participantRepository.save(participant);

        battle.setStatus("ACTIVE");
        battle.setStartedAt(LocalDateTime.now());
        battleRepository.save(battle);

        return battle;
    }

    @Transactional
    public Battle submitBattleSolution(Long battleId, String username, BattleSubmitRequest request) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
        BattleParticipant myEntry = participants.stream()
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        myEntry.setCode(request.getCode());
        myEntry.setSubmittedAt(LocalDateTime.now());

        // Simple correctness check
        boolean correct = request.getCode() != null && !request.getCode().trim().isEmpty();
        myEntry.setIsCorrect(correct);
        participantRepository.save(myEntry);

        if (correct && battle.getWinnerId() == null) {
            battle.setWinnerId(user.getId());
            battle.setStatus("FINISHED");
            battle.setEndedAt(LocalDateTime.now());
            battleRepository.save(battle);
            coinService.awardCoins(user, 50, "Battle victory #" + battleId);
        }

        return battle;
    }

    public Battle getBattle(Long id) {
        return battleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Battle not found"));
    }

    public List<Battle> getAvailableBattles() {
        return battleRepository.findByStatus("WAITING");
    }

    public List<BattleParticipant> getBattleParticipants(Long battleId) {
        return participantRepository.findByBattleId(battleId);
    }
}
