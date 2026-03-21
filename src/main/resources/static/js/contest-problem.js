const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');
const problemId = params.get('id');

if (!eventId || !problemId) {
    window.location.href = eventId ? `/contest.html?eventId=${eventId}` : '/events.html';
}

let currentProblem = null;
let contestData = null;
let timerInterval = null;

// ── Back button ──
document.getElementById('backBtn').onclick = () => {
    window.location.href = `/contest.html?eventId=${eventId}`;
};

// ── Load everything ──
async function init() {
    try {
        // Fetch contest data and problem concurrently
        const [eventData, problem] = await Promise.all([
            api.request(`/events/${eventId}`),
            api.getProblem(problemId)
        ]);

        contestData = eventData;
        currentProblem = problem;

        renderContestInfo(eventData);
        renderProblem(problem);
        loadProblemTabs(eventData);
        startTimer(eventData);
    } catch (e) {
        console.error('Init failed:', e);
        document.getElementById('problemPanel').innerHTML =
            '<div style="padding:2rem;text-align:center;color:var(--text-secondary);">Failed to load. Please try again.</div>';
    }
}

// ── Contest info in top bar ──
function renderContestInfo(data) {
    document.getElementById('contestTitleText').textContent = data.title;
    document.title = `${currentProblem.title} — Contest Arena — CodeClash`;
}

// ── Timer ──
function startTimer(data) {
    const timerLabel = document.getElementById('timerLabel');
    const timerEl = document.getElementById('contestTimer');

    function updateTimer() {
        const now = new Date().getTime();

        if (data.phase === 'CONTEST_LIVE') {
            timerLabel.textContent = 'Time Left';
            const end = new Date(data.contestStart).getTime() + (data.contestDuration * 60 * 1000);
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            timerEl.textContent = formatTime(diff);

            if (diff <= 0) {
                clearInterval(timerInterval);
                timerEl.textContent = '00:00:00';
                timerLabel.textContent = 'Contest Ended';
            }
        } else if (data.phase === 'CONTEST_ENDED') {
            timerLabel.textContent = 'Ended';
            timerEl.textContent = '00:00:00';
            clearInterval(timerInterval);
        } else {
            timerLabel.textContent = 'Contest';
            timerEl.textContent = '--:--:--';
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function formatTime(seconds) {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
}

// ── Problem Tabs ──
async function loadProblemTabs(data) {
    const tabsEl = document.getElementById('problemTabs');
    const ids = (data.problemIds || '').split(',').map(s => s.trim()).filter(Boolean);

    if (ids.length <= 1) {
        tabsEl.style.display = 'none';
        return;
    }

    try {
        const problems = await Promise.all(ids.map(id => api.getProblem(id)));

        tabsEl.innerHTML = problems.map((prob, i) => `
            <button class="contest-problem-tab ${prob.id == problemId ? 'active' : ''}"
                    onclick="window.location.href='/contest-problem.html?id=${prob.id}&eventId=${eventId}'">
                P${i + 1}: ${prob.title}
            </button>
        `).join('');
    } catch (e) {
        console.error('Failed to load problem tabs:', e);
    }
}

// ── Render Problem ──
function renderProblem(problem) {
    const panel = document.getElementById('problemPanel');

    // Parse test cases
    let testCaseHtml = '';
    if (problem.testCases) {
        try {
            const cases = JSON.parse(problem.testCases);
            testCaseHtml = cases.map((tc, i) => `
                <div class="tc-section">
                    <h4>Test Case ${i + 1}</h4>
                    <div class="tc-block"><strong>Input:</strong> ${tc.input || ''}</div>
                    <div class="tc-block"><strong>Expected:</strong> ${tc.expected || ''}</div>
                </div>
            `).join('');
        } catch {
            testCaseHtml = `
                <div class="tc-section">
                    <h4>Test Cases</h4>
                    <div class="tc-block">${problem.testCases}</div>
                </div>
            `;
        }
    }

    panel.innerHTML = `
        <div class="problem-header">
            <div>
                <span class="badge badge-${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                <span style="color:var(--accent);font-weight:700;font-size:0.78rem;margin-left:0.5rem;">🪙 ${problem.points} pts</span>
            </div>
        </div>
        <h2>${problem.title}</h2>
        <div class="problem-desc">${problem.description}</div>
        ${testCaseHtml}
    `;

    // Set starter code
    if (problem.starterCode) {
        document.getElementById('codeEditor').value = problem.starterCode;
    }
}

// ── Run Code ──
function runCode() {
    const outputArea = document.getElementById('outputArea');
    const outputContent = document.getElementById('outputContent');
    const outputTitle = document.getElementById('outputTitle');
    outputArea.style.display = 'block';
    outputTitle.style.color = 'var(--text-secondary)';
    outputContent.style.color = 'var(--text-secondary)';
    outputContent.textContent = '⏳ Running your code...';
}

// ── Submit Code ──
async function submitCode() {
    if (!requireAuth()) return;

    const code = document.getElementById('codeEditor').value;
    const lang = document.getElementById('langSelect').value;
    const outputArea = document.getElementById('outputArea');
    const outputContent = document.getElementById('outputContent');
    const outputTitle = document.getElementById('outputTitle');
    outputArea.style.display = 'block';

    try {
        const result = await api.submitCode(problemId, code, lang);
        if (result.status === 'ACCEPTED') {
            outputTitle.textContent = '✅ Accepted';
            outputTitle.style.color = 'var(--success)';
            outputContent.style.color = 'var(--success)';
            outputContent.textContent = `${result.output}\n\nCoins earned: +${currentProblem.points} 🪙`;
        } else {
            outputTitle.textContent = `❌ ${result.status}`;
            outputTitle.style.color = 'var(--danger)';
            outputContent.style.color = 'var(--danger)';
            outputContent.textContent = result.output;
        }
    } catch (e) {
        outputTitle.textContent = '❌ Error';
        outputTitle.style.color = 'var(--danger)';
        outputContent.style.color = 'var(--danger)';
        outputContent.textContent = e.message;
    }
}

// ── Initialize ──
renderNav('events');
init();
