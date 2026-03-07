package com.codeclash.service;

import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            String json = "{"
                    + "\"from\":\"CodeClash <onboarding@resend.dev>\","
                    + "\"to\":[\"" + toEmail + "\"],"
                    + "\"subject\":\"CodeClash OTP Verification\","
                    + "\"html\":\"<h2>Your CodeClash OTP is: " + otp + "</h2>\""
                    + "}";

            RequestBody body = RequestBody.create(
                    json,
                    MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url("https://api.resend.com/emails")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No error body";
                    log.error("Failed to send email via Resend: {} - {}", response.code(), errorBody);
                    throw new RuntimeException("Resend API error: " + response.code());
                }
                log.info("OTP email sent successfully via Resend to {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Could not send verification email: " + e.getMessage());
        }
    }
}
