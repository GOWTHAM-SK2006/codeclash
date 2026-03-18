package com.codeclash.service;

import com.codeclash.dto.*;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        case "c" -> "C";
                        case "cpp", "c++" -> "CPP";
                        default -> "PYTHON";
                };
        }

        private boolean evaluateGenericBattleSubmission(Problem problem, String userCode, String language) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (testCases.isEmpty()) {
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(userCode, language, "");
                        if (result.isTimedOut() || result.getExitCode() != 0) {
                                return false;
                        }
                        return normalizeOutput(result.getStdout()).equals(normalizeOutput(problem.getExpectedOutput()));
                }

                for (TestCaseData testCase : testCases) {
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

        private DockerSandboxService.ExecutionResult runGenericBattleCode(Problem problem, String userCode, String language,
                        String selectedInputData) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (selectedInputData != null) {
                        return dockerSandboxService.execute(userCode, language, selectedInputData);
                }

                if (testCases.isEmpty()) {
                        return dockerSandboxService.execute(userCode, language, "");
                }

                TestCaseData firstCase = testCases.get(0);
                return dockerSandboxService.execute(userCode, language, firstCase.input());
        }

        private boolean evaluatePythonBattleSubmission(Problem problem, String userCode) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (testCases.isEmpty()) {
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(userCode, "PYTHON");
                        if (result.isTimedOut() || result.getExitCode() != 0) {
                                return false;
                        }
                        return normalizeOutput(result.getStdout()).equals(normalizeOutput(problem.getExpectedOutput()));
                }

                for (TestCaseData testCase : testCases) {
                        String codeToRun = buildExecutablePythonCode(userCode, problem, testCase.input());
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(codeToRun, "PYTHON");
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

        private DockerSandboxService.ExecutionResult runPythonBattleCode(Problem problem, String userCode,
                        String selectedInputData) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (selectedInputData != null) {
                        String codeToRun = buildExecutablePythonCode(userCode, problem, selectedInputData);
                        return dockerSandboxService.execute(codeToRun, "PYTHON");
                }

                if (testCases.isEmpty()) {
                        return dockerSandboxService.execute(userCode, "PYTHON");
                }

                TestCaseData firstCase = testCases.get(0);
                String codeToRun = buildExecutablePythonCode(userCode, problem, firstCase.input());
                return dockerSandboxService.execute(codeToRun, "PYTHON");
        }

        private boolean evaluateJavaBattleSubmission(Problem problem, String userCode) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (testCases.isEmpty()) {
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(userCode, "JAVA");
                        if (result.isTimedOut() || result.getExitCode() != 0) {
                                return false;
                        }
                        return normalizeOutput(result.getStdout()).equals(normalizeOutput(problem.getExpectedOutput()));
                }

                for (TestCaseData testCase : testCases) {
                        String codeToRun = buildExecutableJavaCode(userCode, problem, testCase.input());
                        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(codeToRun, "JAVA");
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

        private DockerSandboxService.ExecutionResult runJavaBattleCode(Problem problem, String userCode,
                        String selectedInputData) {
                List<TestCaseData> testCases = parseTestCases(problem);

                if (selectedInputData != null) {
                        String codeToRun = buildExecutableJavaCode(userCode, problem, selectedInputData);
                        return dockerSandboxService.execute(codeToRun, "JAVA");
                }

                if (testCases.isEmpty()) {
                        return dockerSandboxService.execute(userCode, "JAVA");
                }

                TestCaseData firstCase = testCases.get(0);
                String codeToRun = buildExecutableJavaCode(userCode, problem, firstCase.input());
                return dockerSandboxService.execute(codeToRun, "JAVA");
        }

        private String buildExecutableJavaCode(String userCode, Problem problem, String rawInput) {
                String wrapperConfigJson = problem != null ? safe(problem.getWrapperConfig()) : "";
                if (!wrapperConfigJson.isBlank()) {
                        try {
                                JsonNode config = OBJECT_MAPPER.readTree(wrapperConfigJson);
                                return buildJavaWrapper(userCode, config, rawInput);
                        } catch (Exception ignored) {
                        }
                }

                String functionName = extractFirstJavaMethodName(userCode);
                if (functionName != null) {
                        return buildJavaAutoWrapper(userCode, functionName, rawInput);
                }
                return userCode;
        }

        /**
         * Chooses the right execution strategy:
         * 1. Problem has wrapperConfig  → LeetCode-style function wrapper (preferred)
         * 2. User code calls input()    → patch builtins.input with stdin lines
         * 3. Auto-detect function name  → generic JSON-parsing wrapper
         * 4. Plain script               → pipe stdin as-is
         */
        private String buildExecutablePythonCode(String userCode, Problem problem, String rawInput) {
                String wrapperConfigJson = problem != null ? safe(problem.getWrapperConfig()) : "";
                if (!wrapperConfigJson.isBlank()) {
                        try {
                                JsonNode config = OBJECT_MAPPER.readTree(wrapperConfigJson);
                                return buildLeetCodeWrapper(userCode, config, rawInput);
                        } catch (Exception ignored) {
                        }
                }
                if (usesInputFunction(userCode)) {
                        return buildPythonInputPatchedScript(userCode, rawInput);
                }
                String functionName = extractFirstPythonFunctionName(userCode);
                if (functionName != null) {
                        return buildAutoFunctionWrapper(userCode, functionName, rawInput);
                }
                return buildPythonInputPatchedScript(userCode, rawInput);
        }

        private boolean usesInputFunction(String userCode) {
                if (userCode == null || userCode.isBlank()) {
                        return false;
                }
                return Pattern.compile("\\binput\\s*\\(").matcher(userCode).find();
        }

        private String buildPythonInputPatchedScript(String userCode, String rawInput) {
                String inputLiteral = toPythonStringLiteral(rawInput == null ? "" : rawInput);
                return "import builtins\n"
                                + "__cc_raw = " + inputLiteral + "\n"
                                + "__cc_lines = __cc_raw.splitlines()\n"
                                + "__cc_iter = iter(__cc_lines)\n"
                                + "builtins.input = lambda: next(__cc_iter, '')\n\n"
                                + userCode;
        }

        private List<TestCaseData> parseTestCases(Problem problem) {
                List<TestCaseData> jsonCases = parseJsonTestCases(problem.getTestCases());
                if (!jsonCases.isEmpty()) {
                        return jsonCases;
                }

                List<TestCaseData> legacyCases = parseLegacyTextCases(problem.getTestCases());
                if (!legacyCases.isEmpty()) {
                        return legacyCases;
                }

                String expected = safe(problem.getExpectedOutput()).trim();
                if (!expected.isBlank()) {
                        return List.of(new TestCaseData("", expected));
                }

                return List.of();
        }

        private List<TestCaseData> parseJsonTestCases(String raw) {
                if (raw == null || raw.isBlank() || !raw.trim().startsWith("[")) {
                        return List.of();
                }

                try {
                        JsonNode root = OBJECT_MAPPER.readTree(raw);
                        if (!root.isArray()) {
                                return List.of();
                        }

                        List<TestCaseData> cases = new ArrayList<>();
                        for (JsonNode item : root) {
                                String input;
                                JsonNode inputNode = item.path("input");
                                if (inputNode.isArray()) {
                                        List<String> lines = new ArrayList<>();
                                        for (JsonNode line : inputNode) {
                                                lines.add(line.asText(""));
                                        }
                                        input = String.join("\n", lines);
                                } else {
                                        input = inputNode.asText("");
                                }
                                String expected = item.path("expected").asText("");
                                if (!expected.isBlank()) {
                                        cases.add(new TestCaseData(input, expected));
                                }
                        }
                        return cases;
                } catch (Exception ignored) {
                        return List.of();
                }
        }

        private List<TestCaseData> parseLegacyTextCases(String raw) {
                if (raw == null || raw.isBlank()) {
                        return List.of();
                }

                List<TestCaseData> cases = new ArrayList<>();
                Pattern pattern = Pattern.compile("Input:\\s*(.*?)\\s*Expected:\\s*(.*?)(?:\\r?\\n\\r?\\n|$)",
                                Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(raw);
                while (matcher.find()) {
                        String input = stripQuotes(safe(matcher.group(1)).trim());
                        String expected = stripQuotes(safe(matcher.group(2)).trim());
                        if (!expected.isBlank()) {
                                cases.add(new TestCaseData(input, expected));
                        }
                }

                if (!cases.isEmpty()) {
                        return cases;
                }

                Matcher inputMatcher = Pattern.compile("Input:\\s*(.*)", Pattern.CASE_INSENSITIVE).matcher(raw);
                Matcher expectedMatcher = Pattern.compile("Expected:\\s*(.*)", Pattern.CASE_INSENSITIVE).matcher(raw);
                String input = inputMatcher.find() ? stripQuotes(safe(inputMatcher.group(1)).trim()) : "";
                if (expectedMatcher.find()) {
                        String expected = stripQuotes(safe(expectedMatcher.group(1)).trim());
                        if (!expected.isBlank()) {
                                return List.of(new TestCaseData(input, expected));
                        }
                }

                return List.of();
        }

        private String extractFirstPythonFunctionName(String code) {
                if (code == null || code.isBlank()) {
                        return null;
                }

                Matcher matcher = Pattern.compile("(?m)^\\s*def\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(").matcher(code);
                return matcher.find() ? matcher.group(1) : null;
        }

        /**
         * LeetCode-style wrapper: reads each parameter from a separate stdin line,
         * converts to the declared type, calls the user's function, prints the result.
         *
         * wrapperConfig JSON example:
         *   {"functionName":"twoSum","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}
         *
         * Supported param types: json (list/dict/any), int, float, bool, str
         */
        private String buildLeetCodeWrapper(String userCode, JsonNode config, String rawInput) {
                String functionName = config.path("functionName").asText("").trim();
                JsonNode params = config.path("params");
                JsonNode inputs = config.path("inputs");

                if ((!params.isArray() || params.size() == 0) && inputs.isArray() && inputs.size() > 0) {
                        params = mapInputsToParams(inputs);
                }

                if (functionName.isEmpty() || !params.isArray() || params.size() == 0) {
                        return buildPythonInputPatchedScript(userCode, rawInput);
                }

                StringBuilder sb = new StringBuilder();
                sb.append(userCode).append("\n\n");
                sb.append("import sys\n");
                sb.append("import json\n\n");
                sb.append("if __name__ == '__main__':\n");
                sb.append("    _lines = sys.stdin.read().strip().split('\\n')\n");

                List<String> argNames = new ArrayList<>();
                for (int i = 0; i < params.size(); i++) {
                        JsonNode p = params.get(i);
                        String name = p.path("name").asText("_arg" + i);
                        String type = p.path("type").asText("str").toLowerCase();
                        argNames.add(name);
                        String parse = switch (type) {
                                case "json", "list", "array", "dict" -> "json.loads(_lines[" + i + "])";
                                case "int" -> "int(_lines[" + i + "].strip())";
                                case "float" -> "float(_lines[" + i + "].strip())";
                                case "bool" -> "_lines[" + i + "].strip() == 'True'";
                                default -> "str(_lines[" + i + "])";
                        };
                        sb.append("    ").append(name).append(" = ").append(parse).append("\n");
                }

                sb.append("    _result = ").append(functionName).append("(").append(String.join(", ", argNames)).append(")\n");
                sb.append("    if _result is not None:\n");
                sb.append("        print(_result)\n");

                return sb.toString();
        }

        private String buildJavaWrapper(String userCode, JsonNode config, String rawInput) {
                String functionName = config.path("functionName").asText("").trim();
                JsonNode params = config.path("params");
                JsonNode inputs = config.path("inputs");

                if ((!params.isArray() || params.size() == 0) && inputs.isArray() && inputs.size() > 0) {
                        params = mapInputsToParams(inputs);
                }

                if (functionName.isEmpty() || !params.isArray() || params.size() == 0) {
                        return userCode;
                }

                String inputLiteral = toJavaStringLiteral(rawInput == null ? "" : rawInput);
                StringBuilder sb = new StringBuilder();
                sb.append("import java.util.*;\n");
                sb.append(userCode).append("\n\n");
                sb.append("class __CodeClashMain {\n");
                sb.append("    private static int[] parseIntArray(String line) {\n");
                sb.append("        String clean = line == null ? \"\" : line.trim();\n");
                sb.append("        clean = clean.replaceAll(\"[\\\\[\\\\]\\\\s]\", \"\");\n");
                sb.append("        if (clean.isEmpty()) return new int[0];\n");
                sb.append("        String[] parts = clean.split(\",\");\n");
                sb.append("        int[] nums = new int[parts.length];\n");
                sb.append("        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n");
                sb.append("        return nums;\n");
                sb.append("    }\n");
                sb.append("    public static void main(String[] args) {\n");
                sb.append("        String[] __lines = ").append(inputLiteral).append(".split(\"\\n\", -1);\n");

                List<String> argVars = new ArrayList<>();
                for (int i = 0; i < params.size(); i++) {
                        JsonNode p = params.get(i);
                        String name = p.path("name").asText("arg" + i);
                        String type = p.path("type").asText("str").toLowerCase();
                        String lineRef = "(__lines.length > " + i + " ? __lines[" + i + "] : \"\")";

                        if ("int".equals(type) || "number".equals(type)) {
                                sb.append("        int ").append(name).append(" = Integer.parseInt(").append(lineRef)
                                                .append(".trim());\n");
                        } else if ("float".equals(type)) {
                                sb.append("        double ").append(name).append(" = Double.parseDouble(").append(lineRef)
                                                .append(".trim());\n");
                        } else if ("bool".equals(type) || "boolean".equals(type)) {
                                sb.append("        boolean ").append(name).append(" = \"true\".equalsIgnoreCase(")
                                                .append(lineRef).append(".trim());\n");
                        } else if ("json".equals(type) || "array".equals(type) || "list".equals(type)) {
                                sb.append("        int[] ").append(name).append(" = parseIntArray(").append(lineRef)
                                                .append(");\n");
                        } else {
                                sb.append("        String ").append(name).append(" = ").append(lineRef).append(";\n");
                        }
                        argVars.add(name);
                }

                sb.append("        Solution __sol = new Solution();\n");
                sb.append("        Object __result = __sol.").append(functionName).append("(")
                                .append(String.join(", ", argVars)).append(");\n");
                sb.append("        if (__result == null) return;\n");
                sb.append("        if (__result instanceof int[]) {\n");
                sb.append("            System.out.println(Arrays.toString((int[]) __result));\n");
                sb.append("        } else if (__result instanceof long[]) {\n");
                sb.append("            System.out.println(Arrays.toString((long[]) __result));\n");
                sb.append("        } else if (__result instanceof Object[]) {\n");
                sb.append("            System.out.println(Arrays.toString((Object[]) __result));\n");
                sb.append("        } else {\n");
                sb.append("            System.out.println(__result);\n");
                sb.append("        }\n");
                sb.append("    }\n");
                sb.append("}\n");

                return sb.toString();
        }

        private String buildJavaAutoWrapper(String userCode, String functionName, String rawInput) {
                String config = "{\"functionName\":\"" + functionName
                                + "\",\"params\":[{\"name\":\"arg0\",\"type\":\"array\"},{\"name\":\"arg1\",\"type\":\"int\"}]}";
                try {
                        JsonNode node = OBJECT_MAPPER.readTree(config);
                        return buildJavaWrapper(userCode, node, rawInput);
                } catch (Exception ignored) {
                        return userCode;
                }
        }

        private JsonNode mapInputsToParams(JsonNode inputs) {
                try {
                        List<Map<String, String>> params = new ArrayList<>();
                        for (int i = 0; i < inputs.size(); i++) {
                                String rawType = inputs.get(i).asText("str").toLowerCase();
                                String mappedType = switch (rawType) {
                                        case "array" -> "json";
                                        case "number" -> "int";
                                        case "string" -> "str";
                                        case "boolean" -> "bool";
                                        default -> rawType;
                                };
                                params.add(Map.of("name", "arg" + i, "type", mappedType));
                        }
                        return OBJECT_MAPPER.valueToTree(params);
                } catch (Exception ignored) {
                        return OBJECT_MAPPER.createArrayNode();
                }
        }

        /**
         * Fallback wrapper: auto-parses each stdin line as JSON → int → str,
         * then calls the detected function with those args.
         */
        private String buildAutoFunctionWrapper(String userCode, String functionName, String rawInput) {
                String inputLiteral = toPythonStringLiteral(rawInput == null ? "" : rawInput);
                return userCode + "\n\n"
                                + "import sys, json\n\n"
                                + "if __name__ == '__main__':\n"
                                + "    _raw = " + inputLiteral + "\n"
                                + "    _lines = [l for l in _raw.strip().split('\\n') if l.strip()]\n"
                                + "    _args = []\n"
                                + "    for _l in _lines:\n"
                                + "        try:\n"
                                + "            _args.append(json.loads(_l))\n"
                                + "        except Exception:\n"
                                + "            try:\n"
                                + "                _args.append(int(_l.strip()))\n"
                                + "            except Exception:\n"
                                + "                _args.append(_l)\n"
                                + "    _result = " + functionName + "(*_args)\n"
                                + "    if _result is not None:\n"
                                + "        print(_result)\n";
        }

        private String toPythonStringLiteral(String value) {
                return "'" + value
                                .replace("\\", "\\\\")
                                .replace("'", "\\'")
                                .replace("\r", "\\r")
                                .replace("\n", "\\n") + "'";
        }

        private String toJavaStringLiteral(String value) {
                return "\"" + value
                                .replace("\\", "\\\\")
                                .replace("\"", "\\\"")
                                .replace("\r", "\\r")
                                .replace("\n", "\\n") + "\"";
        }

        private String extractFirstJavaMethodName(String code) {
                if (code == null || code.isBlank()) {
                        return null;
                }
                Matcher matcher = Pattern.compile(
                                "(?m)^\\s*public\\s+(?:static\\s+)?(?:[a-zA-Z_][a-zA-Z0-9_<>\\[\\]]*\\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(")
                                .matcher(code);
                return matcher.find() ? matcher.group(1) : null;
        }

        private String stripQuotes(String value) {
                if (value == null || value.length() < 2) {
                        return safe(value);
                }
                if ((value.startsWith("\"") && value.endsWith("\""))
                                || (value.startsWith("'") && value.endsWith("'"))) {
                        return value.substring(1, value.length() - 1);
                }
                return value;
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

        private record TestCaseData(String input, String expected) {
        }
}
