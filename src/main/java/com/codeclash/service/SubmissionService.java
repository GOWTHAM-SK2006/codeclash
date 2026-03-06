package com.codeclash.service;

import com.codeclash.dto.SubmissionRequest;
import com.codeclash.dto.SubmissionResponse;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final CoinService coinService;
    private final DockerSandboxService dockerSandboxService;

    public SubmissionService(SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            CoinService coinService,
            DockerSandboxService dockerSandboxService) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.coinService = coinService;
        this.dockerSandboxService = dockerSandboxService;
    }

    @Transactional
    public SubmissionResponse submitCode(String username, SubmissionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        // Evaluate using Docker sandbox
        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute(request.getCode(),
                request.getLanguage());

        String status = "WRONG_ANSWER";
        String message = "Wrong answer";

        if (result.isTimedOut()) {
            status = "TIME_LIMIT_EXCEEDED";
            message = "Execution timed out (5s)";
        } else if (result.getExitCode() != 0) {
            status = "RUNTIME_ERROR";
            message = result.getStderr();
        } else {
            // Compare output
            String output = result.getStdout().trim();
            String expected = problem.getExpectedOutput() != null ? problem.getExpectedOutput().trim() : "";
            if (output.equals(expected)) {
                status = "ACCEPTED";
                message = "All test cases passed!";
            } else {
                message = "Expected: " + expected + "\nActual: " + output;
            }
        }

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setStatus(status);
        submission.setOutput(message);

        submissionRepository.save(submission);

        if ("ACCEPTED".equals(status)) {
            // Check if first time solving
            long prevAccepted = submissionRepository.countByUserIdAndStatus(user.getId(), "ACCEPTED");
            if (prevAccepted <= 1) { // 1 because we just saved this one
                user.setProblemsSolved(user.getProblemsSolved() + 1);
                userRepository.save(user);
                coinService.awardCoins(user, problem.getPoints(), "Solved: " + problem.getTitle());
            }
        }

        return toResponse(submission);
    }

    public List<SubmissionResponse> getUserSubmissions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return submissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private SubmissionResponse toResponse(Submission s) {
        SubmissionResponse res = new SubmissionResponse();
        res.setId(s.getId());
        res.setProblemId(s.getProblem().getId());
        res.setProblemTitle(s.getProblem().getTitle());
        res.setCode(s.getCode());
        res.setLanguage(s.getLanguage());
        res.setStatus(s.getStatus());
        res.setOutput(s.getOutput());
        res.setCreatedAt(s.getCreatedAt());
        return res;
    }
}
