const eventId = new URLSearchParams(window.location.search).get('eventId');
let lastRank = null;
let currentEvent = null;

if (!eventId) {
    window.location.href = '/events.html';
}

async function refresh() {
    try {
        const data = await api.request(`/events/${eventId}`);
        currentEvent = data;
        render(data);
    } catch (e) {
        console.error('Refresh failed:', e);
    }
}

function render(data) {
    document.getElementById('eventTitle').textContent = data.title;
    document.getElementById('userBid').textContent = data.userBid || 0;

    // Rank logic
    const currentRank = data.userRank > 0 ? `#${data.userRank}` : '# –';
    document.getElementById('userRank').textContent = currentRank;

    if (lastRank !== null && data.userRank > 0 && data.userRank < lastRank) {
        showRankUpNotif(`🔥 Moved to Rank #${data.userRank}!`);
    }
    lastRank = data.userRank > 0 ? data.userRank : null;

    // Phase handling
    const statusEl = document.getElementById('eventStatus');
    const labelEl = document.getElementById('timerLabel');
    const timerEl = document.getElementById('mainTime');
    const bidAction = document.getElementById('bidAction');
    const resultCard = document.getElementById('resultCard');

    if (data.phase === 'NOT_STARTED') {
        statusEl.textContent = 'Upcoming';
        labelEl.textContent = 'Bidding Starts In';
        timerEl.textContent = formatTime(data.secondsUntilBidding);
        bidAction.style.display = 'none';
    } else if (data.phase === 'BIDDING_LIVE') {
        statusEl.textContent = '🔥 Bidding LIVE';
        labelEl.textContent = 'Ends In';
        timerEl.textContent = formatTime(data.secondsRemainingBidding);
        bidAction.style.display = 'block';
        resultCard.style.display = 'none';

        // Balance
        const user = JSON.parse(localStorage.getItem('cc_user') || '{}');
        document.getElementById('userBalance').textContent = user.coins || 0;
    } else {
        statusEl.textContent = 'Bidding Ended';
        timerEl.textContent = '00:00:00';
        bidAction.style.display = 'none';

        // Result display
        resultCard.style.display = 'block';
        if (data.userSelected) {
            resultCard.innerHTML = `
                <span style="font-size: 3rem;">🎉</span>
                <h2 style="color:var(--success); font-weight:900; margin: 1rem 0;">You are selected!</h2>
                <p style="color:var(--text-secondary)">Prepare yourself for the arena. The contest starts shortly.</p>
                <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="window.location.href='/contest.html?eventId=${eventId}'">Go to Contest Page →</button>
            `;
        } else if (data.userBid > 0) {
            resultCard.innerHTML = `
                <span style="font-size: 3rem;">❌</span>
                <h2 style="color:var(--accent); font-weight:900; margin: 1rem 0;">Not Selected</h2>
                <p style="color:var(--text-secondary)">Your bid of ${data.userBid} 🪙 has been fully refunded.</p>
                <button class="btn btn-secondary" style="margin-top: 1.5rem;" onclick="window.location.href='/events.html'">Back to Events</button>
            `;
        } else {
            resultCard.innerHTML = `
                <h2 style="font-weight:900; margin: 1rem 0;">Bidding Closed</h2>
                <p style="color:var(--text-secondary)">You did not participate in this session.</p>
                <button class="btn btn-secondary" style="margin-top: 1.5rem;" onclick="window.location.href='/events.html'">Back to Events</button>
            `;
        }
    }

    // Leaderboard
    const lbContainer = document.getElementById('lbContainer');
    const lbTotal = document.getElementById('lbTotalBidders');
    const lb = data.leaderboard || [];
    lbTotal.textContent = `(${lb.length} users)`;

    lbContainer.innerHTML = lb.map((row, i) => `
        <div class="lb-row" style="${row.username === getUsername() ? 'background:rgba(255,107,0,0.1); outline:1px solid rgba(255,107,0,0.3);' : ''}">
            <div class="lb-rank">${i + 1}</div>
            <div class="lb-user">${row.displayName}</div>
            <div class="lb-amount">${row.amount}</div>
            ${i < data.maxParticipants ? '<div class="lb-selected">IN</div>' : ''}
        </div>
    `).join('');
}

function formatTime(seconds) {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
}

function getUsername() {
    const user = JSON.parse(localStorage.getItem('cc_user') || '{}');
    return user.username;
}

function showRankUpNotif(msg) {
    const div = document.createElement('div');
    div.className = 'rank-up-notif';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

document.getElementById('addBidBtn').onclick = async () => {
    try {
        const res = await api.request(`/events/${eventId}/bid`, { method: 'POST' });
        // Update local user coin cache
        const user = JSON.parse(localStorage.getItem('cc_user') || '{}');
        user.coins -= currentEvent.entryFee;
        localStorage.setItem('cc_user', JSON.stringify(user));

        refresh();
    } catch (e) {
        alert(e.message);
    }
};

renderNav('events');
refresh();
setInterval(refresh, 3000); // Higher frequency for bidding
