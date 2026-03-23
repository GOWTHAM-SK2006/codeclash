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
    'Leaderboard',
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
const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading(show) {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
}

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
        window.location.replace('login.html');
        throw new Error('Admin session expired. Redirecting to login...');
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

    liveCounter.innerHTML = `<div class="live-pulse"><span class="live-dot"></span> LIVE: ${stats.activeBattles || 0}</div>`;

    // Partially update if already on Dashboard to prevent animation flicker
    if (sectionRoot.dataset.section === 'Dashboard') {
        const valueElements = sectionRoot.querySelectorAll('.stat-value');
        if (valueElements.length >= 5) {
            valueElements[0].textContent = stats.totalUsers || 0;
            valueElements[1].textContent = stats.totalProblems || 0;
            valueElements[2].textContent = stats.totalSubmissions || 0;
            valueElements[3].textContent = stats.totalBattlesPlayed || 0;
            valueElements[4].textContent = stats.activeBattles || 0;
            return;
        }
    }

    sectionRoot.dataset.section = 'Dashboard';
    sectionRoot.innerHTML = `
        <div class="animate-fade-in">
            <div class="dashboard-hero">
                <div class="hero-content">
                    <h1>Welcome Back, <span style="color:var(--accent)">Admin</span></h1>
                    <p>System is running smoothly. Here's what's happening today.</p>
                </div>
                <div class="hero-actions">
                    <button class="btn btn-primary" onclick="currentSection='Events'; renderNav(); renderSection();">
                        <i data-lucide="calendar" style="width:18px;height:18px;"></i> Manage Events
                    </button>
                </div>
            </div>

            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                <div class="stat-card-premium stagger-card" style="animation-delay: 0.1s">
                    <div class="icon-wrapper"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <span class="stat-label">Total Users</span>
                        <span class="stat-value">${stats.totalUsers || 0}</span>
                    </div>
                </div>
                <div class="stat-card-premium stagger-card" style="animation-delay: 0.2s">
                    <div class="icon-wrapper"><i data-lucide="file-code"></i></div>
                    <div class="stat-info">
                        <span class="stat-label">Total Problems</span>
                        <span class="stat-value">${stats.totalProblems || 0}</span>
                    </div>
                </div>
                <div class="stat-card-premium stagger-card" style="animation-delay: 0.3s">
                    <div class="icon-wrapper"><i data-lucide="send"></i></div>
                    <div class="stat-info">
                        <span class="stat-label">Submissions</span>
                        <span class="stat-value">${stats.totalSubmissions || 0}</span>
                    </div>
                </div>
                <div class="stat-card-premium stagger-card" style="animation-delay: 0.4s">
                    <div class="icon-wrapper"><i data-lucide="swords"></i></div>
                    <div class="stat-info">
                        <span class="stat-label">Total Battles</span>
                        <span class="stat-value">${stats.totalBattlesPlayed || 0}</span>
                    </div>
                </div>
                <div class="stat-card-premium stagger-card" style="animation-delay: 0.5s">
                    <div class="icon-wrapper" style="background:rgba(0,200,83,0.1); color:var(--success); border-color:rgba(0,200,83,0.2);">
                        <i data-lucide="activity"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-label">Active Battles</span>
                        <span class="stat-value" style="color:var(--success)">${stats.activeBattles || 0}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 2.5rem;" class="stagger-card" style="animation-delay: 0.6s">
                <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="zap" style="color:var(--accent)"></i> Quick Insights
                </h2>
                <div class="card" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); padding: 2rem; border-radius: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
                        <div>
                            <h4 style="color:var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Server Status</h4>
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--success); font-weight: 700;">
                                <span class="live-dot"></span> Operational
                            </div>
                        </div>
                        <div>
                            <h4 style="color:var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Database</h4>
                            <div style="color: #fff; font-weight: 700;">Connected</div>
                        </div>
                        <div>
                            <h4 style="color:var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Queue Latency</h4>
                            <div style="color: #fff; font-weight: 700;">12ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}


async function renderLiveBattles() {
    const rows = await adminRequest('/live-battles');
    liveCounter.textContent = `LIVE: ${rows.length}`;

    sectionRoot.dataset.section = 'Live Battles';
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

    sectionRoot.dataset.section = 'Match History';
    sectionRoot.innerHTML = `
        <div class="animate-fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.8rem; font-weight: 900; display:flex; align-items:center; gap:0.8rem;">
                    <i data-lucide="history" style="color:var(--accent); width:28px; height:28px;"></i> Match History
                </h2>
                <div class="badge badge-accent" style="padding: 0.5rem 1rem;">Total Records: ${data.length}</div>
            </div>

            <div class="history-filters">
                <div style="flex:1; display:flex; gap:0.8rem;">
                    <input id="historyDate" type="date" class="input" style="max-width:180px;">
                    <input id="historyUser" type="text" placeholder="Filter by user..." class="input" style="max-width:240px;">
                    <select id="historyResult" class="input" style="max-width:140px;">
                        <option value="">All Results</option>
                        <option>Win</option>
                        <option>Draw</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="historyApply" style="padding: 0.6rem 2rem;">
                    <i data-lucide="search" style="width:16px; height:16px;"></i> Apply Filters
                </button>
            </div>

            <div id="historyTable" class="history-table-container"></div>
        </div>
    `;

    const renderTable = (rows) => {
        const tableBody = rows.map((row, idx) => {
            const isWinnerP1 = row.winner === row.player1;
            const isWinnerP2 = row.winner === row.player2;
            const isDraw = row.winner === 'Draw';

            let statusClass = 'finished';
            let statusIcon = 'check-circle';
            if (row.status === 'CANCELLED') {
                statusClass = 'cancelled';
                statusIcon = 'x-circle';
            } else if (isDraw) {
                statusClass = 'draw';
                statusIcon = 'minus-circle';
            }

            return `
                <tr class="stagger-card" style="animation-delay: ${idx * 0.05}s">
                    <td>
                        <div class="player-info ${isWinnerP1 ? 'winner-highlight' : ''}">
                            <i data-lucide="user"></i> ${row.player1}
                        </div>
                    </td>
                    <td>
                        <div class="player-info ${isWinnerP2 ? 'winner-highlight' : ''}">
                            <i data-lucide="user"></i> ${row.player2}
                        </div>
                    </td>
                    <td>
                        <div class="player-info ${!isDraw ? 'winner-highlight' : ''}">
                            <i data-lucide="${isDraw ? 'minus' : 'trophy'}" style="width:14px; height:14px;"></i> 
                            ${row.winner}
                        </div>
                    </td>
                    <td><code style="color:var(--text-secondary)">${row.problem}</code></td>
                    <td style="font-weight:700;">${Math.floor((row.durationSec || 0) / 60)}m ${(row.durationSec || 0) % 60}s</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i data-lucide="${statusIcon}" style="width:12px; height:12px;"></i> ${row.status}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('historyTable').innerHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Player 1</th>
                        <th>Player 2</th>
                        <th>Winner</th>
                        <th>Problem</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length ? tableBody : '<tr><td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">No match history found matching your criteria.</td></tr>'}
                </tbody>
            </table>
        `;

        if (window.lucide) lucide.createIcons();
    };

    renderTable(data);

    document.getElementById('historyApply').onclick = async () => {
        const btn = document.getElementById('historyApply');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Searching...';

        const date = document.getElementById('historyDate').value;
        const user = document.getElementById('historyUser').value;
        const result = document.getElementById('historyResult').value;

        try {
            const rows = await adminRequest(`/match-history?${new URLSearchParams({ date, user, result })}`);
            renderTable(rows);
        } catch (e) {
            showAlert('Failed to filter history: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    };

    if (window.lucide) lucide.createIcons();
}


async function renderProblems() {
    const rows = await adminRequest('/problems');
    problemCache = rows;
    if (!selectedProblemId && rows.length) selectedProblemId = rows[0].id;

    sectionRoot.dataset.section = 'Problems';
    sectionRoot.innerHTML = `
        <div class="animate-fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.8rem; font-weight: 900; display:flex; align-items:center; gap:0.8rem;">
                    <i data-lucide="layout-list" style="color:var(--accent); width:28px; height:28px;"></i> Problem Repository
                </h2>
                <div class="badge badge-accent" style="padding: 0.5rem 1rem;">Total Problems: ${rows.length}</div>
            </div>

            <div class="history-filters" style="gap: 1.2rem;">
                <div style="flex:1; display:flex; gap:0.8rem; align-items:center;">
                    <i data-lucide="plus-square" style="color:var(--accent); width:20px; height:20px;"></i>
                    <input id="pTitle" placeholder="Problem Title" class="input" style="max-width:300px;">
                    <select id="pDifficulty" class="input" style="max-width:140px;">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                    <input id="pTags" placeholder="Tags (comma separated)" class="input" style="max-width:260px;">
                </div>
                <div style="display:flex; gap:0.8rem;">
                    <input id="pSearch" placeholder="Search problems..." class="input" style="max-width:200px; background:rgba(255,255,255,0.05);">
                    <button class="btn btn-primary" id="addProblemBtn" style="padding: 0.6rem 1.8rem;">
                        <i data-lucide="plus" style="width:16px; height:16px;"></i> Create Problem
                    </button>
                </div>
            </div>

            <div class="history-table-container">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th style="width:80px;">ID</th>
                            <th>Problem Title</th>
                            <th style="width:140px;">Difficulty</th>
                            <th>Tags</th>
                            <th style="width:100px; text-align:center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.slice(0, 100).map((row, idx) => `
                            <tr class="stagger-card clickable" style="animation-delay: ${Math.min(idx * 0.05, 1)}s" data-problem-row="${row.id}">
                                <td style="color:var(--text-muted); font-weight:600;">#${row.id}</td>
                                <td style="font-weight:700;">${row.title}</td>
                                <td>
                                    <span class="status-badge ${row.difficulty.toLowerCase()}">
                                        <i data-lucide="shield" style="width:12px; height:12px;"></i> ${row.difficulty}
                                    </span>
                                </td>
                                <td>
                                    ${(row.tags || []).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                                </td>
                                <td style="text-align:center;">
                                    <button class="action-icon-btn" data-del-problem="${row.id}" title="Delete Problem">
                                        <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('addProblemBtn').onclick = async () => {
        const btn = document.getElementById('addProblemBtn');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Creating...';

        try {
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
        } catch (e) {
            showAlert('Failed to create problem: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    };

    document.getElementById('pSearch').oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = problemCache.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.tags || []).some(t => t.toLowerCase().includes(query))
        );
        renderProblemsRows(filtered);
    };

    if (window.lucide) lucide.createIcons();
}

