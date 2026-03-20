const eventId = new URLSearchParams(window.location.search).get('eventId');

if (!eventId) {
    window.location.href = '/events.html';
}

async function fetchStatus() {
    try {
        const data = await api.request(`/events/${eventId}`);
        renderLobby(data);
    } catch (e) {
        console.error('Failed to fetch contest status:', e);
    }
}

function renderLobby(data) {
    document.getElementById('contestTitle').textContent = data.title;
    document.getElementById('eventParentTitle').textContent = data.title; // Or more info if available

    const statusPill = document.getElementById('contestStatus');
    const timerLabel = document.getElementById('timerLabel');
    const timerEl = document.getElementById('contestTimer');
    const eligibilityEl = document.getElementById('eligibilityMessage');
    const actionArea = document.getElementById('actionArea');
    const card = document.getElementById('arenaCard');

    // Handle Eligibility First
    if (data.phase === 'NOT_STARTED' || data.phase === 'BIDDING_LIVE') {
        eligibilityEl.innerHTML = `<p style="color: var(--accent)">Bidding is currently live. Eligibility will be decided after bidding ends.</p>`;
        return;
    }

    if (!data.userSelected) {
        if (data.phase === 'BIDDING_ENDED' && !data.biddingProcessed) {
            eligibilityEl.innerHTML = `<p style="color: var(--accent); font-weight: 700;">⌛ Selection in progress...</p>
                                       <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Finalizing results, please wait.</p>`;
            return;
        }

        // Only block if the contest is still potentially being prepared or live
        // Once CONTEST_ENDED, everyone should seen the final state
        if (data.phase !== 'CONTEST_ENDED') {
            eligibilityEl.innerHTML = `<p style="color: #ff4444; font-weight: 700;">❌ You were not selected for this contest.</p>
                                       <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Only the top ${data.maxParticipants} bidders can enter.</p>`;
            timerEl.style.opacity = '0.3';
            return;
        }
    }

    eligibilityEl.innerHTML = `<p style="color: var(--success); font-weight: 700;">✅ You are eligible for this arena!</p>`;

    // Phase handling
    if (data.phase === 'BIDDING_ENDED') {
        statusPill.textContent = 'Preparing';
        statusPill.className = 'status-pill pill-upcoming';
        timerLabel.textContent = 'Arena Opens In';

        const start = new Date(data.contestStart).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((start - now) / 1000));
        timerEl.textContent = formatTime(diff);
        actionArea.style.display = 'none';
    } else if (data.phase === 'CONTEST_LIVE') {
        statusPill.textContent = '🔥 LIVE';
        statusPill.className = 'status-pill pill-live';
        card.classList.add('live');
        timerLabel.textContent = 'Contest Ends In';

        const end = new Date(data.contestStart).getTime() + (data.contestDuration * 60 * 1000);
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        timerEl.textContent = formatTime(diff);
        actionArea.style.display = 'block';
    } else {
        statusPill.textContent = 'Ended';
        statusPill.className = 'status-pill pill-upcoming';
        timerEl.textContent = '00:00:00';
        actionArea.style.display = 'block';
        document.getElementById('enterArenaBtn').textContent = 'View Results';
    }
}

function formatTime(seconds) {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
}

document.getElementById('enterArenaBtn').onclick = () => {
    // Show problem area
    document.getElementById('arenaCard').style.display = 'none';
    document.getElementById('problemArea').style.display = 'block';
    loadProblems();
};

async function loadProblems() {
    const data = await api.request(`/events/${eventId}`);
    const list = document.getElementById('problemList');

    // We need to fetch problem titles from IDs
    // For now we'll assume problemIds is "1,2,3"
    const ids = data.problemIds.split(',').map(s => s.trim()).filter(Boolean);

    list.innerHTML = ids.map(id => `
        <div class="problem-item" onclick="window.location.href='/problem.html?id=${id}'">
            <div>
                <div style="font-weight: 700;">Problem #${id}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Battle Objective</div>
            </div>
            <div style="color: var(--accent); font-weight: 800;">Solve →</div>
        </div>
    `).join('');
}

renderNav('events');
fetchStatus();
setInterval(fetchStatus, 5000);
