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

    try {
        // Fetch user data
        // Existing endpoint /api/users/me provides username, email, and coins
        const user = await api.getProfile();
        if (usernameEl) usernameEl.textContent = user.username;
        if (emailEl) emailEl.textContent = user.email;
        if (coinsEl) coinsEl.textContent = user.coins;

        // Fetch coin history
        // Existing endpoint /api/coins/history provides transaction list
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
});
