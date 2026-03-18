package com.codeclash.controller;

import com.codeclash.entity.Problem;
import com.codeclash.entity.User;
import com.codeclash.service.AdminPanelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminPanelService adminPanelService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");
        return adminPanelService.adminLogin(username, password, request);
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getOverview();
    }

    @GetMapping("/live-battles")
    public List<Map<String, Object>> liveBattles(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getLiveBattles();
    }

    @PostMapping("/live-battles/{battleId}/force-end")
    public Map<String, Object> forceEnd(@RequestHeader("X-Admin-Session") String token,
                                         @PathVariable Long battleId) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.forceEndBattle(battleId);
    }

    @PostMapping("/live-battles/{battleId}/disqualify")
    public Map<String, Object> disqualify(@RequestHeader("X-Admin-Session") String token,
                                          @PathVariable Long battleId,
                                          @RequestBody Map<String, Object> body) {
        adminPanelService.verifyAdminSession(token);
        Long userId = Long.valueOf(String.valueOf(body.getOrDefault("userId", "0")));
        return adminPanelService.disqualifyUser(battleId, userId);
    }

    @GetMapping("/match-history")
    public List<Map<String, Object>> matchHistory(@RequestHeader("X-Admin-Session") String token,
                                                   @RequestParam(required = false) String date,
                                                   @RequestParam(required = false) String user,
                                                   @RequestParam(required = false) String result) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getMatchHistory(date, user, result);
    }

    @GetMapping("/problems")
    public List<Map<String, Object>> getProblems(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getProblems();
    }

    @PostMapping("/problems")
    @ResponseStatus(HttpStatus.CREATED)
    public Problem createProblem(@RequestHeader("X-Admin-Session") String token,
                                 @RequestBody Map<String, Object> body) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.createProblem(body);
    }

    @PutMapping("/problems/{id}")
    public Problem updateProblem(@RequestHeader("X-Admin-Session") String token,
                                 @PathVariable Long id,
                                 @RequestBody Map<String, Object> body) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.updateProblem(id, body);
    }

    @DeleteMapping("/problems/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProblem(@RequestHeader("X-Admin-Session") String token,
                              @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        adminPanelService.deleteProblem(id);
    }

    @GetMapping("/problems/{id}/testcases")
    public List<Map<String, Object>> testcases(@RequestHeader("X-Admin-Session") String token,
                                                @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getTestcases(id);
    }

    @PutMapping("/problems/{id}/testcases")
    public Map<String, Object> updateTestcases(@RequestHeader("X-Admin-Session") String token,
                                                @PathVariable Long id,
                                                @RequestBody Map<String, List<Map<String, Object>>> body) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.updateTestcases(id, body.get("testcases"));
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getUsers();
    }

    @PostMapping("/users/{id}/ban")
    public User banUser(@RequestHeader("X-Admin-Session") String token,
                        @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.setUserBan(id, true);
    }

    @PostMapping("/users/{id}/unban")
    public User unbanUser(@RequestHeader("X-Admin-Session") String token,
                          @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.setUserBan(id, false);
    }

    @PostMapping("/users/{id}/reset-stats")
    public User resetUserStats(@RequestHeader("X-Admin-Session") String token,
                               @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.resetUserStats(id);
    }

    @GetMapping("/users/{id}/submissions")
    public List<Map<String, Object>> userSubmissions(@RequestHeader("X-Admin-Session") String token,
                                                      @PathVariable Long id) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getUserSubmissions(id);
    }

    @GetMapping("/submissions")
    public List<Map<String, Object>> submissions(@RequestHeader("X-Admin-Session") String token,
                                                  @RequestParam(required = false) String status) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getSubmissions(status);
    }

    @GetMapping("/errors")
    public List<Map<String, Object>> errors(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getErrorLogs();
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> leaderboard(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getLeaderboard();
    }

    @PostMapping("/leaderboard/reset")
    public Map<String, Object> resetLeaderboard(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.resetLeaderboard();
    }

    @PostMapping("/leaderboard/{id}/adjust-points")
    public User adjustPoints(@RequestHeader("X-Admin-Session") String token,
                             @PathVariable Long id,
                             @RequestBody Map<String, Object> body) {
        adminPanelService.verifyAdminSession(token);
        Integer delta = Integer.valueOf(String.valueOf(body.getOrDefault("delta", "0")));
        return adminPanelService.adjustPoints(id, delta);
    }

    @GetMapping("/settings")
    public Map<String, Object> settings(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.getSettings();
    }

    @PutMapping("/settings")
    public Map<String, Object> updateSettings(@RequestHeader("X-Admin-Session") String token,
                                               @RequestBody Map<String, Object> payload) {
        adminPanelService.verifyAdminSession(token);
        return adminPanelService.updateSettings(payload);
    }
}
