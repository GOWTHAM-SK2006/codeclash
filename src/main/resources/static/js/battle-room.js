// Battle Room logic
let currentBattleId = null;
let timerInterval = null;
let statusPollInterval = null;
let timeLeft = 900;
let battleTestcases = [];
let selectedTestcaseIndex = 0;
let testcaseRunResults = [];
let currentProblem = null;
let monacoEditor = null;
let monacoReadyPromise = null;
let fullscreenRestoreInProgress = false;
let fullscreenPollInterval = null;

const DEFAULT_STARTER_CODE = 'def reverseString(s):\n    # Your code here\n    pass';

let hasTriggeredFullscreen = false;

(async function () {
    renderNav('battle');
    if (!requireAuth()) return;

    initFullscreenGuard();
    triggerFullscreenOnInteraction();

    bindGlobalShortcuts();

    const urlParams = new URLSearchParams(window.location.search);
    currentBattleId = urlParams.get('battleId');

    if (!currentBattleId) {
        window.location.href = 'battle.html';
        return;
    }

    loadBattleDetails();
})();

function triggerFullscreenOnInteraction() {
    const onUserInteract = () => {
        if (hasTriggeredFullscreen) return;
        hasTriggeredFullscreen = true;
        requestBattleFullscreen();
        document.removeEventListener('click', onUserInteract);
        document.removeEventListener('keydown', onUserInteract);
    };

    document.addEventListener('click', onUserInteract, { once: true });
    document.addEventListener('keydown', onUserInteract, { once: true });
}

let fullscreenWarningTimeout = null;

function showFullscreenWarning() {
    const overlay = document.getElementById('fullscreenWarning');
    if (!overlay) return;
    overlay.style.display = 'flex';
    if (fullscreenWarningTimeout) clearTimeout(fullscreenWarningTimeout);
    fullscreenWarningTimeout = setTimeout(() => {
        overlay.style.display = 'none';
        fullscreenWarningTimeout = null;
    }, 1500);
}

function initFullscreenGuard() {
    const onFullscreenExit = () => {
        if (document.fullscreenElement || fullscreenRestoreInProgress) return;
        fullscreenRestoreInProgress = true;
        showFullscreenWarning();
        requestBattleFullscreen();
        setTimeout(() => { fullscreenRestoreInProgress = false; }, 300);
    };

    document.addEventListener('fullscreenchange', onFullscreenExit);
    document.addEventListener('msfullscreenchange', onFullscreenExit);
    document.addEventListener('webkitfullscreenchange', onFullscreenExit);
    document.addEventListener('mozfullscreenchange', onFullscreenExit);

    if (fullscreenPollInterval) clearInterval(fullscreenPollInterval);
    fullscreenPollInterval = setInterval(() => {
        if (!document.fullscreenElement && !fullscreenRestoreInProgress) {
            onFullscreenExit();
        }
    }, 1000);
}

function requestBattleFullscreen() {
    if (document.fullscreenElement) return;

    const root = document.documentElement;
    if (!root?.requestFullscreen) return;

    const attemptFS = () => {
        root.requestFullscreen().catch(() => {
            setTimeout(attemptFS, 75);
        });
    };

    attemptFS();
}

