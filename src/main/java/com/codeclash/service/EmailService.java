package com.codeclash.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("dygoncodeclash@gmail.com");
            message.setTo(toEmail);
            message.setSubject("CodeClash Verification");
            message.setText("Your CodeClash verification OTP is:\n\n" + otp
                    + "\n\nEnter this OTP to verify your LeetCode account.");

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Could not send verification email. Please check your email address.");
        }
    }
}
