package com.codeclash.service;

import com.codeclash.dto.*;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BattleService {

        private final BattleRepository battleRepository;
        private final BattleParticipantRepository participantRepository;
        private final ProblemRepository problemRepository;
        private final UserRepository userRepository;
        private final BattleQueueRepository queueRepository;
        private final CoinService coinService;
        private final DockerSandboxService dockerSandboxService;

        public BattleService(BattleRepository battleRepository,
                        BattleParticipantRepository participantRepository,
                        ProblemRepository problemRepository,
                        UserRepository userRepository,
                        BattleQueueRepository queueRepository,
                        CoinService coinService,
                        DockerSandboxService dockerSandboxService) {
                this.battleRepository = battleRepository;
                this.participantRepository = participantRepository;
                this.problemRepository = problemRepository;
                this.userRepository = userRepository;
                this.queueRepository = queueRepository;
                this.coinService = coinService;
                this.dockerSandboxService = dockerSandboxService;
        }

        @Transactional
        public Map<String, Object> findMatch(String username, String difficultyInput) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                String difficulty = normalizeDifficulty(difficultyInput);
                int entryFee = getEntryFeeByDifficulty(difficulty);

                if (!coinService.hasEnoughCoins(user, entryFee)) {
                        throw new RuntimeException(
                                        "Not enough coins. " + difficulty + " battle requires " + entryFee + " coins");
                }

                // Check if user is already in a battle or in queue
                Optional<BattleParticipant> activeParticipant = participantRepository
                                .findTopByUserIdOrderByBattleIdDesc(user.getId());
                if (activeParticipant.isPresent()) {
                        Battle battle = activeParticipant.get().getBattle();
                        if ("ACTIVE".equals(battle.getStatus())) {
                                return Map.of("status", "matched", "battleId", battle.getId());
                        }
                }

                Optional<BattleQueue> waitingUser = queueRepository
                                .findFirstByDifficultyIgnoreCaseOrderByCreatedAtAsc(difficulty)
                                .filter(queue -> !queue.getUser().getId().equals(user.getId()));

                if (waitingUser.isEmpty()) {
                        BattleQueue queueEntry = queueRepository.findByUser(user)
                                        .orElseGet(BattleQueue::new);
                        queueEntry.setUser(user);
                        queueEntry.setDifficulty(difficulty);
                        queueEntry.setCreatedAt(LocalDateTime.now());
                        queueRepository.save(queueEntry);
                        return Map.of("status", "waiting", "difficulty", difficulty);
                }

                BattleQueue currentUserQueue = queueRepository.findByUser(user).orElse(null);
                if (currentUserQueue != null) {
                        queueRepository.delete(currentUserQueue);
                }

                BattleQueue matchedQueueEntry = waitingUser.get();
                User opponent = matchedQueueEntry.getUser();

                if (!coinService.hasEnoughCoins(opponent, entryFee)) {
                        queueRepository.delete(matchedQueueEntry);

                        BattleQueue queueEntry = queueRepository.findByUser(user)
                                        .orElseGet(BattleQueue::new);
                        queueEntry.setUser(user);
                        queueEntry.setDifficulty(difficulty);
                        queueEntry.setCreatedAt(LocalDateTime.now());
                        queueRepository.save(queueEntry);
                        return Map.of("status", "waiting", "difficulty", difficulty);
                }

                queueRepository.delete(matchedQueueEntry);

                coinService.spendCoins(user, entryFee, "Battle entry fee (" + difficulty + ")");
                coinService.spendCoins(opponent, entryFee, "Battle entry fee (" + difficulty + ")");

                // Randomly select a problem from selected difficulty
                List<Problem> problems = problemRepository.findByDifficulty(difficulty);
                if (problems.isEmpty()) {
                        List<Problem> allProblems = problemRepository.findAll();
                        problems = allProblems.stream()
                                        .filter(problem -> problem.getDifficulty() != null)
                                        .filter(problem -> difficulty.equalsIgnoreCase(problem.getDifficulty()))
                                        .collect(Collectors.toList());
                }

                if (problems.isEmpty()) {
                        throw new RuntimeException("No problems available for " + difficulty + " difficulty");
                }

                Problem randomProblem = problems.get(new java.util.Random().nextInt(problems.size()));

                Battle battle = new Battle();
                battle.setProblem(randomProblem);
                battle.setStatus("ACTIVE");
                battle.setStartedAt(LocalDateTime.now());
                battleRepository.save(battle);

                // Add both participants
                saveParticipant(battle, user);
                saveParticipant(battle, opponent);

                return Map.of(
                                "status", "matched",
                                "battleId", battle.getId(),
                                "problemName", randomProblem.getTitle(),
                                "opponentName", opponent.getDisplayName(),
                                "difficulty", difficulty);
        }

        private String normalizeDifficulty(String difficultyInput) {
                if (difficultyInput == null || difficultyInput.isBlank()) {
                        return "Easy";
                }

                return switch (difficultyInput.trim().toLowerCase()) {
                        case "easy" -> "Easy";
                        case "medium" -> "Medium";
                        case "hard" -> "Hard";
                        default -> throw new RuntimeException("Invalid difficulty. Use Easy, Medium, or Hard");
                };
        }

        private int getEntryFeeByDifficulty(String difficultyInput) {
                if (difficultyInput == null || difficultyInput.isBlank()) {
                        return 15;
                }

                return switch (difficultyInput.trim().toLowerCase()) {
                        case "easy" -> 15;
                        case "medium" -> 20;
                        case "hard" -> 30;
                        default -> 15;
                };
        }

        private void saveParticipant(Battle battle, User user) {
                BattleParticipant participant = new BattleParticipant();
                participant.setBattle(battle);
                participant.setUser(user);
                participantRepository.save(participant);
        }

        public Optional<Battle> getActiveBattleForUser(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return participantRepository.findTopByUserIdOrderByBattleIdDesc(user.getId())
                                .map(BattleParticipant::getBattle)
                                .filter(b -> "ACTIVE".equals(b.getStatus()));
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

                String language = normalizeLanguage(request.getLanguage());

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
                        int winnerReward = getEntryFeeByDifficulty(battle.getProblem().getDifficulty()) * 2;
                        coinService.awardCoins(user, winnerReward, "Battle victory reward (2x) #" + battleId);
                }

                return battle;
        }

        public Map<String, Object> runBattleCode(Long battleId, String username, BattleSubmitRequest request) {
                Battle battle = battleRepository.findById(battleId)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        throw new RuntimeException("Battle is not active");
                }

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                participantRepository.findByBattleId(battleId).stream()
                                .filter(p -> p.getUser().getId().equals(user.getId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Not a participant"));

                if (request == null || request.getCode() == null || request.getCode().isBlank()) {
                        throw new RuntimeException("Code is required");
                }

                String language = normalizeLanguage(request.getLanguage());
                DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(request.getCode(), language);

                return Map.of(
                                "stdout", result.getStdout() == null ? "" : result.getStdout(),
                                "stderr", result.getStderr() == null ? "" : result.getStderr(),
                                "exitCode", result.getExitCode(),
                                "timedOut", result.isTimedOut(),
                                "language", language);
        }

        @Transactional
        public Battle cancelBattle(Long battleId, String username) {
                Battle battle = battleRepository.findById(battleId)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        throw new RuntimeException("Only active battles can be cancelled");
                }

                User cancellingUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
                if (participants.size() < 2) {
                        throw new RuntimeException("Battle does not have enough participants");
                }

                BattleParticipant cancellingEntry = participants.stream()
                                .filter(p -> p.getUser().getId().equals(cancellingUser.getId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Not a participant of this battle"));

                BattleParticipant opponentEntry = participants.stream()
                                .filter(p -> !p.getUser().getId().equals(cancellingEntry.getUser().getId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Opponent not found"));

                User opponent = opponentEntry.getUser();
                int reward = getEntryFeeByDifficulty(battle.getProblem().getDifficulty()) * 2;

                battle.setStatus("CANCELLED");
                battle.setWinnerId(opponent.getId());
                battle.setEndedAt(LocalDateTime.now());
                battleRepository.save(battle);

                coinService.awardCoins(opponent, reward, "Battle cancel win reward (2x) #" + battleId);

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

        private String normalizeLanguage(String languageInput) {
                if (languageInput == null || languageInput.isBlank()) {
                        return "PYTHON";
                }

                String value = languageInput.trim().toLowerCase();
                return switch (value) {
                        case "python", "py" -> "PYTHON";
                        case "javascript", "js", "node" -> "JAVASCRIPT";
                        case "java" -> "JAVA";
                        default -> "PYTHON";
                };
        }
}
