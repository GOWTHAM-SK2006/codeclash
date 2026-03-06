package com.codeclash.service;

import com.codeclash.dto.*;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BattleService {

        private final BattleRepository battleRepository;
        private final BattleParticipantRepository participantRepository;
        private final ProblemRepository problemRepository;
        private final UserRepository userRepository;
        private final CoinService coinService;
        private final DockerSandboxService dockerSandboxService;

        public BattleService(BattleRepository battleRepository,
                        BattleParticipantRepository participantRepository,
                        ProblemRepository problemRepository,
                        UserRepository userRepository,
                        CoinService coinService,
                        DockerSandboxService dockerSandboxService) {
                this.battleRepository = battleRepository;
                this.participantRepository = participantRepository;
                this.problemRepository = problemRepository;
                this.userRepository = userRepository;
                this.coinService = coinService;
                this.dockerSandboxService = dockerSandboxService;
        }

        @Transactional
        public Battle createBattle(String username, BattleRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Problem problem = problemRepository.findById(request.getProblemId())
                                .orElseThrow(() -> new RuntimeException("Problem not found"));

                Battle battle = new Battle();
                battle.setProblem(problem);
                battle.setStatus("WAITING");
                battleRepository.save(battle);

                BattleParticipant participant = new BattleParticipant();
                participant.setBattle(battle);
                participant.setUser(user);
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

                BattleParticipant participant = new BattleParticipant();
                participant.setBattle(battle);
                participant.setUser(user);
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

                // Evaluate using Docker sandbox
                // Note: BattleSubmitRequest should ideally include the language.
                // Assuming "PYTHON" for now or retrieving from problem if language-specific.
                // For simplicity, we'll try to find a reasonable default or check if request
                // has it.
                String language = "PYTHON";

                DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(request.getCode(), language);

                boolean correct = false;
                if (!result.isTimedOut() && result.getExitCode() == 0) {
                        String output = result.getStdout().trim();
                        String expected = battle.getProblem().getExpectedOutput() != null
                                        ? battle.getProblem().getExpectedOutput().trim()
                                        : "";
                        correct = output.equals(expected);
                }

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