async function loadBattleDetails() {
    try {
        await ensureMonacoEditor();

        const data = await api.getBattle(currentBattleId);
        const battle = data.battle;
        const participants = data.participants || [];

        if (battle.status === 'FINISHED' || battle.status === 'CANCELLED') {
            showResult(battle);
            return;
        }

        document.getElementById('battleProblemTitle').textContent = battle.problem?.title || 'Problem';
        document.getElementById('battleProblemDesc').textContent = battle.problem?.description || '';
        currentProblem = battle.problem || null;
        if (battle.problem?.difficulty) {
            const badge = document.getElementById('difficultyBadge');
            badge.textContent = battle.problem.difficulty;
            badge.className = `badge badge-${battle.problem.difficulty.toLowerCase()}`;
        }

        const starterCode = getEditorStarterCode(currentProblem, getSelectedLanguage());
        if (starterCode) {
            setEditorCode(starterCode);
        }

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.onchange = onLanguageChanged;
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
    const code = getEditorCode();
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

    const code = getEditorCode();
    const language = getSelectedLanguage();
    const testcases = battleTestcases.length ? battleTestcases : [{ input: '', expected: '' }];

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

        const startedAt = performance.now();
        testcaseRunResults = [];

        for (let index = 0; index < testcases.length; index++) {
            const testCase = testcases[index];
            const result = await api.runBattle(currentBattleId, code, language, testCase.input);

            const actual = normalizeText(result?.stdout || '');
            const expected = normalizeText(testCase?.expected || '');
            const runStatus = result.timedOut
                ? 'TLE'
                : ((result.exitCode ?? 1) !== 0)
                    ? 'RUNTIME_ERROR'
                    : actual === expected
                        ? 'PASSED'
                        : 'FAILED';

            testcaseRunResults.push({
                index,
                input: testCase.input,
                expected: testCase.expected,
                actual: result?.stdout || '',
                stderr: result?.stderr || '',
                exitCode: result?.exitCode ?? 1,
                timedOut: !!result?.timedOut,
                language: result?.language || language.toUpperCase(),
                status: runStatus
            });
        }

        const passedCount = testcaseRunResults.filter(c => c.status === 'PASSED').length;
        const allPassed = testcaseRunResults.length > 0 && passedCount === testcaseRunResults.length;
        const runtimeMs = Math.max(0, Math.round(performance.now() - startedAt));

        renderRunSummary(allPassed, runtimeMs);
        renderTestcaseTabs();
        renderSelectedTestcase();

        const selectedRun = testcaseRunResults[selectedTestcaseIndex] || testcaseRunResults[0];
        if (selectedRun) {
            outputText.textContent = buildRunOutputText(selectedRun, selectedTestcaseIndex + 1);
            outputCard.style.display = 'block';
            renderRunVerdict(selectedRun, selectedRun);
        }
    } catch (e) {
        outputText.textContent = `Run failed: ${e.message}`;
        outputCard.style.display = 'block';
        renderRunSummary(false, 0, true);
        renderRunVerdict({ stdout: '', stderr: e.message, timedOut: false, exitCode: 1 }, { expected: '' });
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
    if (fullscreenPollInterval) {
        clearInterval(fullscreenPollInterval);
        fullscreenPollInterval = null;
    }

    const submitBtn = document.querySelector('button[onclick="submitBattleSolution()"]');
    const runBtn = document.querySelector('button[onclick="runBattleCode()"]');
    const cancelBtn = document.querySelector('button[onclick="cancelMatch()"]');
    const languageSelect = document.getElementById('languageSelect');
    const testcaseTabButtons = document.querySelectorAll('.testcase-tab-btn');
    if (submitBtn) submitBtn.disabled = true;
    if (runBtn) runBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;
    if (languageSelect) languageSelect.disabled = true;
    if (monacoEditor) monacoEditor.updateOptions({ readOnly: true });
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

function onLanguageChanged() {
    setEditorLanguage(getSelectedLanguage());
    const starterCode = getEditorStarterCode(currentProblem, getSelectedLanguage());
    if (starterCode) {
        setEditorCode(starterCode);
    }
}

function bindGlobalShortcuts() {
    window.addEventListener('keydown', (event) => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        if (!isCtrlOrCmd) return;

        if (event.key === 'Enter') {
            event.preventDefault();
            runBattleCode();
            return;
        }

        if (event.key.toLowerCase() === 's') {
            event.preventDefault();
            submitBattleSolution();
        }
    });
}

function ensureMonacoEditor() {
    if (monacoEditor) return Promise.resolve(monacoEditor);
    if (monacoReadyPromise) return monacoReadyPromise;

    monacoReadyPromise = new Promise((resolve) => {
        const container = document.getElementById('battleEditor');
        if (!container) {
            resolve(null);
            return;
        }

        const createEditor = () => {
            monaco.editor.defineTheme('codeclash-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'keyword', foreground: 'FF7A18', fontStyle: 'bold' },
                    { token: 'string', foreground: '00FF99' },
                    { token: 'number', foreground: 'FFD54F' },
                    { token: 'comment', foreground: '8A8A8A', fontStyle: 'italic' }
                ],
                colors: {
                    'editor.background': '#0D0D0D',
                    'editorLineNumber.foreground': '#7A7A7A',
                    'editorLineNumber.activeForeground': '#FF7A18',
                    'editor.lineHighlightBackground': '#1A1A1A',
                    'editorCursor.foreground': '#FF7A18',
                    'editor.selectionBackground': '#FF7A1833'
                }
            });

            monacoEditor = monaco.editor.create(container, {
                value: DEFAULT_STARTER_CODE,
                language: 'python',
                theme: 'codeclash-dark',
                fontSize: 16,
                minimap: { enabled: false },
                automaticLayout: true,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                autoIndent: 'full',
                tabSize: 4,
                insertSpaces: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                formatOnType: true,
                formatOnPaste: true,
                scrollBeyondLastLine: false
            });

            monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runBattleCode());
            monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => submitBattleSolution());
            resolve(monacoEditor);
        };

        if (window.monaco?.editor) {
            createEditor();
            return;
        }

        if (typeof window.require !== 'function') {
            resolve(null);
            return;
        }

        window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' } });
        window.require(['vs/editor/editor.main'], createEditor, () => resolve(null));
    });

    return monacoReadyPromise;
}

