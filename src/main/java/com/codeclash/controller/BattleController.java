package com.codeclash.controller;

import com.codeclash.dto.*;
import com.codeclash.entity.User;
import com.codeclash.service.BattleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/battles")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;

    @PostMapping("/create")
    public ResponseEntity<?> createBattle(Authentication auth, @RequestBody BattleRequest request) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(battleService.createBattle(user.getUsername(), request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinBattle(@PathVariable Long id, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ResponseEntity.ok(battleService.joinBattle(id, user.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitSolution(@PathVariable Long id, Authentication auth,
            @RequestBody BattleSubmitRequest request) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(battleService.submitBattleSolution(id, user.getUsername(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBattle(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
                "battle", battleService.getBattle(id),
                "participants", battleService.getBattleParticipants(id)));
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableBattles() {
        return ResponseEntity.ok(battleService.getAvailableBattles());
    }
}
