package com.codeclash.controller;

import com.codeclash.entity.User;
import com.codeclash.service.LeetcodeSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/leetcode")
@RequiredArgsConstructor
public class LeetcodeController {

    private final LeetcodeSyncService leetcodeSyncService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request, Authentication auth) {
        String leetcodeUsername = request.get("username");
        String email = request.get("email");
        if (leetcodeUsername == null || leetcodeUsername.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and email are required"));
        }
        try {
            User user = (User) auth.getPrincipal();
            leetcodeSyncService.sendVerificationOtp(user.getUsername(), leetcodeUsername, email);
            return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String otp = request.get("otp");
        if (username == null || username.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and OTP are required"));
        }
        try {
            leetcodeSyncService.verifyOtp(username, otp);
            return ResponseEntity.ok(Map.of("message", "LeetCode profile verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody Map<String, String> request, Authentication auth) {
        String leetcodeUsername = request.get("username");
        if (leetcodeUsername == null || leetcodeUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        try {
            User user = (User) auth.getPrincipal();
            return ResponseEntity.ok(leetcodeSyncService.connectProfile(user.getUsername(), leetcodeUsername));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> sync(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ResponseEntity.ok(leetcodeSyncService.syncProfile(user.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return leetcodeSyncService.getProfile(user.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
