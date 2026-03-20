const sessionToken = localStorage.getItem('cc_admin_session');

if (!sessionToken) {
    window.location.href = 'login.html';
}

const sections = [
    'Dashboard',
    'Live Battles',
    'Match History',
    'Problems',
    'Testcases',
    'Users',
    'Submissions',
    'Leaderboard',
    'Error Monitoring',
    'Settings',
    'Events'
];

let currentSection = 'Dashboard';
let problemCache = [];
let selectedProblemId = null;

const navRoot = document.getElementById('adminNav');
const sectionRoot = document.getElementById('sectionRoot');
const sectionTitle = document.getElementById('sectionTitle');
const liveCounter = document.getElementById('liveCounter');

function showAlert(message) {
    const alert = document.getElementById('adminAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 5000);
}

async function adminRequest(path, options = {}) {
    const res = await fetch(`/api/admin${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Session': sessionToken,
            ...(options.headers || {})
        }
    });

    if (res.status === 401) {
        localStorage.removeItem('cc_admin_session');
        if (window.adminInterval) clearInterval(window.adminInterval);
        window.location.href = 'login.html';
        return;
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.message || payload.error || 'Request failed');
    return payload;
}

function renderNav() {
    navRoot.innerHTML = sections.map(item => `
        <button class="admin-nav-btn ${currentSection === item ? 'active' : ''}" data-nav="${item}">${item}</button>
    `).join('');

    navRoot.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSection = btn.dataset.nav;
            sectionTitle.textContent = currentSection;
            renderNav();
            renderSection();
        });
    });
}

function makeTable(headers, rows) {
    return `
        <div class="admin-scroll">
            <table class="admin-table">
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.join('')}</tbody>
            </table>
        </div>
    `;
}

async function renderDashboard() {
    const data = await adminRequest('/overview');
    const stats = data.stats || {};
    const daily = (data.charts?.dailySubmissions || []).slice(-7);
    const activeUsers = (data.charts?.activeUsers || []).slice(-8);

    liveCounter.textContent = `LIVE: ${stats.activeBattles || 0}`;

    sectionRoot.innerHTML = `
        <div class="stats-grid">
            <div class="card"><p>Total Users</p><h2 style="color:var(--accent)">${stats.totalUsers || 0}</h2></div>
            <div class="card"><p>Total Problems</p><h2 style="color:var(--accent)">${stats.totalProblems || 0}</h2></div>
            <div class="card"><p>Total Submissions</p><h2 style="color:var(--accent)">${stats.totalSubmissions || 0}</h2></div>
            <div class="card"><p>Total Battles</p><h2 style="color:var(--accent)">${stats.totalBattlesPlayed || 0}</h2></div>
            <div class="card"><p>Active Battles</p><h2 style="color:var(--success)">${stats.activeBattles || 0}</h2></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:.9rem;">
            <div class="card">
                <h3 style="font-weight:700;margin-bottom:.6rem;">Daily Submissions</h3>
                <pre style="white-space:pre-wrap;color:var(--text-secondary)">${daily.map(d => `${d.day}: ${d.count}`).join('\n')}</pre>
            </div>
            <div class="card">
                <h3 style="font-weight:700;margin-bottom:.6rem;">Active Users</h3>
                <pre style="white-space:pre-wrap;color:var(--text-secondary)">${activeUsers.map(d => `${d.hour}: ${d.count}`).join('\n')}</pre>
            </div>
        </div>
    `;
}

async function renderLiveBattles() {
    const rows = await adminRequest('/live-battles');
    liveCounter.textContent = `LIVE: ${rows.length}`;

    sectionRoot.innerHTML = makeTable(
        ['P1', 'P2', 'Problem', 'Elapsed', 'Status', 'Actions'],
        rows.map(row => `
            <tr>
                <td>${row.player1}</td>
                <td>${row.player2}</td>
                <td>${row.problemName}</td>
                <td>${Math.floor((row.elapsedSec || 0) / 60)}m ${(row.elapsedSec || 0) % 60}s</td>
                <td class="${row.status === 'Coding' ? 'status-live' : 'status-sub'}">${row.status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-force="${row.id}">Force End</button>
                    <button class="btn btn-secondary btn-sm" data-dq="${row.id}:${row.player1Id}">DQ P1</button>
                    <button class="btn btn-secondary btn-sm" data-dq="${row.id}:${row.player2Id}">DQ P2</button>
                </td>
            </tr>
        `)
    );

    sectionRoot.querySelectorAll('[data-force]').forEach(btn => {
        btn.onclick = async () => {
            await adminRequest(`/live-battles/${btn.dataset.force}/force-end`, { method: 'POST' });
            renderLiveBattles();
        };
    });

    sectionRoot.querySelectorAll('[data-dq]').forEach(btn => {
        btn.onclick = async () => {
            const [battleId, userId] = btn.dataset.dq.split(':');
            await adminRequest(`/live-battles/${battleId}/disqualify`, {
                method: 'POST',
                body: JSON.stringify({ userId: Number(userId) })
            });
            renderLiveBattles();
        };
    });
}

async function renderMatchHistory() {
    const data = await adminRequest('/match-history');
    sectionRoot.innerHTML = `
        <div class="filters">
            <input id="historyDate" type="date">
            <input id="historyUser" type="text" placeholder="Filter by user">
            <select id="historyResult"><option value="">All</option><option>Win</option><option>Draw</option></select>
            <button class="btn btn-primary btn-sm" id="historyApply">Apply</button>
        </div>
        <div id="historyTable"></div>
    `;

    const renderTable = (rows) => {
        document.getElementById('historyTable').innerHTML = makeTable(
            ['P1', 'P2', 'Winner', 'Problem', 'Duration', 'Status'],
            rows.map(row => `
                <tr>
                    <td>${row.player1}</td>
                    <td>${row.player2}</td>
                    <td>${row.winner}</td>
                    <td>${row.problem}</td>
                    <td>${Math.floor((row.durationSec || 0) / 60)}m ${(row.durationSec || 0) % 60}s</td>
                    <td>${row.status}</td>
                </tr>
            `)
        );
    };

    renderTable(data);

    document.getElementById('historyApply').onclick = async () => {
        const date = document.getElementById('historyDate').value;
        const user = document.getElementById('historyUser').value;
        const result = document.getElementById('historyResult').value;
        const rows = await adminRequest(`/match-history?${new URLSearchParams({ date, user, result })}`);
        renderTable(rows);
    };
}

async function renderProblems() {
    const rows = await adminRequest('/problems');
    problemCache = rows;
    if (!selectedProblemId && rows.length) selectedProblemId = rows[0].id;

    sectionRoot.innerHTML = `
        <div class="filters">
            <input id="pTitle" placeholder="Title">
            <select id="pDifficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
            <input id="pTags" placeholder="tags (comma)">
            <button class="btn btn-primary btn-sm" id="addProblemBtn">Add Problem</button>
        </div>
        ${makeTable(
        ['ID', 'Title', 'Difficulty', 'Tags', 'Actions'],
        rows.map(row => `<tr>
                <td>${row.id}</td>
                <td>${row.title}</td>
                <td>${row.difficulty}</td>
                <td>${(row.tags || []).join(', ')}</td>
                <td><button class="btn btn-secondary btn-sm" data-del-problem="${row.id}">Delete</button></td>
            </tr>`)
    )}
    `;

    document.getElementById('addProblemBtn').onclick = async () => {
        await adminRequest('/problems', {
            method: 'POST',
            body: JSON.stringify({
                title: document.getElementById('pTitle').value || 'New Problem',
                description: 'Problem description',
                difficulty: document.getElementById('pDifficulty').value,
                tags: document.getElementById('pTags').value.split(',').map(s => s.trim()).filter(Boolean)
            })
        });
        renderProblems();
    };

    sectionRoot.querySelectorAll('[data-del-problem]').forEach(btn => {
        btn.onclick = async () => {
            await adminRequest(`/problems/${btn.dataset.delProblem}`, { method: 'DELETE' });
            renderProblems();
        };
    });
}

async function renderTestcases() {
    if (!problemCache.length) {
        await renderProblems();
    }
    const options = problemCache.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    const rows = selectedProblemId ? await adminRequest(`/problems/${selectedProblemId}/testcases`) : [];

    sectionRoot.innerHTML = `
        <div class="filters">
            <select id="tcProblemSelect">${options}</select>
            <button class="btn btn-secondary btn-sm" id="tcReload">Reload</button>
            <button class="btn btn-primary btn-sm" id="tcSave">Save 15 Testcases</button>
        </div>
        <div id="tcWrap"></div>
    `;

    document.getElementById('tcProblemSelect').value = String(selectedProblemId || '');

    const renderRows = (items) => {
        document.getElementById('tcWrap').innerHTML = makeTable(
            ['#', 'Input', 'Expected', 'Visible'],
            items.map((row, idx) => `<tr>
                <td>${idx + 1}</td>
                <td><input class="input" data-tc-input="${idx}" value="${(row.input || '').replaceAll('"', '&quot;')}"></td>
                <td><input class="input" data-tc-expected="${idx}" value="${(row.expected || '').replaceAll('"', '&quot;')}"></td>
                <td><input type="checkbox" data-tc-visible="${idx}" ${row.visible ? 'checked' : ''}></td>
            </tr>`)
        );
    };

    const model = rows.length ? rows : Array.from({ length: 15 }, (_, i) => ({ input: '', expected: '', visible: i < 3 }));
    renderRows(model);

    document.getElementById('tcProblemSelect').onchange = async (e) => {
        selectedProblemId = Number(e.target.value);
        renderTestcases();
    };

    document.getElementById('tcReload').onclick = renderTestcases;

    document.getElementById('tcSave').onclick = async () => {
        const payload = model.map((_, idx) => ({
            input: document.querySelector(`[data-tc-input="${idx}"]`).value,
            expected: document.querySelector(`[data-tc-expected="${idx}"]`).value,
            visible: document.querySelector(`[data-tc-visible="${idx}"]`).checked
        }));

        await adminRequest(`/problems/${selectedProblemId}/testcases`, {
            method: 'PUT',
            body: JSON.stringify({ testcases: payload })
        });
        showAlert('Testcases updated successfully');
    };
}

async function renderUsers() {
    const rows = await adminRequest('/users');
    sectionRoot.innerHTML = makeTable(
        ['Name', 'Username', 'Role', 'Coins', 'Solved', 'Actions'],
        rows.map(row => `
            <tr>
                <td>${row.displayName}</td>
                <td>${row.username}</td>
                <td>${row.role}</td>
                <td>${row.coins}</td>
                <td>${row.problemsSolved}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-ban="${row.id}">Ban</button>
                    <button class="btn btn-secondary btn-sm" data-unban="${row.id}">Unban</button>
                    <button class="btn btn-secondary btn-sm" data-reset="${row.id}">Reset</button>
                </td>
            </tr>
        `)
    );

    sectionRoot.querySelectorAll('[data-ban]').forEach(btn => btn.onclick = async () => {
        await adminRequest(`/users/${btn.dataset.ban}/ban`, { method: 'POST' });
        renderUsers();
    });
    sectionRoot.querySelectorAll('[data-unban]').forEach(btn => btn.onclick = async () => {
        await adminRequest(`/users/${btn.dataset.unban}/unban`, { method: 'POST' });
        renderUsers();
    });
    sectionRoot.querySelectorAll('[data-reset]').forEach(btn => btn.onclick = async () => {
        await adminRequest(`/users/${btn.dataset.reset}/reset-stats`, { method: 'POST' });
        renderUsers();
    });
}

async function renderSubmissions() {
    const rows = await adminRequest('/submissions');
    sectionRoot.innerHTML = `
        <div class="filters">
            <select id="subFilter"><option value="">All</option><option value="ACCEPTED">Accepted</option><option value="WRONG_ANSWER">Wrong Answer</option><option value="RUNTIME_ERROR">Runtime Error</option></select>
            <button class="btn btn-primary btn-sm" id="subApply">Apply</button>
        </div>
        <div id="subWrap"></div>
    `;

    const draw = (items) => {
        document.getElementById('subWrap').innerHTML = makeTable(
            ['User', 'Problem', 'Status', 'Runtime', 'Memory', 'Time'],
            items.map(row => `<tr>
                <td>${row.user}</td>
                <td>${row.problem}</td>
                <td>${row.status}</td>
                <td>${row.runtimeMs} ms</td>
                <td>${row.memoryKb} KB</td>
                <td>${row.createdAt}</td>
            </tr>`)
        );
    };

    draw(rows);
    document.getElementById('subApply').onclick = async () => {
        const status = document.getElementById('subFilter').value;
        const data = await adminRequest(`/submissions?${new URLSearchParams({ status })}`);
        draw(data);
    };
}

async function renderLeaderboard() {
    const rows = await adminRequest('/leaderboard');
    sectionRoot.innerHTML = `
        <div class="filters">
            <button class="btn btn-secondary btn-sm" id="lbReset">Reset Leaderboard</button>
        </div>
        ${makeTable(
        ['Rank', 'Name', 'Coins', 'Solved', 'Adjust'],
        rows.map(row => `<tr>
                <td>${row.rank}</td>
                <td>${row.name}</td>
                <td>${row.coins}</td>
                <td>${row.problemsSolved}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-plus="${row.id}">+25</button>
                    <button class="btn btn-secondary btn-sm" data-minus="${row.id}">-25</button>
                </td>
            </tr>`)
    )}
    `;

    document.getElementById('lbReset').onclick = async () => {
        await adminRequest('/leaderboard/reset', { method: 'POST' });
        renderLeaderboard();
    };

    sectionRoot.querySelectorAll('[data-plus]').forEach(btn => btn.onclick = async () => {
        await adminRequest(`/leaderboard/${btn.dataset.plus}/adjust-points`, { method: 'POST', body: JSON.stringify({ delta: 25 }) });
        renderLeaderboard();
    });
    sectionRoot.querySelectorAll('[data-minus]').forEach(btn => btn.onclick = async () => {
        await adminRequest(`/leaderboard/${btn.dataset.minus}/adjust-points`, { method: 'POST', body: JSON.stringify({ delta: -25 }) });
        renderLeaderboard();
    });
}

async function renderErrors() {
    const rows = await adminRequest('/errors');
    sectionRoot.innerHTML = makeTable(
        ['Type', 'Message', 'User', 'Problem', 'Time'],
        rows.map(row => `<tr>
            <td>${row.type}</td>
            <td style="max-width:420px;white-space:normal;">${row.message}</td>
            <td>${row.user}</td>
            <td>${row.problem}</td>
            <td>${row.createdAt}</td>
        </tr>`)
    );
}

async function renderSettings() {
    const data = await adminRequest('/settings');
    sectionRoot.innerHTML = `
        <div class="card">
            <h3 style="font-weight:700;margin-bottom:.6rem;">Battle Rules</h3>
            <textarea id="settingsBox" class="input" style="min-height:260px;width:100%;font-family:monospace;">${JSON.stringify(data, null, 2)}</textarea>
            <button class="btn btn-primary" id="settingsSave" style="margin-top:.7rem;">Save Settings</button>
        </div>
    `;

    document.getElementById('settingsSave').onclick = async () => {
        let parsed = {};
        try {
            parsed = JSON.parse(document.getElementById('settingsBox').value);
        } catch (_e) {
            showAlert('Invalid JSON');
            return;
        }

        await adminRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(parsed)
        });
        showAlert('Settings updated');
    };
}

async function renderSection() {
    try {
        if (currentSection === 'Dashboard') return await renderDashboard();
        if (currentSection === 'Live Battles') return await renderLiveBattles();
        if (currentSection === 'Match History') return await renderMatchHistory();
        if (currentSection === 'Problems') return await renderProblems();
        if (currentSection === 'Testcases') return await renderTestcases();
        if (currentSection === 'Users') return await renderUsers();
        if (currentSection === 'Submissions') return await renderSubmissions();
        if (currentSection === 'Leaderboard') return await renderLeaderboard();
        if (currentSection === 'Error Monitoring') return await renderErrors();
        if (currentSection === 'Settings') return await renderSettings();
        if (currentSection === 'Events') return await renderEvents();
    } catch (e) {
        showAlert(e.message || 'Failed to load section');
    }
}

document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('cc_admin_session');
    window.location.href = 'login.html';
});

renderNav();
renderSection();
window.adminInterval = setInterval(() => {
    if (currentSection === 'Live Battles' || currentSection === 'Dashboard') {
        renderSection();
    }
}, 5000);

async function renderEvents() {
    const data = await adminRequest('/events');
    const container = document.createElement('div');
    container.className = 'events-view';
    
    sectionRoot.innerHTML = `
        <style>
            .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
            .event-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; transition: all 0.3s ease; position: relative; overflow: hidden; }
            .event-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .event-card.create-new { border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; min-height: 200px; }
            .event-card.create-new:hover { border-color: var(--accent); color: var(--accent); }
            .event-badge { position: absolute; top: 1rem; right: 1rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
            .badge-live { background: #ff6b00; color: white; box-shadow: 0 0 15px rgba(255,107,0,0.4); }
            .badge-upcoming { background: #333; color: #999; }
            .event-title { font-size: 1.25rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--text-primary); }
            .event-info { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary); }
            .info-item b { display: block; color: var(--text-primary); margin-bottom: 0.2rem; }
            .event-actions { display: flex; gap: 0.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem; }
            
            /* Wizard Styles */
            .wizard-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
            .wizard-card { background: #111; border: 1px solid var(--border); width: 500px; border-radius: 24px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            .wizard-step { display: none; }
            .wizard-step.active { display: block; }
            .step-indicator { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
            .step-dot { flex: 1; height: 4px; background: #222; border-radius: 2px; }
            .step-dot.active { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
        </style>
        
        <div class="events-grid">
            <div class="event-card create-new" id="openWizardBtn">
                <span style="font-size: 2.5rem; margin-bottom: 0.5rem;">➕</span>
                <h3 style="font-weight: 800;">Create New Event</h3>
            </div>
            ${data.map(event => `
                <div class="event-card">
                    <div class="event-title">${event.title}</div>
                    <div style="font-size: 0.85rem; color: var(--accent); font-weight: 700;">${event.biddingTitle}</div>
                    
                    <div class="event-info">
                        <div class="info-item"><b>Entry Fee</b>🪙 ${event.entryFee}</div>
                        <div class="info-item"><b>Max Spots</b>👥 ${event.maxParticipants}</div>
                        <div class="info-item"><b>Bidding Start</b>📅 ${new Date(event.biddingStartTime).toLocaleString()}</div>
                        <div class="info-item"><b>Contest Start</b>🚀 ${new Date(event.contestStartTime).toLocaleString()}</div>
                    </div>

                    <div class="event-actions">
                        <button class="btn btn-secondary btn-sm" style="flex:1" onclick="editEvent('${event.id}')">✏️ Edit</button>
                        <button class="btn btn-secondary btn-sm" style="flex:1" onclick="previewEvent('${event.id}')">👁 Preview</button>
                        <button class="btn btn-secondary btn-sm" style="color:#ff4444" onclick="deleteEvent('${event.id}')">🗑 Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('openWizardBtn').onclick = openCreateWizard;
}

function openCreateWizard() {
    const overlay = document.createElement('div');
    overlay.className = 'wizard-overlay';
    overlay.innerHTML = `
        <div class="wizard-card">
            <div class="step-indicator">
                <div class="step-dot active" id="dot1"></div>
                <div class="step-dot" id="dot2"></div>
                <div class="step-dot" id="dot3"></div>
            </div>

            <!-- STEP 1: BIDDING -->
            <div class="wizard-step active" id="step1">
                <h2 style="font-weight:900;margin-bottom:0.5rem;">Step 1: Bidding 🪙</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">Configure the entry and timing.</p>
                
                <div class="form-group" style="margin-bottom:1rem;">
                    <label>Event Title</label>
                    <input type="text" id="ev_title" class="input" placeholder="e.g. Weekend Clash #42" style="width:100%">
                </div>
                <div class="form-group" style="margin-bottom:1rem;">
                    <label>Bidding Title</label>
                    <input type="text" id="ev_b_title" class="input" placeholder="e.g. Elite Qualifiers" style="width:100%">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                    <div class="form-group">
                        <label>Entry Fee</label>
                        <input type="number" id="ev_fee" class="input" value="100" style="width:100%">
                    </div>
                    <div class="form-group">
                        <label>Bidding Start</label>
                        <input type="datetime-local" id="ev_b_start" class="input" style="width:100%">
                    </div>
                </div>
                <button class="btn btn-primary" id="toStep2" style="width:100%;padding:0.8rem;font-weight:800;">Next: Contest Details →</button>
            </div>

            <!-- STEP 2: CONTEST -->
            <div class="wizard-step" id="step2">
                <h2 style="font-weight:900;margin-bottom:0.5rem;">Step 2: Contest 🚀</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">Set the playground rules.</p>
                
                <div class="form-group" style="margin-bottom:1rem;">
                    <label>Contest Title</label>
                    <input type="text" id="ev_c_title" class="input" placeholder="e.g. The Grand Arena" style="width:100%">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
                    <div class="form-group">
                        <label>Contest Start</label>
                        <input type="datetime-local" id="ev_c_start" class="input" style="width:100%">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <select id="ev_c_dur" class="input" style="width:100%;background:#0a0a0a;">
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60" selected>60 Minutes</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:1.5rem;">
                    <label>Problem IDs (comma-separated)</label>
                    <input type="text" id="ev_probs" class="input" placeholder="1, 2, 3" style="width:100%">
                </div>
                <div style="display:flex;gap:1rem;">
                    <button class="btn btn-secondary" id="backTo1" style="flex:1">Back</button>
                    <button class="btn btn-primary" id="toStep3" style="flex:2;font-weight:800;">Next: Selection →</button>
                </div>
            </div>

            <!-- STEP 3: SELECTION -->
            <div class="wizard-step" id="step3">
                <h2 style="font-weight:900;margin-bottom:0.5rem;">Step 3: Selection 🏆</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">Finalize participant limits.</p>
                
                <div class="form-group" style="margin-bottom:2rem;">
                    <label>Max Winners (Top N)</label>
                    <input type="number" id="ev_max" class="input" value="10" style="width:100%;font-size:1.5rem;text-align:center;">
                </div>
                
                <div style="display:flex;gap:1rem;">
                    <button class="btn btn-secondary" id="backTo2" style="flex:1">Back</button>
                    <button class="btn btn-primary" id="finishWizard" style="flex:2;font-weight:900;background:linear-gradient(45deg, #ff6b00, #ff9e00);box-shadow: 0 0 20px rgba(255,107,0,0.3);">Create Event 🚀</button>
                </div>
            </div>
            
            <button onclick="this.closest('.wizard-overlay').remove()" style="position:absolute;top:1rem;right:1rem;background:transparent;border:none;color:#555;cursor:pointer;font-size:1.5rem;">✕</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Navigation logic
    document.getElementById('toStep2').onclick = () => {
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        document.getElementById('dot2').classList.add('active');
    };
    document.getElementById('backTo1').onclick = () => {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        document.getElementById('dot2').classList.remove('active');
    };
    document.getElementById('toStep3').onclick = () => {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        document.getElementById('dot3').classList.add('active');
    };
    document.getElementById('backTo2').onclick = () => {
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        document.getElementById('dot3').classList.remove('active');
    };

    document.getElementById('finishWizard').onclick = async () => {
        const body = {
            title: document.getElementById('ev_title').value,
            biddingTitle: document.getElementById('ev_b_title').value,
            entryFee: parseInt(document.getElementById('ev_fee').value),
            biddingStartTime: document.getElementById('ev_b_start').value,
            contestTitle: document.getElementById('ev_c_title').value,
            contestStartTime: document.getElementById('ev_c_start').value,
            contestDuration: document.getElementById('ev_c_dur').value,
            problemIds: document.getElementById('ev_probs').value,
            maxParticipants: parseInt(document.getElementById('ev_max').value)
        };

        try {
            await adminRequest('/events', { method: 'POST', body: JSON.stringify(body) });
            overlay.remove();
            showAlert('Event created successfully! 🚀');
            renderEvents();
        } catch (e) {
            showAlert(e.message);
        }
    };
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await adminRequest(`/events/${id}`, { method: 'DELETE' });
        renderEvents();
    } catch (e) {
        showAlert(e.message);
    }
}

function editEvent(id) {
    showAlert('Edit functionality coming soon! For now, please recreate the event.');
}

function previewEvent(id) {
    window.open('/events.html#' + id, '_blank');
}
