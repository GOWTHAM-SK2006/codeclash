package com.codeclash.controller;

import com.codeclash.entity.User;
import com.codeclash.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(userService.getUserByUsername(user.getUsername()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(userService.getDashboard(user.getUsername()));
    }
}
