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
    const lcStatsView = document.getElementById('lcStatsView');
    const leetcodeUsernameInput = document.getElementById('leetcodeUsernameInput');
    const connectLeetcodeBtn = document.getElementById('connectLeetcodeBtn');
    const syncLeetcodeBtn = document.getElementById('syncLeetcodeBtn');
    const displayLeetcodeUsername = document.getElementById('displayLeetcodeUsername');
    const lastSyncedText = document.getElementById('lastSyncedText');
    const easyCountEl = document.getElementById('easySolvedCount');
    const mediumCountEl = document.getElementById('mediumSolvedCount');
    const hardCountEl = document.getElementById('hardSolvedCount');
    const profileAvatar = document.getElementById('profileAvatar');
    const viewAllHistoryBtn = document.getElementById('viewAllHistoryBtn');
    const historyModal = document.getElementById('historyModal');
    const historyModalContent = document.getElementById('historyModalContent');
    const modalHistoryContainer = document.getElementById('modalHistoryContainer');
    const closeHistoryModal = document.getElementById('closeHistoryModal');

    let allTransactions = [];

    function updateAvatar(username) {
        if (!profileAvatar || !username) return;
        const initials = username.substring(0, 2).toUpperCase();
        profileAvatar.textContent = initials;

        // Dynamic gradient based on username string
        const colors = [
            ['#3A245E', '#1B1031'],
            ['#1E3A8A', '#1E1B4B'],
            ['#064E3B', '#022C22'],
            ['#7C2D12', '#431407']
        ];
        const index = username.length % colors.length;
        profileAvatar.style.background = `linear-gradient(135deg, ${colors[index][0]}, ${colors[index][1]})`;
    }

    function renderTransactionCard(item) {
        const isPositive = item.amount >= 0;
        const date = new Date(item.createdAt);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });

        return `
            <div class="transaction-card p-4 flex items-center justify-between group shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-2xl flex items-center justify-center ${isPositive ? 'bg-[#00C853]/10 text-[#00C853]' : 'bg-[#FF3D00]/10 text-[#FF3D00]'} border border-white/5 shadow-inner">
                        <span class="text-lg font-black">${isPositive ? '＋' : '－'}</span>
                    </div>
                    <div>
                        <h4 class="text-sm font-black text-white group-hover:text-[#FF6B00] transition-colors line-clamp-1">${item.reason}</h4>
                        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                            ${month} ${day} • ${isPositive ? 'Credit' : 'Debit'}
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-black ${isPositive ? 'text-[#00C853]' : 'text-[#FF3D00]'}">
                        ${isPositive ? '+' : ''}${item.amount}
                    </div>
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
            updateAvatar(user.username);

            // Fetch coin history
            allTransactions = await api.getCoinHistory();

            if (historyContainer) {
                if (!allTransactions || allTransactions.length === 0) {
                    historyContainer.innerHTML = `
                        <div class="p-12 text-center text-gray-500 italic bg-white/5 rounded-3xl border border-white/5">
                            No coin history found.
                        </div>
                    `;
                    if (viewAllHistoryBtn) viewAllHistoryBtn.classList.add('hidden');
                } else {
                    const top3 = allTransactions.slice(0, 3);
                    historyContainer.innerHTML = top3.map(renderTransactionCard).join('');
                    if (allTransactions.length > 3 && viewAllHistoryBtn) {
                        viewAllHistoryBtn.classList.remove('hidden');
                    }
                }
            }

            // Fetch LeetCode status
            try {
                const lcProfile = await api.getLeetcodeProfile();
                if (lcProfile) {
                    leetcodeConnectView.classList.add('hidden');
                    leetcodeSyncView.classList.remove('hidden');
                    lcStatsView.classList.remove('hidden');
                    displayLeetcodeUsername.textContent = lcProfile.leetcodeUsername;
                    displayLeetcodeUsername.classList.remove('opacity-0');
                    lastSyncedText.textContent = lcProfile.lastSyncedAt ?
                        `Last Synced: ${new Date(lcProfile.lastSyncedAt).toLocaleString()}` :
                        'Never synced';
                    easyCountEl.textContent = lcProfile.easySolved || 0;
                    mediumCountEl.textContent = lcProfile.mediumSolved || 0;
                    hardCountEl.textContent = lcProfile.hardSolved || 0;
                } else {
                    leetcodeConnectView.classList.remove('hidden');
                    leetcodeSyncView.classList.add('hidden');
                    lcStatsView.classList.add('hidden');
                }
            } catch (e) {
                leetcodeConnectView.classList.remove('hidden');
                leetcodeSyncView.classList.add('hidden');
                lcStatsView.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            if (historyContainer) {
                historyContainer.innerHTML = `
                    <div class="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-3xl">
                        <p class="font-bold">Failed to load profile data</p>
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
                if (historyModalContent) {
                    historyModalContent.classList.remove('scale-95');
                    historyModalContent.classList.add('scale-100');
                }
            }, 10);
            if (modalHistoryContainer) {
                modalHistoryContainer.innerHTML = allTransactions.map(renderTransactionCard).join('');
            }
        } else {
            if (historyModalContent) {
                historyModalContent.classList.remove('scale-100');
                historyModalContent.classList.add('scale-95');
            }
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
                connectLeetcodeBtn.textContent = 'Connect';
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
                await api.syncLeetcode();
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
