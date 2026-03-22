// Battle lobby logic
let searchInterval = null;
let selectedDifficulty = null;

(async function () {
    renderNav('battle');
    if (!requireAuth()) return;

    // Simulated live data for visual appeal
    updateLiveCounters();
    setInterval(updateLiveCounters, 5000);

    // Check if user is already in a battle
    try {
        const active = await api.checkMyActiveBattle();
        if (active && active.status === 'matched') {
            window.location.href = `battle-room.html?battleId=${active.battleId}`;
        }
    } catch (e) { }
})();

function updateLiveCounters() {
    const playersEl = document.getElementById('onlinePlayersCount');
    const battlesEl = document.getElementById('dailyBattlesCount');

    if (playersEl) {
        const basePlayers = 120;
        const randomPlayers = Math.floor(Math.random() * 15);
        playersEl.textContent = basePlayers + randomPlayers;
    }

    if (battlesEl) {
        const baseBattles = 840;
        const randomBattles = Math.floor(Math.random() * 5);
        battlesEl.textContent = baseBattles + randomBattles;
    }
}

async function findRandomBattle(difficulty) {
    selectedDifficulty = difficulty;

    const lobby = document.getElementById('defaultLobby');
    const waiting = document.getElementById('waitingLobby');
    const info = document.getElementById('waitingInfo');

    if (lobby) lobby.style.display = 'none';
    if (waiting) {
        waiting.classList.remove('hidden');
        waiting.style.display = 'block';
    }
    if (info) info.textContent = `Scanning for ${difficulty} opponents...`;

    try {
        const res = await api.findBattle(difficulty);
        if (res.status === 'matched') {
            handleMatch(res);
        } else {
            startPolling();
        }
    } catch (e) {
        console.error('Battle search error:', e);
        cancelSearch();
    }
}

function startPolling() {
    if (searchInterval) clearInterval(searchInterval);
    searchInterval = setInterval(async () => {
        try {
            const res = await api.checkMyActiveBattle();
            if (res && res.status === 'matched') {
                clearInterval(searchInterval);
                handleMatch(res);
            }
        } catch (e) { }
    }, 3000);
}

function handleMatch(data) {
    const waiting = document.getElementById('waitingLobby');
    const matched = document.getElementById('matchedLobby');
    const opponent = document.getElementById('opponentInfo');
    const problem = document.getElementById('problemInfo');

    if (waiting) waiting.style.display = 'none';
    if (matched) {
        matched.classList.remove('hidden');
        matched.style.display = 'block';
    }

    if (opponent && data.opponentName) {
        opponent.textContent = data.opponentName;
    }
    if (problem && data.problemName) {
        problem.textContent = data.problemName;
    }

    setTimeout(() => {
        window.location.href = `battle-room.html?battleId=${data.battleId}`;
    }, 3000);
}

function cancelSearch() {
    if (searchInterval) clearInterval(searchInterval);
    selectedDifficulty = null;

    const waiting = document.getElementById('waitingLobby');
    const lobby = document.getElementById('defaultLobby');

    if (waiting) waiting.style.display = 'none';
    if (lobby) lobby.style.display = 'block';
}
