// Battle Room logic
let currentBattleId = null;
let timerInterval = null;
let statusPollInterval = null;
let timeLeft = 900;
let battleTestcases = [];
let selectedTestcaseIndex = 0;

(async function () {
    renderNav('battle');
    if (!requireAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    currentBattleId = urlParams.get('battleId');

    if (!currentBattleId) {
        window.location.href = 'battle.html';
        return;
    }

    loadBattleDetails();
})();

async function loadBattleDetails() {
    try {
        const data = await api.getBattle(currentBattleId);
        const battle = data.battle;
        const participants = data.participants || [];

        if (battle.status === 'FINISHED' || battle.status === 'CANCELLED') {
            showResult(battle);
            return;
        }

        document.getElementById('battleProblemTitle').textContent = battle.problem?.title || 'Problem';
        document.getElementById('battleProblemDesc').textContent = battle.problem?.description || '';
        if (battle.problem?.difficulty) {
            const badge = document.getElementById('difficultyBadge');
            badge.textContent = battle.problem.difficulty;
            badge.className = `badge badge-${battle.problem.difficulty.toLowerCase()}`;
        }

        if (battle.problem?.starterCode) {
            document.getElementById('battleEditor').value = battle.problem.starterCode;
        }

        battleTestcases = parseBattleTestcases(battle.problem);
        renderTestcaseTabs();
        renderSelectedTestcase();

        document.getElementById('p1Name').textContent = participants[0]?.user?.displayName || 'Player 1';
        document.getElementById('p2Name').textContent = participants[1]?.user?.displayName || 'Player 2';

        startTimer(battle.startedAt);
        startStatusPolling();
    } catch (e) {
        alert('Error loading battle: ' + e.message);
        window.location.href = 'battle.html';
    }
}

function startStatusPolling() {
    if (statusPollInterval) return;

    statusPollInterval = setInterval(async () => {
        if (!currentBattleId) return;
        try {
            const data = await api.getBattle(currentBattleId);
            const battle = data.battle;
            if (battle.status === 'FINISHED' || battle.status === 'CANCELLED') {
                if (statusPollInterval) {
                    clearInterval(statusPollInterval);
                    statusPollInterval = null;
                }
                showResult(battle);
            }
        } catch (_e) {
            // ignore transient poll errors
        }
    }, 5000);
}

function startTimer(startTimeStr) {
    const startTime = new Date(startTimeStr).getTime();
    const duration = 900 * 1000;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        timeLeft = Math.max(0, Math.floor((duration - elapsed) / 1000));

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').textContent = '00:00';
            // Optionally auto-submit or end battle
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
    const language = getSelectedLanguage();

    try {
        const result = await api.submitBattle(currentBattleId, code, language);
        showResult(result);
        clearInterval(timerInterval);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function runBattleCode() {
    if (!currentBattleId) return;

    const code = document.getElementById('battleEditor').value;
    const language = getSelectedLanguage();
    const selectedCase = battleTestcases[selectedTestcaseIndex] || { input: '', expected: '' };

    if (!code || !code.trim()) {
        alert('Please write code before running.');
        return;
    }

    const runBtn = document.querySelector('button[onclick="runBattleCode()"]');
    const outputCard = document.getElementById('runOutput');
    const outputText = document.getElementById('runOutputText');

    try {
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.textContent = 'Running...';
        }

        const result = await api.runBattle(currentBattleId, code, language, selectedCase.input);

        const lines = [];
        lines.push(`Language: ${result.language || language.toUpperCase()}`);
        lines.push(`Exit Code: ${result.exitCode}`);
        lines.push(`Timed Out: ${result.timedOut ? 'Yes' : 'No'}`);

        if (result.stdout && result.stdout.trim()) {
            lines.push('');
            lines.push('STDOUT:');
            lines.push(result.stdout.trim());
        }

        if (result.stderr && result.stderr.trim()) {
            lines.push('');
            lines.push('STDERR:');
            lines.push(result.stderr.trim());
        }

        outputText.textContent = lines.join('\n');
        outputCard.style.display = 'block';

        renderRunVerdict(result, selectedCase);
    } catch (e) {
        outputText.textContent = `Run failed: ${e.message}`;
        outputCard.style.display = 'block';
        renderRunVerdict({ stdout: '', stderr: e.message, timedOut: false, exitCode: 1 }, selectedCase);
    } finally {
        if (runBtn) {
            runBtn.disabled = false;
            runBtn.textContent = '▶ Run Code';
        }
    }
}

async function cancelMatch() {
    if (!currentBattleId) return;
    const ok = confirm('Are you sure you want to cancel this match? Opponent will get 2x coins.');
    if (!ok) return;

    try {
        const result = await api.cancelBattle(currentBattleId);
        showResult(result);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

function showResult(result) {
    const resultEl = document.getElementById('battleResult');
    resultEl.style.display = 'block';

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (statusPollInterval) {
        clearInterval(statusPollInterval);
        statusPollInterval = null;
    }

    const submitBtn = document.querySelector('button[onclick="submitBattleSolution()"]');
    const runBtn = document.querySelector('button[onclick="runBattleCode()"]');
    const cancelBtn = document.querySelector('button[onclick="cancelMatch()"]');
    const languageSelect = document.getElementById('languageSelect');
    const editor = document.getElementById('battleEditor');
    const testcaseTabButtons = document.querySelectorAll('.testcase-tab-btn');
    if (submitBtn) submitBtn.disabled = true;
    if (runBtn) runBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;
    if (languageSelect) languageSelect.disabled = true;
    if (editor) editor.disabled = true;
    testcaseTabButtons.forEach(btn => btn.disabled = true);

    const user = api.getUser();
    if (result.status === 'CANCELLED' && result.winnerId === user?.userId) {
        resultEl.innerHTML = `
            <div class="card" style="border-color:var(--success);text-align:center;padding:2rem;">
                <span style="font-size:3rem;display:block;margin-bottom:1rem;">🏆</span>
                <h2 style="font-size:1.5rem;font-weight:800;color:var(--success);margin-bottom:0.5rem;">Match Cancelled</h2>
                <p style="color:var(--text-secondary);">Opponent left the match. You received 2x battle coins! 🪙</p>
                <button onclick="window.location.href='battle.html'" class="btn btn-primary mt-6">Back to Lobby</button>
            </div>
        `;
    } else if (result.status === 'CANCELLED') {
        resultEl.innerHTML = `
            <div class="card" style="border-color:var(--danger);text-align:center;padding:2rem;">
                <span style="font-size:3rem;display:block;margin-bottom:1rem;">❌</span>
                <h2 style="font-size:1.5rem;font-weight:800;color:var(--danger);margin-bottom:0.5rem;">Match Cancelled</h2>
                <p style="color:var(--text-secondary);">You left the match. Opponent received 2x battle coins.</p>
                <button onclick="window.location.href='battle.html'" class="btn btn-primary mt-6">Back to Lobby</button>
            </div>
        `;
    } else if (result.winnerId === user?.userId) {
        resultEl.innerHTML = `
            <div class="card" style="border-color:var(--success);text-align:center;padding:2rem;">
                <span style="font-size:3rem;display:block;margin-bottom:1rem;">🎉</span>
                <h2 style="font-size:1.5rem;font-weight:800;color:var(--success);margin-bottom:0.5rem;">You Won!</h2>
                <p style="color:var(--text-secondary);">+50 coins earned! 🪙</p>
                <button onclick="window.location.href='battle.html'" class="btn btn-primary mt-6">Back to Lobby</button>
            </div>
        `;
    } else if (result.winnerId) {
        resultEl.innerHTML = `
            <div class="card" style="border-color:var(--danger);text-align:center;padding:2rem;">
                <span style="font-size:3rem;display:block;margin-bottom:1rem;">😔</span>
                <h2 style="font-size:1.5rem;font-weight:800;color:var(--danger);margin-bottom:0.5rem;">Opponent Won</h2>
                <p style="color:var(--text-secondary);">Better luck next time!</p>
                <button onclick="window.location.href='battle.html'" class="btn btn-primary mt-6">Back to Lobby</button>
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
        // Keep polling for results
        setTimeout(loadBattleDetails, 5000);
    }
}

function getSelectedLanguage() {
    const selected = document.getElementById('languageSelect')?.value || 'python';
    if (selected === 'java') return 'java';
    if (selected === 'javascript') return 'javascript';
    return 'python';
}

function parseBattleTestcases(problem) {
    const testCaseText = problem?.testCases || '';
    if (!testCaseText || !String(testCaseText).trim()) {
        return [{ input: '', expected: problem?.expectedOutput || '' }];
    }

    try {
        const parsed = JSON.parse(testCaseText);
        if (Array.isArray(parsed) && parsed.length) {
            const normalized = parsed
                .map(item => ({
                    input: String(item?.input ?? ''),
                    expected: String(item?.expected ?? '')
                }))
                .filter(item => item.expected.length > 0 || item.input.length > 0);
            if (normalized.length) return normalized;
        }
    } catch (_) {
    }

    const regex = /Input:\s*([\s\S]*?)\s*Expected:\s*([^\n\r]*)(?:\r?\n\r?\n|$)/gi;
    const found = [];
    let match;
    while ((match = regex.exec(testCaseText)) !== null) {
        found.push({
            input: stripQuote((match[1] || '').trim()),
            expected: stripQuote((match[2] || '').trim())
        });
    }
    if (found.length) return found;

    const inputMatch = /Input:\s*([^\n\r]*)/i.exec(testCaseText);
    const expectedMatch = /Expected:\s*([^\n\r]*)/i.exec(testCaseText);
    return [{
        input: stripQuote((inputMatch?.[1] || '').trim()),
        expected: stripQuote((expectedMatch?.[1] || (problem?.expectedOutput || '')).trim())
    }];
}

function stripQuote(value) {
    const text = String(value || '');
    if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
        return text.slice(1, -1);
    }
    return text;
}

function renderTestcaseTabs() {
    const tabs = document.getElementById('testcaseTabs');
    if (!tabs) return;

    if (!battleTestcases.length) {
        tabs.innerHTML = '<span style="color:var(--text-secondary);font-size:0.85rem;">No testcases</span>';
        return;
    }

    tabs.innerHTML = battleTestcases.map((_, idx) => {
        const active = idx === selectedTestcaseIndex;
        return `<button class="btn btn-secondary testcase-tab-btn" style="padding:0.35rem 0.75rem;${active ? 'border-color:var(--accent);color:var(--accent);' : ''}" onclick="selectTestcase(${idx})">Case ${idx + 1}</button>`;
    }).join('');
}

function selectTestcase(index) {
    selectedTestcaseIndex = index;
    renderTestcaseTabs();
    renderSelectedTestcase();
}

function renderSelectedTestcase() {
    const test = battleTestcases[selectedTestcaseIndex] || { input: '', expected: '' };
    const inputEl = document.getElementById('testcaseInput');
    const expectedEl = document.getElementById('testcaseExpected');
    if (inputEl) inputEl.textContent = test.input || '<empty>';
    if (expectedEl) expectedEl.textContent = test.expected || '<empty>';

    const verdict = document.getElementById('testcaseVerdict');
    if (verdict) verdict.style.display = 'none';
}

function renderRunVerdict(result, testCase) {
    const verdict = document.getElementById('testcaseVerdict');
    if (!verdict) return;

    const actual = normalizeText(result?.stdout || '');
    const expected = normalizeText(testCase?.expected || '');

    if (result?.timedOut) {
        verdict.style.display = 'block';
        verdict.innerHTML = `<div class="card" style="border-color:var(--danger);padding:0.75rem;"><strong style="color:var(--danger);">Time Limit Exceeded</strong></div>`;
        return;
    }

    if ((result?.exitCode ?? 1) !== 0) {
        verdict.style.display = 'block';
        verdict.innerHTML = `<div class="card" style="border-color:var(--danger);padding:0.75rem;"><strong style="color:var(--danger);">Runtime Error</strong><pre style="white-space:pre-wrap;margin-top:0.5rem;color:var(--text-secondary);">${escapeHtml(result?.stderr || 'Execution failed')}</pre></div>`;
        return;
    }

    const passed = actual === expected;
    verdict.style.display = 'block';
    verdict.innerHTML = `
        <div class="card" style="border-color:${passed ? 'var(--success)' : 'var(--danger)'};padding:0.75rem;">
            <strong style="color:${passed ? 'var(--success)' : 'var(--danger)'};">Testcase ${selectedTestcaseIndex + 1}: ${passed ? 'Passed' : 'Failed'}</strong>
            ${passed ? '' : `<div style="margin-top:0.5rem;color:var(--text-secondary);">Expected: <code>${escapeHtml(testCase?.expected || '<empty>')}</code><br/>Got: <code>${escapeHtml(result?.stdout || '<empty>')}</code></div>`}
        </div>
    `;
}

function normalizeText(value) {
    return String(value || '').replace(/\r\n/g, '\n').trim();
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