function setEditorLanguage(language) {
    if (!monacoEditor || !monacoEditor.getModel()) return;
    const normalized = language === 'java' ? 'java' : (language === 'javascript' ? 'javascript' : 'python');
    monaco.editor.setModelLanguage(monacoEditor.getModel(), normalized);
}

function setEditorCode(value) {
    const code = String(value || '');
    if (monacoEditor) {
        monacoEditor.setValue(code);
        setEditorLanguage(getSelectedLanguage());
        return;
    }

    const fallback = document.getElementById('battleEditor');
    if (fallback) {
        fallback.textContent = code;
    }
}

function getEditorCode() {
    if (monacoEditor) return monacoEditor.getValue();

    const fallback = document.getElementById('battleEditor');
    return String(fallback?.textContent || '').trim();
}

function getEditorStarterCode(problem, language = 'python') {
    const raw = String(problem?.starterCode || '').trim();

    const fromWrapper = buildStarterFromWrapper(problem?.wrapperConfig, language);
    if (fromWrapper) return fromWrapper;

    const inferred = inferStarterByTitle(problem?.title, language);
    if (inferred) return inferred;

    return raw || '# Write your code here';
}

function buildStarterFromWrapper(wrapperConfig, language = 'python') {
    if (!wrapperConfig) return '';

    try {
        const cfg = typeof wrapperConfig === 'string' ? JSON.parse(wrapperConfig) : wrapperConfig;
        const functionName = String(cfg?.functionName || '').trim();
        const params = Array.isArray(cfg?.params) ? cfg.params : [];
        if (!functionName) return '';

        const paramNames = params
            .map(p => String(p?.name || '').trim())
            .filter(Boolean)
            ;

        if (language === 'java') {
            const javaParams = params
                .map((p, index) => {
                    const name = String(p?.name || `arg${index + 1}`).trim();
                    const type = String(p?.type || 'str').toLowerCase();
                    const mapped = (type === 'int') ? 'int'
                        : (type === 'float') ? 'double'
                            : (type === 'bool') ? 'boolean'
                                : (type === 'str') ? 'String'
                                    : 'Object';
                    return `${mapped} ${name}`;
                })
                .join(', ');

            return `class Solution {\n    public Object ${functionName}(${javaParams}) {\n        // Your code here\n        return null;\n    }\n}`;
        }

        if (language === 'javascript') {
            const jsParams = paramNames.join(', ');
            return `function ${functionName}(${jsParams}) {\n  // Your code here\n}`;
        }

        const pyParams = paramNames.join(', ');
        return `def ${functionName}(${pyParams}):\n    # Your code here\n    pass`;
    } catch (_e) {
        return '';
    }
}

