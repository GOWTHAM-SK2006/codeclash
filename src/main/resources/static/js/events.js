let currentEvents = [];

async function fetchEvents() {
    try {
        const events = await api.request('/events');
        currentEvents = events;
        renderEvents();
    } catch (e) {
        console.error('Failed to fetch events:', e);
    }
}

function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!currentEvents.length) {
        grid.innerHTML = `<div class="no-events card">
            <h2>No active events right now</h2>
            <p>Check back later for upcoming clashes!</p>
        </div>`;
        return;
    }

    grid.innerHTML = currentEvents.map(event => {
        const isLive = event.phase === 'BIDDING_LIVE';
        const isEnded = ['BIDDING_ENDED', 'CONTEST_LIVE', 'CONTEST_ENDED'].includes(event.phase);

        let statusText = '';
        let timerLabel = '';
        let timerValue = 0;
        let btnText = 'View Details';
        let btnClass = 'btn-secondary';

        if (event.phase === 'NOT_STARTED') {
            statusText = `<span class="status-badge badge-upcoming">Upcoming</span>`;
            timerLabel = 'Starts In';
            timerValue = event.secondsUntilBidding;
            btnText = 'Join Bidding Info';
        } else if (event.phase === 'BIDDING_LIVE') {
            statusText = `<span class="status-badge badge-live">🔥 Bidding LIVE</span>`;
            timerLabel = 'Ends In';
            timerValue = event.secondsRemainingBidding;
            btnText = 'Join Bidding →';
            btnClass = 'btn-primary';
        } else if (event.phase === 'BIDDING_ENDED') {
            statusText = `<span class="status-badge badge-upcoming">Bidding Ended</span>`;
            timerLabel = 'Contest Starts In';
            // Estimate countdown to contest
            const contestStart = new Date(event.contestStart).getTime();
            const now = new Date().getTime();
            timerValue = Math.max(0, Math.floor((contestStart - now) / 1000));
            btnText = 'Check Selection';
        } else if (event.phase === 'CONTEST_LIVE') {
            statusText = `<span class="status-badge badge-live">🏆 Contest LIVE</span>`;
            timerLabel = 'Ends In';
            // Duration logic
            const contestEnd = new Date(event.contestStart).getTime() + (event.contestDuration * 60 * 1000);
            const now = new Date().getTime();
            timerValue = Math.max(0, Math.floor((contestEnd - now) / 1000));
            btnText = 'Enter Contest →';
            btnClass = 'btn-primary';
        } else {
            statusText = `<span class="status-badge badge-upcoming">Event Ended</span>`;
            btnText = 'View Results';
        }

        return `
            <div class="event-card ${isLive ? 'live' : ''}">
                ${statusText}
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <div class="meta-item"><b>Entry Fee</b>🪙 ${event.entryFee}</div>
                    <div class="meta-item"><b>Max Slots</b>👥 ${event.maxParticipants}</div>
                </div>

                ${timerValue > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <div class="countdown" data-event-id="${event.id}">${formatTime(timerValue)}</div>
                        <div class="countdown-label">${timerLabel}</div>
                    </div>
                ` : ''}

                <button class="btn ${btnClass} btn-join" onclick="navigateToEvent('${event.id}', '${event.phase}')">
                    ${btnText}
                </button>
                
                <p style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">
                    Top ${event.maxParticipants} users will be selected
                </p>
            </div>
        `;
    }).join('');
}

function formatTime(seconds) {
    if (seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
}

function navigateToEvent(id, phase) {
    if (phase === 'BIDDING_LIVE' || phase === 'NOT_STARTED') {
        window.location.href = `/bidding.html?eventId=${id}`;
    } else if (phase === 'CONTEST_LIVE' || phase === 'BIDDING_ENDED') {
        window.location.href = `/contest.html?eventId=${id}`;
    } else {
        window.location.href = `/contest.html?eventId=${id}&results=true`;
    }
}

// Global update loop for countdowns
setInterval(() => {
    document.querySelectorAll('.countdown').forEach(el => {
        const id = el.dataset.eventId;
        const event = currentEvents.find(e => e.id === id);
        if (event) {
            // This is a bit simplified, but fine for now
            // We should ideally track the target time and diff it
            fetchEvents(); // Refresh from server to keep sync
        }
    });
}, 5000); // Polling every 5s is fine for simple real-time

fetchEvents();
setInterval(fetchEvents, 10000); // Fallback refresh
