package com.codeclash.service;

import com.codeclash.entity.Notification;
import com.codeclash.entity.User;
import com.codeclash.repository.NotificationRepository;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Send a notification to a single user.
     */
    public void notify(User user, String type, String title, String message) {
        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .build();
        notificationRepository.save(n);
        log.info("Notification sent to {}: [{}] {}", user.getUsername(), type, title);
    }

    /**
     * Broadcast a notification to ALL users.
     */
    @Transactional
    public void notifyAll(String type, String title, String message) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            Notification n = Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .message(message)
                    .build();
            notificationRepository.save(n);
        }
        log.info("Broadcast notification to {} users: [{}] {}", allUsers.size(), type, title);
    }

    /**
     * Get all notifications for a user (newest first).
     */
    public List<Notification> getNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Get the unread notification count.
     */
    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    /**
     * Mark all unread notifications as read for a user.
     */
    @Transactional
    public void markAllRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
