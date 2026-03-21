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
    const list = document.getElementById('problemList');

    try {
        const data = await api.request(`/events/${eventId}`);
        const problemIdsStr = data.problemIds || "";
        const ids = problemIdsStr.split(',').map(s => s.trim()).filter(Boolean);

        if (ids.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed var(--border);">
                    <div style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;">⚔️</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Waiting for Objectives</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">The arena is empty. Contact your administrator to add battle objectives.</p>
                </div>
            `;
            return;
        }

        // Only show spinner if we actually have IDs to fetch
        if (list.innerHTML.includes('Waiting for Objectives') || !list.children.length) {
            list.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
        }

        // Fetch all problem details concurrently
        const problems = await Promise.all(ids.map(id => api.getProblem(id)));

        // Fetch user submissions to determine solved status
        let submissions = [];
        try {
            submissions = await api.getSubmissions();
        } catch (e) {
            // If submissions fail to load, fallback to empty
            submissions = [];
        }
        list.innerHTML = problems.map((prob, idx) => {
            // Check if this problem is solved by the user
            const solved = submissions.some(s => s.problemId === prob.id && s.status === 'ACCEPTED');
            return `
                <div class="problem-item" onclick="window.location.href='/contest-problem.html?id=${prob.id}&eventId=${eventId}'">
                    <div>
                        <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">
                            <span style="margin-right: 0.7em; color: var(--text-secondary); font-size: 0.95em; font-weight: 600;">${idx + 1}.</span>
                            ${prob.title}
                        </div>
                        <div style="display: flex; gap: 0.75rem; margin-top: 0.4rem; align-items: center;">
                            <span class="badge badge-${prob.difficulty.toLowerCase()}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px;">${prob.difficulty}</span>
                        </div>
                    </div>
                    <div style="color: var(--accent); font-weight: 900; letter-spacing: 0.5px;">
                        ${solved ? 'Solved' : 'SOLVE →'}
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('loadProblems failed:', e);
        list.innerHTML = `<div class="alert alert-error">Failed to load problems: ${e.message}</div>`;
    }
}

renderNav('events');
fetchStatus();
setInterval(fetchStatus, 5000);
