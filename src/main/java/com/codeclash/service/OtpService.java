package com.codeclash.service;

import com.codeclash.entity.LeetcodeProfile;
import com.codeclash.repository.LeetcodeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final LeetcodeProfileRepository leetcodeProfileRepository;
    private final Random random = new Random();

    public String generateOtp(LeetcodeProfile profile) {
        String otp = String.format("%06d", random.nextInt(1000000));
        profile.setOtpCode(otp);
        profile.setOtpCreatedAt(LocalDateTime.now());
        leetcodeProfileRepository.save(profile);
        return otp;
    }

    public boolean validateOtp(LeetcodeProfile profile, String otp) {
        if (profile.getOtpCode() == null || !profile.getOtpCode().equals(otp)) {
            return false;
        }

        // Optional: Add OTP expiration logic here if needed (e.g., 10 minutes)
        // LocalDateTime.now().isBefore(profile.getOtpCreatedAt().plusMinutes(10))

        profile.setVerified(true);
        profile.setOtpCode(null); // Clear OTP after successful verification
        leetcodeProfileRepository.save(profile);
        return true;
    }
}
