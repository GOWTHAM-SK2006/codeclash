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

    @PostMapping("/find")
    public ResponseEntity<?> findMatch(Authentication auth) {
        String username = auth.getName();
        try {
            return ResponseEntity.ok(battleService.findMatch(username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-active")
    public ResponseEntity<?> getMyActiveBattle(Authentication auth) {
        String username = auth.getName();
        return battleService.getActiveBattleForUser(username)
                .map(battle -> ResponseEntity.ok(Map.of(
                        "status", "matched",
                        "battleId", battle.getId())))
                .orElse(ResponseEntity.ok(Map.of("status", "none")));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBattle(Authentication auth, @RequestBody BattleRequest request) {
        String username = auth.getName();
        return ResponseEntity.ok(battleService.createBattle(username, request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinBattle(@PathVariable Long id, Authentication auth) {
        try {
            String username = auth.getName();
            return ResponseEntity.ok(battleService.joinBattle(id, username));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitSolution(@PathVariable Long id, Authentication auth,
            @RequestBody BattleSubmitRequest request) {
        String username = auth.getName();
        return ResponseEntity.ok(battleService.submitBattleSolution(id, username, request));
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
