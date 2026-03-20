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
    const historyContainer = document.getElementById('coinHistoryContainer');

    // LeetCode Elements
    const leetcodeConnectView = document.getElementById('leetcodeConnectView');
    const leetcodeSyncView = document.getElementById('leetcodeSyncView');
    const leetcodeUsernameInput = document.getElementById('leetcodeUsernameInput');
    const connectLeetcodeBtn = document.getElementById('connectLeetcodeBtn');
    const syncLeetcodeBtn = document.getElementById('syncLeetcodeBtn');
    const displayLeetcodeUsername = document.getElementById('displayLeetcodeUsername');
    const lastSyncedText = document.getElementById('lastSyncedText');
    const easyCountEl = document.getElementById('easySolvedCount');
    const mediumCountEl = document.getElementById('mediumSolvedCount');
    const hardCountEl = document.getElementById('hardSolvedCount');
    const viewAllHistoryContainer = document.getElementById('viewAllHistoryContainer');
    const viewAllHistoryBtn = document.getElementById('viewAllHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const historyModalContent = document.getElementById('historyModalContent');
    const modalHistoryContainer = document.getElementById('modalHistoryContainer');
    const closeHistoryModal = document.getElementById('closeHistoryModal');

    let allTransactions = [];

    function renderTransactionCard(item) {
        const isPositive = item.amount >= 0;
        const date = new Date(item.createdAt);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `
            <div class="transaction-card ${isPositive ? 'transaction-positive' : 'transaction-negative'} p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between group shadow-lg">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center ${isPositive ? 'bg-[#00C853]/10 text-[#00C853]' : 'bg-[#FF3D00]/10 text-[#FF3D00]'} border ${isPositive ? 'border-[#00C853]/20' : 'border-[#FF3D00]/20'} shadow-inner">
                        <span class="text-xl font-bold">${isPositive ? '↑' : '↓'}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-white group-hover:text-[#FF6B00] transition-colors">${item.reason}</h4>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[10px] font-bold tracking-widest uppercase py-0.5 px-2 rounded bg-[#242424] text-gray-400">
                                ${isPositive ? 'Credit' : 'Debit'}
                            </span>
                            <span class="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                                ${month} ${day}, ${year}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="amount-badge text-xl font-black ${isPositive ? 'text-[#00C853]' : 'text-[#FF3D00]'} drop-shadow-sm">
                        ${isPositive ? '+' : ''}${item.amount}
                    </div>
                    <div class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">CodeCoins</div>
                </div>
            </div>
        `;
    }

    async function loadProfileData() {
        try {
            // Fetch user data
            const user = await api.getProfile();
            if (usernameEl) usernameEl.textContent = user.username;
            if (emailEl) emailEl.textContent = user.email;
            if (coinsEl) coinsEl.textContent = user.coins;

            // Fetch coin history
            allTransactions = await api.getCoinHistory();

            if (historyContainer) {
                if (!allTransactions || allTransactions.length === 0) {
                    historyContainer.innerHTML = `
                        <div class="p-12 text-center text-gray-500 italic bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                            No coin history found.
                        </div>
                    `;
                    if (viewAllHistoryContainer) viewAllHistoryContainer.classList.add('hidden');
                } else {
                    // Render ONLY TOP 3
                    const top3 = allTransactions.slice(0, 3);
                    historyContainer.innerHTML = top3.map(renderTransactionCard).join('');

                    if (allTransactions.length > 3) {
                        if (viewAllHistoryContainer) viewAllHistoryContainer.classList.remove('hidden');
                    } else {
                        if (viewAllHistoryContainer) viewAllHistoryContainer.classList.add('hidden');
                    }
                }
            }

            // Fetch LeetCode status
            try {
                const lcProfile = await api.getLeetcodeProfile();
                if (lcProfile) {
                    leetcodeConnectView.classList.add('hidden');
                    leetcodeSyncView.classList.remove('hidden');
                    displayLeetcodeUsername.textContent = lcProfile.leetcodeUsername;
                    lastSyncedText.textContent = lcProfile.lastSyncedAt ?
                        `Last Synced: ${new Date(lcProfile.lastSyncedAt).toLocaleString()}` :
                        'Never synced';
                    easyCountEl.textContent = lcProfile.easySolved || 0;
                    mediumCountEl.textContent = lcProfile.mediumSolved || 0;
                    hardCountEl.textContent = lcProfile.hardSolved || 0;
                } else {
                    leetcodeConnectView.classList.remove('hidden');
                    leetcodeSyncView.classList.add('hidden');
                }
            } catch (e) {
                // If 404, just show connect view
                leetcodeConnectView.classList.remove('hidden');
                leetcodeSyncView.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            if (historyContainer) {
                historyContainer.innerHTML = `
                    <div class="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p class="font-bold">Failed to load transaction history</p>
                        <p class="text-xs mt-1 opacity-70">${error.message || 'Unknown error'}</p>
                    </div>
                `;
            }
        }
    }

    // Modal Control
    function toggleModal(show) {
        if (!historyModal) return;
        if (show) {
            historyModal.classList.remove('hidden');
            setTimeout(() => {
                if (historyModalContent) historyModalContent.classList.remove('scale-95');
                if (historyModalContent) historyModalContent.classList.add('scale-100');
            }, 10);

            // Populate modal
            if (modalHistoryContainer) {
                modalHistoryContainer.innerHTML = allTransactions.map(renderTransactionCard).join('');
            }
        } else {
            if (historyModalContent) historyModalContent.classList.remove('scale-100');
            if (historyModalContent) historyModalContent.classList.add('scale-95');
            setTimeout(() => {
                historyModal.classList.add('hidden');
            }, 300);
        }
    }

    if (viewAllHistoryBtn) {
        viewAllHistoryBtn.addEventListener('click', () => toggleModal(true));
    }

    if (closeHistoryModal) {
        closeHistoryModal.addEventListener('click', () => toggleModal(false));
    }

    // Close on outside click
    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) toggleModal(false);
        });
    }

    // Connect Button Handler
    if (connectLeetcodeBtn) {
        connectLeetcodeBtn.addEventListener('click', async () => {
            const username = leetcodeUsernameInput.value.trim();
            if (!username) {
                alert('Please enter a LeetCode username');
                return;
            }

            connectLeetcodeBtn.disabled = true;
            connectLeetcodeBtn.textContent = 'Connecting...';

            try {
                await api.connectLeetcode(username);
                await loadProfileData();
            } catch (error) {
                alert(error.message || 'Failed to connect LeetCode profile');
            } finally {
                connectLeetcodeBtn.disabled = false;
                connectLeetcodeBtn.textContent = 'Connect Profile';
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
