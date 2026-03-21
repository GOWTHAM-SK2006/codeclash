package com.codeclash.service;

import com.codeclash.dto.*;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BattleService {

        private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

        private final BattleRepository battleRepository;
        private final BattleParticipantRepository participantRepository;
        private final ProblemRepository problemRepository;
        private final UserRepository userRepository;
        private final BattleQueueRepository queueRepository;
        private final CoinService coinService;
        private final DockerSandboxService dockerSandboxService;
        private final TemplateValidationService templateValidationService;
        private final ProblemService problemService;

        public BattleService(BattleRepository battleRepository,
                        BattleParticipantRepository participantRepository,
                        ProblemRepository problemRepository,
                        UserRepository userRepository,
                        BattleQueueRepository queueRepository,
                        CoinService coinService,
                        DockerSandboxService dockerSandboxService,
                        TemplateValidationService templateValidationService,
                        ProblemService problemService) {
                this.battleRepository = battleRepository;
                this.participantRepository = participantRepository;
                this.problemRepository = problemRepository;
                this.userRepository = userRepository;
                this.queueRepository = queueRepository;
                this.coinService = coinService;
                this.dockerSandboxService = dockerSandboxService;
                this.templateValidationService = templateValidationService;
                this.problemService = problemService;
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

                // Pre-battle check: Validate and auto-fix template if needed
                templateValidationService.autoFixIfNeeded(randomProblem);

                Battle battle = new Battle();
                battle.setProblem(randomProblem);
                battle.setStatus("ACTIVE");
                battle.setStartedAt(LocalDateTime.now());
                battle.setTimeLimitSeconds(getBattleDurationSecondsByDifficulty(randomProblem.getDifficulty()));
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
                battle.setTimeLimitSeconds(getBattleDurationSecondsByDifficulty(problem.getDifficulty()));
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
                if (battle.getTimeLimitSeconds() == null || battle.getTimeLimitSeconds() <= 0) {
                        battle.setTimeLimitSeconds(
                                        getBattleDurationSecondsByDifficulty(battle.getProblem().getDifficulty()));
                }
                battleRepository.save(battle);

                return battle;
        }

        @Transactional
        public Battle submitBattleSolution(Long battleId, String username, BattleSubmitRequest request) {
                Battle battle = battleRepository.findById(battleId)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (isBattleTimeExpired(battle)) {
                        return concludeBattleAsDraw(battle);
                }

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        throw new RuntimeException("Battle is not active");
                }

                List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
                BattleParticipant myEntry = participants.stream()
                                .filter(p -> p.getUser().getId().equals(user.getId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Not a participant"));

                myEntry.setCode(request.getCode());
                myEntry.setSubmittedAt(LocalDateTime.now());

                String language = normalizeLanguage(request.getLanguage());

                boolean correct;
                if ("PYTHON".equals(language)) {
                        correct = evaluatePythonBattleSubmission(battle.getProblem(), request.getCode());
                } else if ("JAVA".equals(language)) {
                        correct = evaluateJavaBattleSubmission(battle.getProblem(), request.getCode());
                } else {
                        correct = evaluateGenericBattleSubmission(battle.getProblem(), request.getCode(), language);
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

                if (isBattleTimeExpired(battle)) {
                        concludeBattleAsDraw(battle);
                        throw new RuntimeException("Battle time expired. Match ended in a draw");
                }

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
                DockerSandboxService.ExecutionResult result;
                if ("PYTHON".equals(language)) {
                        result = runPythonBattleCode(battle.getProblem(), request.getCode(), request.getInputData());
                } else if ("JAVA".equals(language)) {
                        result = runJavaBattleCode(battle.getProblem(), request.getCode(), request.getInputData());
                } else {
                        result = runGenericBattleCode(battle.getProblem(), request.getCode(), language,
                                        request.getInputData());
                }

                String cleanedStderr = cleanRunnerWarning(result.getStderr());

                return Map.of(
                                "stdout", result.getStdout() == null ? "" : result.getStdout(),
                                "stderr", cleanedStderr,
                                "exitCode", result.getExitCode(),
                                "timedOut", result.isTimedOut(),
                                "language", language);
        }

        @Transactional
        public Battle cancelBattle(Long battleId, String username) {
                Battle battle = battleRepository.findById(battleId)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));

                if (isBattleTimeExpired(battle)) {
                        return concludeBattleAsDraw(battle);
                }

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

        @Transactional
        public Battle timeoutBattle(Long battleId, String username) {
                Battle battle = battleRepository.findById(battleId)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                participantRepository.findByBattleId(battleId).stream()
                                .filter(p -> p.getUser().getId().equals(user.getId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Not a participant"));

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        return battle;
                }

                return concludeBattleAsDraw(battle);
        }

        public Battle getBattle(Long id) {
                Battle battle = battleRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Battle not found"));

                if (isBattleTimeExpired(battle)) {
                        return concludeBattleAsDraw(battle);
                }

                return battle;
        }

        public long getBattleRemainingSeconds(Battle battle) {
                if (battle == null || battle.getStartedAt() == null) {
                        return resolveBattleTimeLimitSeconds(battle);
                }

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        return 0;
                }

                int timeLimitSeconds = resolveBattleTimeLimitSeconds(battle);
                long elapsedSeconds = Duration.between(battle.getStartedAt(), LocalDateTime.now()).getSeconds();
                return Math.max(0, timeLimitSeconds - Math.max(0, elapsedSeconds));
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
                        case "c" -> "C";
                        case "cpp", "c++" -> "CPP";
                        default -> "PYTHON";
                };
        }

        private int getBattleDurationSecondsByDifficulty(String difficultyInput) {
                if (difficultyInput == null || difficultyInput.isBlank()) {
                        return 600;
                }

                return switch (difficultyInput.trim().toLowerCase()) {
                        case "easy" -> 600;
                        case "medium" -> 1200;
                        case "hard" -> 1800;
                        default -> 600;
                };
        }

        private boolean isBattleTimeExpired(Battle battle) {
                if (battle == null || battle.getStartedAt() == null) {
                        return false;
                }

                if (!"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        return false;
                }

                int timeLimitSeconds = resolveBattleTimeLimitSeconds(battle);

                long elapsedSeconds = Duration.between(battle.getStartedAt(), LocalDateTime.now()).getSeconds();
                return elapsedSeconds >= timeLimitSeconds;
        }

        private int resolveBattleTimeLimitSeconds(Battle battle) {
                if (battle == null) {
                        return 600;
                }

                if (battle.getTimeLimitSeconds() != null && battle.getTimeLimitSeconds() > 0) {
                        return battle.getTimeLimitSeconds();
                }

                return getBattleDurationSecondsByDifficulty(
                                battle.getProblem() != null ? battle.getProblem().getDifficulty() : null);
        }

        private Battle concludeBattleAsDraw(Battle battle) {
                if (battle == null || !"ACTIVE".equalsIgnoreCase(battle.getStatus())) {
                        return battle;
                }

                battle.setStatus("CANCELLED");
                battle.setWinnerId(null);
                battle.setEndedAt(LocalDateTime.now());
                return battleRepository.save(battle);
        }

        private boolean evaluateBattleSubmission(Problem problem, String userCode, String language) {
                List<ProblemService.TestCaseData> testCases = problemService.parseTestCases(problem);

                if (testCases.isEmpty()) {
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(userCode, language,
                                        "");
                        if (result.isTimedOut() || result.getExitCode() != 0) {
                                return false;
                        }
                        return normalizeOutput(result.getStdout()).equals(normalizeOutput(problem.getExpectedOutput()));
                }

                for (ProblemService.TestCaseData testCase : testCases) {
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(userCode, language,
                                        testCase.input());
                        if (result.isTimedOut() || result.getExitCode() != 0) {
                                return false;
                        }

                        String actual = normalizeOutput(result.getStdout());
                        String expected = normalizeOutput(testCase.expected());
                        if (!actual.equals(expected)) {
                                return false;
                        }
                }

                return true;
        }

        private DockerSandboxService.ExecutionResult runBattleCode(Problem problem, String userCode, String language,
                        String selectedInputData) {
                if (selectedInputData != null && !selectedInputData.isBlank()) {
                        return dockerSandboxService.execute(userCode, language, selectedInputData);
                }

                List<ProblemService.TestCaseData> testCases = problemService.parseTestCases(problem);
                if (testCases.isEmpty()) {
                        return dockerSandboxService.execute(userCode, language, "");
                }

                return dockerSandboxService.execute(userCode, language, testCases.get(0).input());
        }

        private String normalizeOutput(String value) {
                return safe(value).replace("\r\n", "\n").trim();
        }

        private String safe(String value) {
                return value == null ? "" : value;
        }

        private String cleanRunnerWarning(String stderr) {
                String text = safe(stderr);
                String warning = "Docker not available. Executed using local fallback runner.";
                if (text.startsWith(warning)) {
                        text = text.substring(warning.length()).trim();
                }
                return text;
        }

}
