// Battle page logic
let currentBattleId = null;
let timerInterval = null;
let timeLeft = 900; // 15 minutes

(async function () {
    renderNav('battle');
    if (!requireAuth()) return;

    // Load problems for battle creation
    try {
        const problems = await api.getProblems();
        const select = document.getElementById('battleProblem');
        select.innerHTML = problems.map(p =>
            `<option value="${p.id}">${p.title} (${p.difficulty})</option>`
        ).join('');
    } catch (e) { }

    loadAvailableBattles();
})();

async function loadAvailableBattles() {
    try {
        const battles = await api.getAvailableBattles();
        const el = document.getElementById('availableBattles');
        if (battles.length === 0) {
            el.innerHTML = '<div class="empty-state" style="padding:2rem;"><p>No battles waiting. Create one!</p></div>';
            return;
        }
        el.innerHTML = battles.map(b => `
            <div class="topic-item" style="margin-bottom:0.5rem;">
                <div>
                    <strong>${b.problem?.title || 'Problem'}</strong>
                    <span style="color:var(--text-muted);font-size:0.75rem;margin-left:0.5rem;">Battle #${b.id}</span>
                </div>
                <button onclick="joinBattle(${b.id})" class="btn btn-primary btn-sm">Join</button>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('availableBattles').innerHTML = '<p style="color:var(--text-secondary);">Could not load battles.</p>';
    }
}

async function createBattle() {
    const problemId = document.getElementById('battleProblem').value;
    if (!problemId) return;

    try {
        const battle = await api.createBattle(parseInt(problemId));
        currentBattleId = battle.id;
        showBattle(battle);
    } catch (e) {
        alert('Error creating battle: ' + e.message);
    }
}

async function joinBattle(id) {
    try {
        const battle = await api.joinBattle(id);
        currentBattleId = id;
        showBattle(battle);
    } catch (e) {
        alert('Error joining battle: ' + e.message);
    }
}

async function showBattle(battle) {
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('battleView').style.display = '';

    document.getElementById('battleProblemTitle').textContent = battle.problem?.title || 'Problem';
    document.getElementById('battleProblemDesc').textContent = battle.problem?.description || '';

    if (battle.problem?.starterCode) {
        document.getElementById('battleEditor').value = battle.problem.starterCode;
    }

    // Try to load participants
    try {
        const data = await api.getBattle(battle.id || currentBattleId);
        const participants = data.participants || [];
        document.getElementById('p1Name').textContent = participants[0]?.user?.displayName || 'Player 1';
        document.getElementById('p2Name').textContent = participants[1]?.user?.displayName || 'Waiting...';
    } catch (e) { }

    startTimer();
}

function startTimer() {
    timeLeft = 900;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').textContent = '00:00';
            return;
        }
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${m}:${s}`;
    }, 1000);
}

async function submitBattleSolution() {
    if (!currentBattleId) return;
    const code = document.getElementById('battleEditor').value;

    try {
        const result = await api.submitBattle(currentBattleId, code, 'python');
        const resultEl = document.getElementById('battleResult');
        resultEl.style.display = 'block';

        const user = api.getUser();
        if (result.winnerId === user?.userId) {
            resultEl.innerHTML = `
                <div class="card" style="border-color:var(--success);text-align:center;padding:2rem;">
                    <span style="font-size:3rem;display:block;margin-bottom:1rem;">🎉</span>
                    <h2 style="font-size:1.5rem;font-weight:800;color:var(--success);margin-bottom:0.5rem;">You Won!</h2>
                    <p style="color:var(--text-secondary);">+50 coins earned! 🪙</p>
                </div>
            `;
        } else if (result.winnerId) {
            resultEl.innerHTML = `
                <div class="card" style="border-color:var(--danger);text-align:center;padding:2rem;">
                    <span style="font-size:3rem;display:block;margin-bottom:1rem;">😔</span>
                    <h2 style="font-size:1.5rem;font-weight:800;color:var(--danger);margin-bottom:0.5rem;">Opponent Won</h2>
                    <p style="color:var(--text-secondary);">Better luck next time!</p>
                </div>
            `;
        } else {
            resultEl.innerHTML = `
                <div class="card" style="border-color:var(--accent);text-align:center;padding:2rem;">
                    <span style="font-size:3rem;display:block;margin-bottom:1rem;">⏳</span>
                    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem;">Solution Submitted</h2>
                    <p style="color:var(--text-secondary);">Waiting for opponent...</p>
                </div>
            `;
        }

        clearInterval(timerInterval);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}
