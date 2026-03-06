document.addEventListener('DOMContentLoaded', async () => {
    // Render navbar
    if (typeof renderNav === 'function') {
        renderNav('profile');
    }

    // Check auth
    if (typeof requireAuth === 'function') {
        if (!requireAuth()) return;
    }

    const usernameEl = document.getElementById('profileUsername');
    const emailEl = document.getElementById('profileEmail');
    const coinsEl = document.getElementById('totalCoinsDisplay');
    const historyBody = document.getElementById('coinHistoryBody');

    // LeetCode Elements
    const leetcodeConnectView = document.getElementById('leetcodeConnectView');
    const leetcodeSyncView = document.getElementById('leetcodeSyncView');
    const leetcodeUsernameInput = document.getElementById('leetcodeUsernameInput');
    const leetcodeEmailInput = document.getElementById('leetcodeEmailInput');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpSection = document.getElementById('otpSection');
    const otpInput = document.getElementById('otpInput');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');

    const syncLeetcodeBtn = document.getElementById('syncLeetcodeBtn');
    const displayLeetcodeUsername = document.getElementById('displayLeetcodeUsername');
    const lastSyncedText = document.getElementById('lastSyncedText');
    const verifiedBadge = document.getElementById('verifiedBadge');
    const easyCountEl = document.getElementById('easySolvedCount');
    const mediumCountEl = document.getElementById('mediumSolvedCount');
    const hardCountEl = document.getElementById('hardSolvedCount');

    async function loadProfileData() {
        try {
            // Fetch user data
            const user = await api.getProfile();
            if (usernameEl) usernameEl.textContent = user.username;
            if (emailEl) emailEl.textContent = user.email;
            if (coinsEl) coinsEl.textContent = user.coins;

            // Fetch coin history
            const history = await api.getCoinHistory();

            if (historyBody) {
                if (!history || history.length === 0) {
                    historyBody.innerHTML = `
                        <tr>
                            <td colspan="3" class="px-6 py-8 text-center text-gray-500 italic">No coin history found.</td>
                        </tr>
                    `;
                } else {
                    historyBody.innerHTML = history.map(item => `
                        <tr class="hover:bg-[#242424] transition-colors">
                            <td class="px-6 py-4 text-sm text-gray-400 font-mono">
                                ${new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-white">
                                ${item.reason}
                            </td>
                            <td class="px-6 py-4 text-sm font-bold text-right ${item.amount >= 0 ? 'text-[#00C853]' : 'text-[#FF3D00]'}">
                                ${item.amount >= 0 ? '+' : ''}${item.amount}
                            </td>
                        </tr>
                    `).join('');
                }
            }

            // Fetch LeetCode status
            try {
                const lcProfile = await api.getLeetcodeProfile();
                if (lcProfile && lcProfile.verified) {
                    leetcodeConnectView.classList.add('hidden');
                    leetcodeSyncView.classList.remove('hidden');
                    displayLeetcodeUsername.textContent = lcProfile.leetcodeUsername;
                    if (verifiedBadge) verifiedBadge.classList.remove('hidden');
                    lastSyncedText.textContent = lcProfile.lastSyncedAt ?
                        `Last Synced: ${new Date(lcProfile.lastSyncedAt).toLocaleString()}` :
                        'Never synced';
                    easyCountEl.textContent = lcProfile.easySolved || 0;
                    mediumCountEl.textContent = lcProfile.mediumSolved || 0;
                    hardCountEl.textContent = lcProfile.hardSolved || 0;
                } else {
                    leetcodeConnectView.classList.remove('hidden');
                    leetcodeSyncView.classList.add('hidden');
                    if (lcProfile) {
                        leetcodeUsernameInput.value = lcProfile.leetcodeUsername || '';
                        leetcodeEmailInput.value = lcProfile.leetcodeEmail || '';
                        // If they have a profile but not verified, show OTP section if they just sent one
                        // For now we just reset the view to allow them to resend
                    }
                }
            } catch (e) {
                // If 404, just show connect view
                leetcodeConnectView.classList.remove('hidden');
                leetcodeSyncView.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            if (historyBody) {
                historyBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="px-6 py-8 text-center text-red-500">Failed to load profile data.</td>
                    </tr>
                `;
            }
        }
    }

    // Send OTP Button Handler
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const username = leetcodeUsernameInput.value.trim();
            const email = leetcodeEmailInput.value.trim();
            const spinner = document.getElementById('sendOtpSpinner');

            if (!username || !email) {
                alert('Please enter both LeetCode username and email');
                return;
            }

            sendOtpBtn.disabled = true;
            if (spinner) spinner.classList.remove('hidden');

            // Show the OTP input area immediately so the user sees the 'space'
            if (otpSection) {
                otpSection.classList.remove('hidden');
                otpSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            try {
                await api.sendOtp(username, email);
                sendOtpBtn.textContent = 'Resend OTP';
                // Success! The section is already visible.
            } catch (error) {
                alert(error.message || 'Failed to send OTP');
                // We keep the section visible so they can see where it would have been
            } finally {
                sendOtpBtn.disabled = false;
                if (spinner) spinner.classList.add('hidden');
            }
        });
    }

    // Verify OTP Button Handler
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const otp = otpInput.value.trim();
            const username = leetcodeUsernameInput.value.trim();

            if (!otp || otp.length !== 6) {
                alert('Please enter a valid 6-digit OTP');
                return;
            }

            verifyOtpBtn.disabled = true;
            try {
                await api.verifyOtp(username, otp);
                alert('Verification successful!');
                await loadProfileData();
            } catch (error) {
                alert(error.message || 'Verification failed');
            } finally {
                verifyOtpBtn.disabled = false;
            }
        });
    }

    // Sync Button Handler
    if (syncLeetcodeBtn) {
        syncLeetcodeBtn.addEventListener('click', async () => {
            const syncIcon = document.getElementById('syncIcon');
            syncLeetcodeBtn.disabled = true;
            if (syncIcon) syncIcon.classList.add('animate-spin');

            try {
                const result = await api.syncLeetcode();
                alert('Sync complete! Check your updated coins and history.');
                await loadProfileData();
            } catch (error) {
                alert(error.message || 'Failed to sync LeetCode profile');
            } finally {
                syncLeetcodeBtn.disabled = false;
                if (syncIcon) syncIcon.classList.remove('animate-spin');
            }
        });
    }

    // Initial load
    await loadProfileData();
});