function renderProblemsRows(rows) {
    const tbody = sectionRoot.querySelector('.history-table tbody');
    if (!tbody) return;

    tbody.innerHTML = rows.slice(0, 100).map((row, idx) => `
        <tr class="stagger-card clickable" style="animation-delay: ${Math.min(idx * 0.05, 0.5)}s" data-problem-row="${row.id}">
            <td style="color:var(--text-muted); font-weight:600;">#${row.id}</td>
            <td style="font-weight:700;">${row.title}</td>
            <td>
                <span class="status-badge ${row.difficulty.toLowerCase()}">
                    <i data-lucide="shield" style="width:12px; height:12px;"></i> ${row.difficulty}
                </span>
            </td>
            <td>
                ${(row.tags || []).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
            </td>
            <td style="text-align:center;">
                <button class="action-icon-btn" data-del-problem="${row.id}" title="Delete Problem">
                    <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('[data-problem-row]').forEach(row => {
        row.onclick = (e) => {
            if (e.target.closest('[data-del-problem]')) return;
            selectedProblemId = Number(row.dataset.problemRow);
            currentSection = 'Testcases';
            sectionTitle.textContent = currentSection;
            renderNav();
            renderSection();
        };
    });

    tbody.querySelectorAll('[data-del-problem]').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm(`Are you sure you want to delete problem #${btn.dataset.delProblem}?`)) return;
            try {
                await adminRequest(`/problems/${btn.dataset.delProblem}`, { method: 'DELETE' });
                renderProblems();
            } catch (err) {
                showAlert('Failed to delete problem: ' + err.message);
            }
        };
    });

    if (window.lucide) lucide.createIcons();
}


