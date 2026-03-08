// Battle lobby logic
let searchInterval = null;

(async function () {
    renderNav('battle');
    if (!requireAuth()) return;

    // Check if user is already in a battle
    try {
        const active = await api.checkMyActiveBattle();
        if (active && active.status === 'matched') {
            window.location.href = `battle-room.html?battleId=${active.battleId}`;
        }
    } catch (e) { }
})();

async function findRandomBattle() {
    document.getElementById('defaultLobby').style.display = 'none';
    document.getElementById('waitingLobby').style.display = 'block';

    try {
        const res = await api.findBattle();
        if (res.status === 'matched') {
            handleMatch(res);
        } else {
            // Start polling
            startPolling();
        }
    } catch (e) {
        alert('Error: ' + e.message);
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
    document.getElementById('waitingLobby').style.display = 'none';
    document.getElementById('matchedLobby').style.display = 'block';

    if (data.opponentName) {
        document.getElementById('opponentInfo').textContent = `Opponent: ${data.opponentName}`;
    }
    if (data.problemName) {
        document.getElementById('problemInfo').textContent = `Problem: ${data.problemName}`;
    }

    setTimeout(() => {
        window.location.href = `battle-room.html?battleId=${data.battleId}`;
    }, 2000);
}

function cancelSearch() {
    if (searchInterval) clearInterval(searchInterval);
    document.getElementById('waitingLobby').style.display = 'none';
    document.getElementById('defaultLobby').style.display = 'block';
}