function inferStarterByTitle(title, language = 'python') {
    const text = String(title || '').toLowerCase();

    const mk = (py, js, java) => {
        if (language === 'javascript') return js;
        if (language === 'java') return java;
        return py;
    };

    if (text === 'two sum') {
        return mk(
            'def twoSum(nums, target):\n    # Your code here\n    pass',
            'function twoSum(nums, target) {\n  // Your code here\n}',
            'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}'
        );
    }
    if (text === 'reverse string') {
        return mk(
            'def reverseString(s):\n    # Your code here\n    pass',
            'function reverseString(s) {\n  // Your code here\n}',
            'class Solution {\n    public String reverseString(String s) {\n        // Your code here\n        return \"\";\n    }\n}'
        );
    }
    if (text === 'fizzbuzz') {
        return mk(
            'def fizzBuzz(n):\n    result = []\n    # Your code here\n    return result',
            'function fizzBuzz(n) {\n  const result = [];\n  // Your code here\n  return result;\n}',
            'import java.util.*;\n\nclass Solution {\n    public List<String> fizzBuzz(int n) {\n        List<String> result = new ArrayList<>();\n        // Your code here\n        return result;\n    }\n}'
        );
    }
    if (text === 'valid parentheses') {
        return mk(
            'def isValid(s):\n    # Your code here\n    pass',
            'function isValid(s) {\n  // Your code here\n}',
            'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}'
        );
    }
    if (text === 'merge sorted arrays') {
        return mk(
            'def merge(nums1, nums2):\n    # Your code here\n    pass',
            'function merge(nums1, nums2) {\n  // Your code here\n}',
            'import java.util.*;\n\nclass Solution {\n    public List<Integer> merge(List<Integer> nums1, List<Integer> nums2) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}'
        );
    }

    return '';
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
        const status = testcaseRunResults[idx]?.status;
        const statusColor = status === 'PASSED' ? 'var(--success)' : (status ? 'var(--danger)' : 'var(--text-secondary)');
        const marker = status === 'PASSED' ? '✅ ' : status ? '❌ ' : '';
        return `<button class="btn btn-secondary testcase-tab-btn" style="padding:0.32rem 0.7rem;border-color:${active ? 'var(--accent)' : 'var(--border)'};color:${active ? 'var(--accent)' : statusColor};" onclick="selectTestcase(${idx})">${marker}Case ${idx + 1}</button>`;
    }).join('');
}

function selectTestcase(index) {
    selectedTestcaseIndex = index;
    renderTestcaseTabs();
    renderSelectedTestcase();
}

function renderSelectedTestcase() {
    const test = battleTestcases[selectedTestcaseIndex] || { input: '', expected: '' };
    const run = testcaseRunResults[selectedTestcaseIndex];
    const inputEl = document.getElementById('testcaseInput');
    const expectedEl = document.getElementById('testcaseExpected');
    if (inputEl) inputEl.textContent = test.input || '<empty>';
    if (expectedEl) expectedEl.textContent = test.expected || '<empty>';

    const verdict = document.getElementById('testcaseVerdict');
    if (!verdict) return;

    if (!run) {
        verdict.style.display = 'none';
        return;
    }

    const runOutput = document.getElementById('runOutputText');
    if (runOutput) {
        runOutput.textContent = buildRunOutputText(run, selectedTestcaseIndex + 1);
    }

    renderRunVerdict(run, run);
}

function renderRunVerdict(result, testCase) {
    const verdict = document.getElementById('testcaseVerdict');
    if (!verdict) return;

    const actual = normalizeText(result?.actual || result?.stdout || '');
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
            ${passed ? '' : `<div style="margin-top:0.5rem;color:var(--text-secondary);">Expected: <code>${escapeHtml(testCase?.expected || '<empty>')}</code><br/>Got: <code>${escapeHtml(result?.actual || result?.stdout || '<empty>')}</code></div>`}
        </div>
    `;
}

function renderRunSummary(allPassed, runtimeMs, forceFailed = false) {
    const statusTitle = document.getElementById('judgeStatusTitle');
    const runtime = document.getElementById('judgeRuntime');
    const badges = document.getElementById('judgeCaseBadges');

    if (statusTitle) {
        statusTitle.textContent = (!forceFailed && allPassed) ? 'Accepted' : 'Failed';
        statusTitle.style.color = (!forceFailed && allPassed) ? 'var(--success)' : 'var(--danger)';
    }
    if (runtime) {
        runtime.textContent = `Runtime: ${runtimeMs} ms`;
    }
    if (badges) {
        badges.innerHTML = testcaseRunResults.map((c, i) => {
            const passed = c.status === 'PASSED';
            return `<span class="badge" style="background:${passed ? 'rgba(0,200,83,0.12)' : 'rgba(255,61,0,0.12)'};color:${passed ? 'var(--success)' : 'var(--danger)'};">${passed ? '✅' : '❌'} Case ${i + 1}</span>`;
        }).join('');
    }
}

function buildRunOutputText(run, caseNo) {
    const lines = [];
    lines.push(`Case ${caseNo}`);
    lines.push(`Language: ${run.language || 'PYTHON'}`);
    lines.push(`Exit Code: ${run.exitCode}`);
    lines.push(`Timed Out: ${run.timedOut ? 'Yes' : 'No'}`);

    if (run.actual && String(run.actual).trim()) {
        lines.push('');
        lines.push('Output:');
        lines.push(String(run.actual).trim());
    }

    if (run.stderr && String(run.stderr).trim()) {
        lines.push('');
        lines.push('Error:');
        lines.push(String(run.stderr).trim());
    }

    return lines.join('\n');
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