async function fetchProblems() {
    const rows = await adminRequest('/problems');
    problemCache = rows;
    if (!selectedProblemId && rows.length) selectedProblemId = rows[0].id;
    return rows;
}


async function renderTestcases() {
    if (!problemCache.length) {
        await fetchProblems();
    }
    const options = problemCache.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    const rows = selectedProblemId ? await adminRequest(`/problems/${selectedProblemId}/testcases`) : [];

    sectionRoot.dataset.section = 'Testcases';
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

async function renderLeaderboard() {
    const rows = await adminRequest('/leaderboard');
    sectionRoot.innerHTML = `
        <div class="filters">
            <button class="btn btn-secondary btn-sm" id="lbReset">Reset Leaderboard</button>
        </div>
        ${makeTable(
        ['Rank', 'Name', 'Coins', 'Attended', 'Wins', 'Score', 'Adjust'],
        rows.map(row => {
            const score = (row.coins || 0) * 2 + (row.battleWins || 0) * 2 + (row.battlesAttended || 0);
            return `<tr>
                <td>${row.rank}</td>
                <td>${row.name}</td>
                <td>${row.coins}</td>
                <td>${row.battlesAttended || 0}</td>
                <td>${row.battleWins || 0}</td>
                <td style="font-weight:800; color:var(--accent);">${score}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-plus="${row.id}">+25</button>
                    <button class="btn btn-secondary btn-sm" data-minus="${row.id}">-25</button>
                </td>
            </tr>`;
        })
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

async function renderSettings() {
    const data = await adminRequest('/settings');

    // Helper to get nested value safely
    const get = (path, fallback = '') => {
        const parts = path.split('.');
        let curr = data;
        for (const p of parts) {
            if (curr && curr[p] !== undefined) curr = curr[p];
            else return fallback;
        }
        return curr;
    };

    // Helper to render a section
    const section = (title, icon, content) => `
        <div class="card" style="margin-bottom: 1rem; height: 100%;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">${icon}</span>
                <h3 style="font-weight: 800; margin: 0; color: var(--accent);">${title}</h3>
            </div>
            <div style="display: grid; gap: 0.8rem;">
                ${content}
            </div>
        </div>
    `;

    // Helper to render a field
    const field = (label, id, type, value, options = {}) => {
        let input = '';
        if (type === 'toggle') {
            input = `
                <label class="switch">
                    <input type="checkbox" id="${id}" ${value ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            `;
        } else if (type === 'number') {
            input = `<input type="number" id="${id}" class="filters" style="width: 80px; text-align: center; background: #111; border: 1px solid #333; color: white; border-radius: 6px; padding: 4px;" value="${value}">`;
        } else if (type === 'select') {
            input = `
                <select id="${id}" class="filters" style="width: auto; background: #111; border: 1px solid #333; color: white; border-radius: 6px; padding: 4px;">
                    ${options.map(opt => `<option value="${opt.val}" ${value == opt.val ? 'selected' : ''}>${opt.lab}</option>`).join('')}
                </select>
            `;
        }

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0;">
                <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">${label}</span>
                ${input}
            </div>
        `;
    };

    sectionRoot.innerHTML = `
        <style>
            .switch { position: relative; display: inline-block; width: 42px; height: 22px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; inset: 0; background-color: #222; transition: .4s; border-radius: 34px; border: 1px solid #333; }
            .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: #666; transition: .4s; border-radius: 50%; shadow: 0 2px 4px rgba(0,0,0,0.5); }
            input:checked + .slider { background-color: rgba(255, 107, 0, 0.2); border-color: var(--accent); }
            input:checked + .slider:before { transform: translateX(20px); background-color: var(--accent); }
            .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
        </style>
        
        <div class="settings-grid">
            ${section('Platform Settings', '🌐', `
                ${field('Allow Registrations', 'plat_reg', 'toggle', get('platform.allowRegistrations', true))}
                ${field('Maintenance Mode', 'plat_maint', 'toggle', get('platform.maintenanceMode', false))}
            `)}

            ${section('Battle Settings', '⚔️', `
                ${field('Max Battle Duration (Min)', 'bat_dur', 'number', get('battle.maxDuration', 30))}
                ${field('Allow Fullscreen Mode', 'bat_fs', 'toggle', get('battle.allowFullscreen', true))}
                ${field('Auto Submit on Timeout', 'bat_auto', 'toggle', get('battle.autoSubmit', true))}
            `)}

            ${section('Bidding Settings', '🪙', `
                ${field('Default Entry Fee', 'bid_fee', 'number', get('bidding.entryFee', 100))}
                ${field('Bid Increment Value', 'bid_inc', 'number', get('bidding.increment', 50))}
                ${field('Bidding Duration (Min)', 'bid_dur', 'number', get('bidding.duration', 10))}
                ${field('Max Participants (Top N)', 'bid_max', 'number', get('bidding.maxParticipants', 10))}
            `)}

            ${section('Contest Settings', '🏆', `
                ${field('Default Duration', 'con_dur', 'select', get('contest.duration', 45), [
        { val: 30, lab: '30 Minutes' }, { val: 45, lab: '45 Minutes' }, { val: 60, lab: '60 Minutes' }
    ])}
                ${field('Delay After Bidding (Min)', 'con_delay', 'number', get('contest.delayAfterBidding', 2))}
                ${field('Allow Late Entry', 'con_late', 'toggle', get('contest.allowLateEntry', false))}
            `)}

            ${section('Coin Settings', '💰', `
                ${field('Coins per Win', 'coin_win', 'number', get('reward.winCoins', 50))}
                ${field('Daily Login Reward', 'coin_daily', 'number', get('reward.dailyCoins', 10))}
                ${field('Refund Policy', 'coin_refund', 'toggle', get('reward.refundPolicy', true))}
            `)}

            ${section('Safety Settings', '🛡️', `
                ${field('Anti-cheat Enabled', 'saf_anti', 'toggle', get('safety.antiCheat', true))}
                ${field('Disable Copy-Paste', 'saf_cp', 'toggle', get('safety.disableCopyPaste', true))}
                ${field('Tab Switch Warning', 'saf_tab', 'toggle', get('safety.tabSwitchWarning', true))}
            `)}
        </div>

        <div style="margin-top: 2.5rem; display: flex; justify-content: center; margin-bottom: 2rem;">
            <button class="btn btn-primary" id="settingsSave" style="padding: 1rem 4rem; font-weight: 900; letter-spacing: 2px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);">SAVE ALL SETTINGS</button>
        </div>
    `;

    document.getElementById('settingsSave').onclick = async () => {
        const btn = document.getElementById('settingsSave');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'SAVING CHANGES...';

        const payload = {
            platform: {
                allowRegistrations: document.getElementById('plat_reg').checked,
                maintenanceMode: document.getElementById('plat_maint').checked
            },
            battle: {
                maxDuration: parseInt(document.getElementById('bat_dur').value),
                allowFullscreen: document.getElementById('bat_fs').checked,
                autoSubmit: document.getElementById('bat_auto').checked,
                disqualifyOnExit: get('battle.disqualifyOnExit', true)
            },
            bidding: {
                entryFee: parseInt(document.getElementById('bid_fee').value),
                increment: parseInt(document.getElementById('bid_inc').value),
                duration: parseInt(document.getElementById('bid_dur').value),
                maxParticipants: parseInt(document.getElementById('bid_max').value)
            },
            contest: {
                duration: parseInt(document.getElementById('con_dur').value),
                delayAfterBidding: parseInt(document.getElementById('con_delay').value),
                allowLateEntry: document.getElementById('con_late').checked
            },
            reward: {
                winCoins: parseInt(document.getElementById('coin_win').value),
                dailyCoins: parseInt(document.getElementById('coin_daily').value),
                refundPolicy: document.getElementById('coin_refund').checked
            },
            safety: {
                antiCheat: document.getElementById('saf_anti').checked,
                disableCopyPaste: document.getElementById('saf_cp').checked,
                tabSwitchWarning: document.getElementById('saf_tab').checked
            }
        };

        try {
            await adminRequest('/settings', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showAlert('Settings successfully synchronized! ✨');
        } catch (e) {
            showAlert('Error: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };
}

async function renderSection(silent = false) {
    if (!silent) showLoading(true);
    try {
        if (currentSection === 'Dashboard') await renderDashboard();
        else if (currentSection === 'Live Battles') await renderLiveBattles();
        else if (currentSection === 'Match History') await renderMatchHistory();
        else if (currentSection === 'Problems') await renderProblems();
        else if (currentSection === 'Testcases') await renderTestcases();
        else if (currentSection === 'Users') await renderUsers();
        else if (currentSection === 'Leaderboard') await renderLeaderboard();
        else if (currentSection === 'Settings') await renderSettings();
        else if (currentSection === 'Events') await renderEvents();
    } catch (e) {
        showAlert(e.message || 'Failed to load section');
    } finally {
        showLoading(false);
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
        renderSection(true);
    }
}, 5000);

async function renderEvents() {
    const data = await adminRequest('/events');
    sectionRoot.innerHTML = `
        <style>
            .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
            .event-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; transition: all 0.3s ease; position: relative; overflow: hidden; cursor: pointer; }
            .event-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .event-card.create-new { border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; }
            .event-card.create-new:hover { border-color: var(--accent); color: var(--accent); }
            .event-title { font-size: 1.25rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--text-primary); }
            .event-info { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary); }
            .info-item b { display: block; color: var(--text-primary); margin-bottom: 0.2rem; }
        </style>
        
        <div class="events-grid">
            <div class="event-card create-new" id="openWizardBtn">
                <span style="font-size: 2.5rem; margin-bottom: 0.5rem;">➕</span>
                <h3 style="font-weight: 800;">Create New Event</h3>
            </div>
            ${data.map(event => `
                <div class="event-card" onclick="openAdminModal('${event.id}')">
                    <div class="event-title">${event.title}</div>
                    <div style="font-size: 0.85rem; color: var(--accent); font-weight: 700;">${event.biddingTitle}</div>
                    
                    <div class="event-info">
                        <div class="info-item"><b>Entry Fee</b>🪙 ${event.entryFee}</div>
                        <div class="info-item"><b>Max Spots</b>👥 ${event.maxParticipants}</div>
                        <div class="info-item"><b>Bidding Start</b>📅 ${new Date(event.biddingStartTime).toLocaleString()}</div>
                        <div class="info-item"><b>Contest Start</b>🚀 ${new Date(event.contestStartTime).toLocaleString()}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('openWizardBtn').onclick = (e) => {
        e.stopPropagation();
        openCreateWizard();
    };
}

let activeEventId = null;
let activeEventData = null;
let activeTab = 'overview';

async function openAdminModal(eventId) {
    activeEventId = eventId;
    activeTab = 'overview';

    document.getElementById('adminModalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Close on overlay click
    document.getElementById('adminModalOverlay').onclick = (e) => {
        if (e.target.id === 'adminModalOverlay') closeAdminModal();
    };

    // Set up tab listeners
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            renderModalTab();
        };
        if (btn.dataset.tab === 'overview') btn.classList.add('active');
        else btn.classList.remove('active');
    });

    await refreshModalData();
}

function closeAdminModal() {
    document.getElementById('adminModalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    activeEventId = null;
    activeEventData = null;
}

async function refreshModalData() {
    if (!activeEventId) return;
    try {
        activeEventData = await adminRequest(`/events/${activeEventId}/details`);
        document.getElementById('modalEventTitle').textContent = activeEventData.title || 'Event Management';
        renderModalTab();
    } catch (e) {
        showAlert(e.message);
        closeAdminModal();
    }
}

function renderModalTab() {
    const body = document.getElementById('modalBody');
    const data = activeEventData;
    if (!data) return;

    if (activeTab === 'overview') {
        body.innerHTML = `
            <div class="tab-content">
                <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 2rem;">
                    <div class="card"><p>Status</p><h2 style="color:var(--accent)">${data.phase}</h2></div>
                    <div class="card"><p>Bids</p><h2>${data.allBids ? data.allBids.length : 0}</h2></div>
                    <div class="card"><p>Selected</p><h2 style="color:var(--success)">${data.selectedCount || 0}/${data.maxParticipants}</h2></div>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:1rem; font-weight:800;">Event Breakdown</h3>
                    <div class="form-row">
                        <div class="info-item"><b>Event ID</b><code style="color:var(--accent)">${data.id}</code></div>
                        <div class="info-item"><b>Entry Fee</b>🪙 ${data.entryFee}</div>
                    </div>
                    <div class="form-row">
                        <div class="info-item"><b>Bidding Title</b>${data.biddingTitle || '-'}</div>
                        <div class="info-item"><b>Bidding Start</b>${new Date(data.biddingStart).toLocaleString()}</div>
                    </div>
                    <div class="form-row">
                        <div class="info-item"><b>Contest Title</b>${data.contestTitle || '-'}</div>
                        <div class="info-item"><b>Contest Start</b>${new Date(data.contestStart).toLocaleString()}</div>
                    </div>
                    <div class="form-row">
                        <div class="info-item"><b>Duration</b>${data.contestDuration} min</div>
                        <div class="info-item"><b>Processing</b>${data.isBiddingProcessed ? '✅ Bidding Done' : '⏳ Bidding Pending'}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (activeTab === 'bidding') {
        const bids = data.allBids || [];
        body.innerHTML = `
            <div class="tab-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <h3 style="font-weight:800;">User Bids (${bids.length})</h3>
                    <button class="btn btn-primary btn-sm" id="finalizeBiddingBtn">Finalize Winners</button>
                </div>
                ${makeTable(['User', 'Amount', 'Status', 'Selected'], bids.map(b => `
                    <tr>
                        <td><b>${b.username}</b><br><small style="color:var(--text-muted)">${b.displayName || ''}</small></td>
                        <td style="color:var(--accent)">🪙 ${b.amount}</td>
                        <td>${b.refunded ? '<span style="color:#ff4444">Refunded</span>' : (b.selected ? '<span style="color:var(--success)">Selected</span>' : 'Active')}</td>
                        <td><input type="checkbox" class="bid-select" data-user-id="${b.userId}" ${b.selected ? 'checked' : ''}></td>
                    </tr>
                `))}
            </div>
        `;
        document.getElementById('finalizeBiddingBtn').onclick = async () => {
            const selectedIds = Array.from(document.querySelectorAll('.bid-select:checked')).map(cb => Number(cb.dataset.userId));
            if (!confirm(`Finalize with ${selectedIds.length} winners? This will refund all other bidders.`)) return;
            await adminRequest(`/events/${activeEventId}/finalize`, {
                method: 'POST',
                body: JSON.stringify({ winnerIds: selectedIds })
            });
            showAlert('Bidding finalized!');
            await refreshModalData();
        };
    } else if (activeTab === 'problems') {
        const pIds = (data.problemIds || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!window.allProblemsCache) {
            adminRequest('/problems').then(rows => {
                window.allProblemsCache = rows;
                renderModalTab();
            });
            body.innerHTML = '<div class="spinner"></div>';
            return;
        }

        const probMap = {};
        window.allProblemsCache.forEach(p => probMap[p.id] = p);

        body.innerHTML = `
            <div class="tab-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                    <h3 style="font-weight:800;">Event Problems</h3>
                    <button class="btn btn-primary btn-sm" onclick="showProblemPicker()">Add Problem</button>
                </div>
                ${makeTable(['ID', 'Problem Title', 'Difficulty', 'Actions'], pIds.map(id => {
            const p = probMap[id];
            return `
                        <tr>
                            <td><code>#${id}</code></td>
                            <td>${p ? p.title : 'Unknown Problem'}</td>
                            <td>${p ? `<span class="badge badge-${p.difficulty.toLowerCase()}">${p.difficulty}</span>` : '-'}</td>
                            <td><button class="btn btn-secondary btn-sm" style="color:#ff4444" onclick="removeProblemFromEvent('${id}')">Remove</button></td>
                        </tr>
                    `;
        }))}
            </div>
            <div id="problemPicker" class="wizard-overlay" style="display:none; z-index:3000;">
                <div class="wizard-card" style="width:500px; padding:2rem; max-height:80vh; overflow:hidden; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h3 style="font-weight:900;">Select Problems</h3>
                        <button class="close-btn" onclick="document.getElementById('problemPicker').style.display='none'">✕</button>
                    </div>
                    <input type="text" id="pickerSearch" class="input" placeholder="Search problems..." style="width:100%; margin-bottom:1rem;">
                    <div id="pickerList" style="flex:1; overflow-y:auto; border:1px solid var(--border); border-radius:12px;"></div>
                </div>
            </div>
        `;

        if (pIds.length === 0) {
            body.querySelector('.tab-content').innerHTML += `<p style="text-align:center; color:var(--text-muted); padding:2rem;">No problems added to this event yet.</p>`;
        }
    } else if (activeTab === 'participants') {
        const selected = (data.allBids || []).filter(b => b.selected);
        body.innerHTML = `
            <div class="tab-content">
                <h3 style="font-weight:800; margin-bottom:1rem;">Selected Participants (${selected.length})</h3>
                ${makeTable(['Rank', 'User', 'Actions'], selected.map(u => `
                    <tr>
                        <td><b>#${u.rank || '-'}</b></td>
                        <td>${u.username}</td>
                        <td><button class="btn btn-secondary btn-sm" style="color:#ff4444" onclick="removeParticipant('${u.userId}')">Remove</button></td>
                    </tr>
                `))}
            </div>
        `;
    } else if (activeTab === 'results') {
        body.innerHTML = `
            <div class="tab-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                    <h3 style="font-weight:800;">Contest Results</h3>
                    <button class="btn btn-primary" id="distributeBtn" ${data.isContestProcessed ? 'disabled' : ''}>Distribute Rewards</button>
                </div>
                <div class="card" style="margin-bottom:1.5rem;">
                    <label>Prize Amount (per winner)</label>
                    <input type="number" id="prizeAmount" class="input" value="500" style="width:100%; margin-top:0.5rem;">
                </div>
                <p style="color:var(--text-muted); text-align:center; padding: 2rem;">Leaderboard and submission views will be available after contest starts.</p>
            </div>
        `;
        document.getElementById('distributeBtn').onclick = async () => {
            const winners = (data.allBids || []).filter(b => b.selected);
            if (!winners.length) return showAlert('No winners selected!');
            const amount = Number(document.getElementById('prizeAmount').value);
            const rewards = winners.map(w => ({ userId: w.userId, amount: amount }));

            if (!confirm(`Distribute ${amount} coins to each of the ${winners.length} winners?`)) return;
            await adminRequest(`/events/${activeEventId}/distribute`, {
                method: 'POST',
                body: JSON.stringify({ rewards: rewards })
            });
            showAlert('Rewards distributed!');
            await refreshModalData();
        };
    } else if (activeTab === 'settings') {
        body.innerHTML = `
            <div class="tab-content">
                <h3 style="font-weight:800; margin-bottom:1.5rem;">Advanced Configuration</h3>
                <div class="form-group" style="margin-bottom:1.5rem;">
                    <label>Event Name</label>
                    <input type="text" id="edit_title" class="input" value="${data.title}" style="width:100%">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Entry Fee</label>
                        <input type="number" id="edit_fee" class="input" value="${data.entryFee}" style="width:100%">
                    </div>
                    <div class="form-group">
                        <label>Max Participants</label>
                        <input type="number" id="edit_max" class="input" value="${data.maxParticipants}" style="width:100%">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Bidding Start</label>
                        <input type="datetime-local" id="edit_b_start" class="input" value="${data.biddingStart ? data.biddingStart.slice(0, 16) : ''}" style="width:100%">
                    </div>
                    <div class="form-group">
                        <label>Contest Start</label>
                        <input type="datetime-local" id="edit_c_start" class="input" value="${data.contestStart ? data.contestStart.slice(0, 16) : ''}" style="width:100%">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:1.5rem;">
                    <label>Problem IDs (comma-separated)</label>
                    <input type="text" id="edit_probs" class="input" value="${data.problemIds || ''}" style="width:100%">
                </div>
                <button class="btn btn-primary" id="saveEventBtn" style="width:100%; padding: 1rem; font-weight:800;">Save All Changes</button>
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button class="btn btn-secondary btn-sm" style="color:#ff4444" onclick="deleteAndClose()">🗑 Delete Event Permanently</button>
                </div>
            </div>
        `;
        document.getElementById('saveEventBtn').onclick = async () => {
            const body = {
                title: document.getElementById('edit_title').value,
                entryFee: parseInt(document.getElementById('edit_fee').value),
                maxParticipants: parseInt(document.getElementById('edit_max').value),
                biddingStartTime: document.getElementById('edit_b_start').value,
                contestStartTime: document.getElementById('edit_c_start').value,
                problemIds: document.getElementById('edit_probs').value
            };
            await adminRequest(`/events/${activeEventId}`, { method: 'PUT', body: JSON.stringify(body) });
            showAlert('Event updated!');
            await refreshModalData();
        };
    }
}

async function removeProblemFromEvent(pId) {
    const list = activeEventData.problemIds.split(',').map(s => s.trim()).filter(s => s && s !== pId);
    await adminRequest(`/events/${activeEventId}`, {
        method: 'PUT',
        body: JSON.stringify({ problemIds: list.join(',') })
    });
    await refreshModalData();
}

async function showProblemPicker() {
    const picker = document.getElementById('problemPicker');
    if (!picker) return;
    picker.style.display = 'flex';

    const pIds = (activeEventData.problemIds || '').split(',').map(s => s.trim()).filter(Boolean);
    const available = window.allProblemsCache.filter(p => !pIds.includes(String(p.id)));

    const list = document.getElementById('pickerList');
    const search = document.getElementById('pickerSearch');

    const renderPicker = (filter = '') => {
        const filtered = available.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()));
        list.innerHTML = filtered.map(p => `
            <div style="padding:0.8rem; border-bottom:1px solid var(--border); cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="addProblemIdToEvent('${p.id}')">
                <div>
                    <div style="font-weight:700;">${p.title}</div>
                    <small style="color:var(--text-muted)">${p.difficulty} • ${(p.tags || []).join(', ')}</small>
                </div>
                <div style="color:var(--accent); font-weight:900;">ADD +</div>
            </div>
        `).join('');
        if (!filtered.length) list.innerHTML = `<p style="padding:2rem; text-align:center; color:var(--text-muted);">No matching problems</p>`;
    };

    renderPicker();
    search.oninput = (e) => renderPicker(e.target.value);
    search.focus();
}

async function addProblemIdToEvent(pId) {
    const list = (activeEventData.problemIds || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!list.includes(String(pId))) list.push(String(pId));
    await adminRequest(`/events/${activeEventId}`, {
        method: 'PUT',
        body: JSON.stringify({ problemIds: list.join(',') })
    });
    document.getElementById('problemPicker').style.display = 'none';
    await refreshModalData();
}

async function addProblemToEvent() {
    // Replaced prompt with picker
    showProblemPicker();
}

async function removeParticipant(userId) {
    if (!confirm('Remove user from selected participants? This will NOT refund them automatically unless you deselect them in Bidding tab.')) return;
    // For now, we reuse the finalize endpoint with the filtered list
    const selectedIds = (activeEventData.allBids || [])
        .filter(b => b.selected && b.userId != userId)
        .map(b => b.userId);
    await adminRequest(`/events/${activeEventId}/finalize`, {
        method: 'POST',
        body: JSON.stringify({ winnerIds: selectedIds })
    });
    await refreshModalData();
}

async function deleteAndClose() {
    if (!confirm('EXTREMELY IMPORTANT: This will delete the event and all associated bids. Are you absolutely sure?')) return;
    await adminRequest(`/events/${activeEventId}`, { method: 'DELETE' });
    closeAdminModal();
    renderEvents();
}

function openCreateWizard() {
    const overlay = document.createElement('div');
    overlay.className = 'wizard-overlay';

    // Calculate smart defaults
    const now = new Date();
    const bidStart = new Date(now.getTime() + 2 * 60000); // +2 mins
    const contestStart = new Date(bidStart.getTime() + 3 * 60000); // +3 mins (covering 2m bid duration)

    const fmt = (d) => {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    overlay.innerHTML = `
        <div class="wizard-card" style="width: 700px; padding: 2.5rem; background: #0c0c0c; border: 1px solid #333; position: relative; overflow: visible;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h1 style="font-weight: 900; font-size: 2rem; background: linear-gradient(45deg, #fff, #555); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Quick Event Creator ⚡</h1>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Launch a new coding battle in seconds.</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- Left: Info -->
                <div>
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label style="color:var(--accent); font-size:0.75rem; letter-spacing:1px;">EVENT TITLE</label>
                        <input type="text" id="ev_title" class="input" placeholder="e.g. Midnight Clash #12" style="width:100%; font-size: 1.1rem;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label>ENTRY FEE (COINS)</label>
                        <input type="number" id="ev_fee" class="input" value="100" style="width:100%">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label>MAX SELECTED USERS</label>
                        <input type="number" id="ev_max" class="input" value="10" style="width:100%">
                    </div>
                </div>

                <!-- Right: Timing & Logic -->
                <div>
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label style="color:var(--accent); font-size:0.75rem; letter-spacing:1px;">BIDDING START (IST)</label>
                        <input type="datetime-local" id="ev_b_start" class="input" value="${fmt(bidStart)}" style="width:100%">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label>CONTEST START (AUTO: +3M)</label>
                        <input type="datetime-local" id="ev_c_start" class="input" value="${fmt(contestStart)}" style="width:100%">
                    </div>
                    <div class="form-group" style="position:relative;">
                        <label>PROBLEM IDS</label>
                        <div style="display:flex; gap:0.5rem;">
                            <input type="text" id="ev_probs" class="input" placeholder="e.g. 1,2" style="flex:1">
                            <button class="btn btn-secondary btn-sm" id="wizardPickProbs" style="white-space:nowrap;">Pick List</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 2.5rem; display: flex; gap: 1rem;">
                <button class="btn btn-secondary" onclick="this.closest('.wizard-overlay').remove()" style="flex: 1; padding: 1rem;">Cancel</button>
                <button class="btn btn-primary" id="finishQuickCreate" style="flex: 2; padding: 1rem; font-weight: 900; background: linear-gradient(45deg, #ff6b00, #ff9e00); box-shadow: 0 10px 30px rgba(255,107,0,0.3);">🚀 Deploy Event Live</button>
            </div>

            <!-- Floating Effect -->
            <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 100px; height: 100px; background: var(--accent); filter: blur(80px); opacity: 0.2; pointer-events: none;"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Wizard Pick logic
    document.getElementById('wizardPickProbs').onclick = async () => {
        if (!window.allProblemsCache) {
            window.allProblemsCache = await adminRequest('/problems');
        }

        const picker = document.createElement('div');
        picker.className = 'wizard-overlay';
        picker.style.zIndex = '6000';
        picker.innerHTML = `
            <div class="wizard-card" style="width:500px; padding:2rem; max-height:80vh; overflow:hidden; display:flex; flex-direction:column;">
                <h3 style="font-weight:900; margin-bottom:1rem;">Select Problems</h3>
                <input type="text" id="wizardSearch" class="input" placeholder="Search..." style="width:100%; margin-bottom:1rem;">
                <div id="wizardList" style="flex:1; overflow-y:auto; border:1px solid var(--border); border-radius:12px;"></div>
                <button class="btn btn-primary" id="wizardDone" style="margin-top:1rem;">Done</button>
            </div>
        `;
        document.body.appendChild(picker);

        const input = document.getElementById('ev_probs');
        let selected = input.value.split(',').map(s => s.trim()).filter(Boolean);

        const render = (filter = '') => {
            const list = document.getElementById('wizardList');
            list.innerHTML = window.allProblemsCache.filter(p => p.title.toLowerCase().includes(filter.toLowerCase())).map(p => {
                const isSel = selected.includes(String(p.id));
                return `
                    <div style="padding:0.8rem; border-bottom:1px solid var(--border); cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:${isSel ? 'var(--accent-subtle)' : 'transparent'}" onclick="toggleWizardProb('${p.id}')">
                        <div>
                            <div style="font-weight:700;">${p.title}</div>
                            <small style="color:var(--text-muted)">${p.difficulty}</small>
                        </div>
                        <div style="color:var(--accent); font-weight:900;">${isSel ? '✅' : 'ADD +'}</div>
                    </div>
                `;
            }).join('');
        };

        window.toggleWizardProb = (id) => {
            const idx = selected.indexOf(String(id));
            if (idx > -1) selected.splice(idx, 1);
            else selected.push(String(id));
            input.value = selected.join(',');
            render(document.getElementById('wizardSearch').value);
        };

        render();
        document.getElementById('wizardSearch').oninput = (e) => render(e.target.value);
        document.getElementById('wizardDone').onclick = () => picker.remove();
    };

    document.getElementById('finishQuickCreate').onclick = async () => {
        const body = {
            title: document.getElementById('ev_title').value || 'Untitled Clash',
            biddingTitle: 'Selection Phase: ' + (document.getElementById('ev_title').value || 'New Battle'),
            entryFee: parseInt(document.getElementById('ev_fee').value) || 100,
            biddingStartTime: document.getElementById('ev_b_start').value,
            contestTitle: 'Combat Arena: ' + (document.getElementById('ev_title').value || 'New Battle'),
            contestStartTime: document.getElementById('ev_c_start').value,
            contestDuration: 60, // Default 60 mins
            problemIds: document.getElementById('ev_probs').value || "1",
            maxParticipants: parseInt(document.getElementById('ev_max').value) || 10
        };

        const btn = document.getElementById('finishQuickCreate');
        btn.disabled = true;
        btn.innerHTML = '⚡ Deploying...';

        try {
            await adminRequest('/events', { method: 'POST', body: JSON.stringify(body) });
            overlay.remove();
            showAlert('Event Deployed Successfully! 🚀');
            renderEvents();
        } catch (e) {
            showAlert(e.message);
            btn.disabled = false;
            btn.innerHTML = '🚀 Deploy Event Live';
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
