package com.codeclash.service;

import com.codeclash.dto.SubmissionRequest;
import com.codeclash.dto.SubmissionResponse;
import com.codeclash.entity.*;
import com.codeclash.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final CoinService coinService;

    @Transactional
    public SubmissionResponse submitCode(String username, SubmissionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        // Simple evaluation: compare output with expected
        String status = evaluateSubmission(request.getCode(), problem);

        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .status(status)
                .output(status.equals("ACCEPTED") ? "All test cases passed!" : "Wrong answer or runtime error")
                .build();

        submissionRepository.save(submission);

        if ("ACCEPTED".equals(status)) {
            // Check if first time solving
            long prevAccepted = submissionRepository.countByUserIdAndStatus(user.getId(), "ACCEPTED");
            if (prevAccepted <= 1) {
                user.setProblemsSolved(user.getProblemsSolved() + 1);
                userRepository.save(user);
                coinService.awardCoins(user, problem.getPoints(), "Solved: " + problem.getTitle());
            }
        }

        return SubmissionResponse.builder()
                .id(submission.getId())
                .problemId(problem.getId())
                .problemTitle(problem.getTitle())
                .code(submission.getCode())
                .language(submission.getLanguage())
                .status(submission.getStatus())
                .output(submission.getOutput())
                .createdAt(submission.getCreatedAt())
                .build();
    }

    public List<SubmissionResponse> getUserSubmissions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return submissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String evaluateSubmission(String code, Problem problem) {
        // Simple evaluation — in production, this would use Docker sandboxing
        if (code != null && !code.trim().isEmpty()) {
            if (problem.getExpectedOutput() != null && code.contains(problem.getExpectedOutput().trim())) {
                return "ACCEPTED";
            }
            return "WRONG_ANSWER";
        }
        return "COMPILATION_ERROR";
    }

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .problemId(s.getProblem().getId())
                .problemTitle(s.getProblem().getTitle())
                .code(s.getCode())
                .language(s.getLanguage())
                .status(s.getStatus())
                .output(s.getOutput())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
