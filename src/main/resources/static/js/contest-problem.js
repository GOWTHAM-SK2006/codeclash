// Contest Problem Page — mirrors battle-room.js functionality
const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');
const problemId = params.get('id');

if (!eventId || !problemId) {
    window.location.href = eventId ? `/contest.html?eventId=${eventId}` : '/events.html';
}

let currentProblem = null;
let contestData = null;
let contestTimerInterval = null;
let monacoEditor = null;
let monacoReadyPromise = null;
let battleTestcases = [];
let selectedTestcaseIndex = 0;
let testcaseRunResults = [];

const DEFAULT_STARTER_CODE = 'def solve(n):\n    # Your code here\n    pass';

// ── Back button ──
document.getElementById('backBtn').onclick = () => {
    window.location.href = `/contest.html?eventId=${eventId}`;
};

// ── Init ──
(async function () {
    renderNav('events');
    if (!requireAuth()) return;

    bindGlobalShortcuts();

    try {
        await ensureMonacoEditor();

        const [eventData, problem] = await Promise.all([
            api.request(`/events/${eventId}`),
            api.getProblem(problemId)
        ]);

        contestData = eventData;
        currentProblem = problem;

        renderContestInfo(eventData);
        renderProblem(problem);
        loadProblemTabs(eventData);
        startContestTimer(eventData);
    } catch (e) {
        console.error('Init failed:', e);
    }
})();

// ── Contest info ──
function renderContestInfo(data) {
    document.getElementById('contestTitleText').textContent = data.title;
    document.title = `${currentProblem?.title || 'Problem'} — Contest — CodeClash`;
}

// ── Timer ──
function startContestTimer(data) {
    const timerLabel = document.getElementById('timerLabel');
    const timerEl = document.getElementById('contestTimer');

    function updateTimer() {
        const now = new Date().getTime();

        if (data.phase === 'CONTEST_LIVE') {
            timerLabel.textContent = 'Time Left';
            const end = new Date(data.contestStart).getTime() + (data.contestDuration * 60 * 1000);
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            timerEl.textContent = formatContestTime(diff);
            if (diff <= 0) {
                clearInterval(contestTimerInterval);
                timerEl.textContent = '00:00:00';
                timerLabel.textContent = 'Ended';
            }
        } else if (data.phase === 'CONTEST_ENDED') {
            timerLabel.textContent = 'Ended';
            timerEl.textContent = '00:00:00';
            clearInterval(contestTimerInterval);
        } else {
            timerLabel.textContent = 'Contest';
            timerEl.textContent = '--:--:--';
        }
    }

    updateTimer();
    contestTimerInterval = setInterval(updateTimer, 1000);
}

function formatContestTime(seconds) {
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

// ── Render Problem (exactly like battle-room) ──
function renderProblem(problem) {
    document.getElementById('battleProblemTitle').textContent = problem.title || 'Problem';
    document.getElementById('battleProblemDesc').textContent = problem.description || '';

    if (problem.difficulty) {
        const badge = document.getElementById('difficultyBadge');
        badge.textContent = problem.difficulty;
        badge.className = `badge badge-${problem.difficulty.toLowerCase()}`;
    }

    const starterCode = getEditorStarterCode(problem, getSelectedLanguage());
    if (starterCode) {
        setEditorCode(starterCode);
    }

    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.onchange = onLanguageChanged;
    }

    battleTestcases = parseBattleTestcases(problem);
    renderTestcaseTabs();
    renderSelectedTestcase();
}

// ── Monaco Editor (same as battle-room) ──
function ensureMonacoEditor() {
    if (monacoEditor) return Promise.resolve(monacoEditor);
    if (monacoReadyPromise) return monacoReadyPromise;

    monacoReadyPromise = new Promise((resolve) => {
        const container = document.getElementById('battleEditor');
        if (!container) { resolve(null); return; }

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

            monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runContestCode());
            monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => submitContestSolution());
            resolve(monacoEditor);
        };

        if (window.monaco?.editor) { createEditor(); return; }

        if (typeof window.require !== 'function') { resolve(null); return; }

        window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' } });
        window.require(['vs/editor/editor.main'], createEditor, () => resolve(null));
    });

    return monacoReadyPromise;
}

function setEditorLanguage(language) {
    if (!monacoEditor || !monacoEditor.getModel()) return;
    monaco.editor.setModelLanguage(monacoEditor.getModel(), language);
}

function setEditorCode(value) {
    const code = String(value || '');
    if (monacoEditor) {
        monacoEditor.setValue(code);
        setEditorLanguage(getSelectedLanguage());
        return;
    }
    const fallback = document.getElementById('battleEditor');
    if (fallback) fallback.textContent = code;
}

function getEditorCode() {
    if (monacoEditor) return monacoEditor.getValue();
    const fallback = document.getElementById('battleEditor');
    return String(fallback?.textContent || '').trim();
}

function getSelectedLanguage() {
    return document.getElementById('languageSelect')?.value || 'python';
}

function onLanguageChanged() {
    setEditorLanguage(getSelectedLanguage());
    const starterCode = getEditorStarterCode(currentProblem, getSelectedLanguage());
    if (starterCode) setEditorCode(starterCode);
}

function bindGlobalShortcuts() {
    window.addEventListener('keydown', (event) => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        if (!isCtrlOrCmd) return;
        if (event.key === 'Enter') { event.preventDefault(); runContestCode(); return; }
        if (event.key.toLowerCase() === 's') { event.preventDefault(); submitContestSolution(); }
    });
}

// ── Starter Code Generation (same as battle-room) ──
function getEditorStarterCode(problem, language = 'python') {
    const fromWrapper = buildStarterFromWrapper(problem, language);
    if (fromWrapper) return fromWrapper;
    const inferred = inferStarterByTitle(problem?.title, language);
    if (inferred) return inferred;
    const fromRaw = buildStarterFromRaw(problem, language);
    if (fromRaw) return fromRaw;
    return getDefaultStarterCode(language);
}

function normalizeJavaTypeByHint(typeHint, paramName = '') {
    const type = String(typeHint || '').trim().toLowerCase();
    const name = String(paramName || '').trim().toLowerCase();
    if (['int[]', 'integer[]'].includes(type)) return 'int[]';
    if (['double[]', 'float[]'].includes(type)) return 'double[]';
    if (['boolean[]', 'bool[]'].includes(type)) return 'boolean[]';
    if (['string[]', 'str[]'].includes(type)) return 'String[]';
    if (['int', 'integer', 'long', 'short'].includes(type)) return 'int';
    if (['float', 'double', 'decimal'].includes(type)) return 'double';
    if (['bool', 'boolean'].includes(type)) return 'boolean';
    if (['str', 'string', 'char'].includes(type)) return 'String';
    if (['json', 'array', 'list'].includes(type)) {
        if (/(word|text|char|name|token|string|str)/.test(name)) return 'String[]';
        if (/(flag|bool)/.test(name)) return 'boolean[]';
        if (/(price|rate|score|avg|decimal|float|double)/.test(name)) return 'double[]';
        return 'int[]';
    }
    if (/(nums|arr|array|list|values)/.test(name)) return 'int[]';
    if (/(word|text|char|name|token|string|str)/.test(name)) return 'String';
    if (/(flag|bool)/.test(name)) return 'boolean';
    if (/(price|rate|score|avg|decimal|float|double)/.test(name)) return 'double';
    return 'int';
}

function inferJavaReturnType(problem, fallback = 'int') {
    const sample = String(problem?.expectedOutput || '').trim();
    if (!sample) return fallback;
    if (/^(true|false)$/i.test(sample)) return 'boolean';
    if (/^-?\d+$/.test(sample)) return 'int';
    if (/^-?\d*\.\d+$/.test(sample)) return 'double';
    if (sample.startsWith('[') && sample.endsWith(']')) {
        const content = sample.slice(1, -1).trim();
        if (!content) return 'int[]';
        if (/['"]/.test(content)) return 'String[]';
        const tokens = content.split(',').map(t => t.trim()).filter(Boolean);
        if (tokens.length && tokens.every(t => /^(true|false)$/i.test(t))) return 'boolean[]';
        if (tokens.length && tokens.every(t => /^-?\d+$/.test(t))) return 'int[]';
        if (tokens.length && tokens.every(t => /^-?\d*\.\d+$/.test(t) || /^-?\d+$/.test(t))) return 'double[]';
        return 'String[]';
    }
    return 'String';
}

function sanitizeJavaIdentifier(name, fallback = 'arg') {
    const cleaned = String(name || '').trim().replace(/[^A-Za-z0-9_]/g, '');
    if (!cleaned) return fallback;
    if (/^[0-9]/.test(cleaned)) return `${fallback}${cleaned}`;
    return cleaned;
}

function buildStarterFromRaw(problem, language = 'python') {
    const raw = String(problem?.starterCode || '').trim();
    if (!raw) return '';
    if (language === 'python') return raw;
    const match = raw.match(/def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/m);
    if (!match) return '';
    const functionName = match[1];
    const paramsArr = String(match[2] || '').trim()
        ? String(match[2]).split(',').map(p => p.trim()).filter(Boolean).map(p => p.split('=')[0].trim()).map(p => p.includes(':') ? p.split(':')[0].trim() : p).filter(Boolean)
        : [];
    if (language === 'javascript') return `function ${functionName}(${paramsArr.join(', ')}) {\n  // Your code here\n}`;
    if (language === 'java') {
        const javaParams = paramsArr.map((name, i) => { const n = sanitizeJavaIdentifier(name, `arg${i + 1}`); return `${normalizeJavaTypeByHint('', n)} ${n}`; }).join(', ');
        const returnType = inferJavaReturnType(problem, 'int');
        const stub = returnType === 'boolean' ? 'false' : returnType === 'double' ? '0.0' : returnType.endsWith('[]') ? `new ${returnType.replace('[]', '')}[] {}` : returnType === 'String' ? '""' : '0';
        return `class Solution {\n    public ${returnType} ${functionName}(${javaParams}) {\n        // Your code here\n        return ${stub};\n    }\n}`;
    }
    if (language === 'c') { const p = paramsArr.length ? paramsArr.map(n => `int ${n}`).join(', ') : 'void'; return `#include <stdio.h>\n\nint ${functionName}(${p}) {\n    // Your code here\n    return 0;\n}`; }
    if (language === 'cpp') { const p = paramsArr.length ? paramsArr.map(n => `int ${n}`).join(', ') : 'void'; return `#include <bits/stdc++.h>\nusing namespace std;\n\nint ${functionName}(${p}) {\n    // Your code here\n    return 0;\n}`; }
    return '';
}

function getDefaultStarterCode(language = 'python') {
    if (language === 'java') return 'class Solution {\n    public int solve(int n) {\n        // Your code here\n        return 0;\n    }\n}';
    if (language === 'javascript') return 'function solve(input) {\n  // Your code here\n}';
    if (language === 'c') return '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}';
    if (language === 'cpp') return '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}';
    return 'def solve(n):\n    # Your code here\n    pass';
}

function buildStarterFromWrapper(problem, language = 'python') {
    const wrapperConfig = problem?.wrapperConfig;
    if (!wrapperConfig) return '';
    try {
        const cfg = typeof wrapperConfig === 'string' ? JSON.parse(wrapperConfig) : wrapperConfig;
        const functionName = String(cfg?.functionName || '').trim();
        const paramsArr = Array.isArray(cfg?.params) ? cfg.params : [];
        if (!functionName) return '';
        const paramNames = paramsArr.map(p => String(p?.name || '').trim()).filter(Boolean);
        if (language === 'java') {
            const javaParams = paramsArr.map((p, i) => { const n = sanitizeJavaIdentifier(String(p?.name || `arg${i + 1}`), `arg${i + 1}`); const mapped = normalizeJavaTypeByHint(String(p?.type || '').toLowerCase(), n); return `${mapped} ${n}`; }).join(', ');
            const declaredRT = normalizeJavaTypeByHint(String(cfg?.returnType || '').toLowerCase(), 'result');
            const returnType = cfg?.returnType ? declaredRT : inferJavaReturnType(problem, 'int');
            const stub = returnType === 'boolean' ? 'false' : returnType === 'double' ? '0.0' : returnType.endsWith('[]') ? `new ${returnType.replace('[]', '')}[] {}` : returnType === 'String' ? '""' : '0';
            return `class Solution {\n    public ${returnType} ${functionName}(${javaParams}) {\n        // Your code here\n        return ${stub};\n    }\n}`;
        }
        if (language === 'c') { const p = paramsArr.map((pp, i) => { const n = String(pp?.name || `arg${i + 1}`).trim(); const t = String(pp?.type || 'str').toLowerCase(); const m = t === 'int' ? 'int' : t === 'float' ? 'double' : t === 'bool' ? 'int' : 'char*'; return `${m} ${n}`; }).join(', '); return `#include <stdio.h>\n\nint ${functionName}(${p || 'void'}) {\n    // Your code here\n    return 0;\n}`; }
        if (language === 'cpp') { const p = paramsArr.map((pp, i) => { const n = String(pp?.name || `arg${i + 1}`).trim(); const t = String(pp?.type || 'str').toLowerCase(); const m = t === 'int' ? 'int' : t === 'float' ? 'double' : t === 'bool' ? 'bool' : 'string'; return `${m} ${n}`; }).join(', '); return `#include <bits/stdc++.h>\nusing namespace std;\n\nint ${functionName}(${p || 'void'}) {\n    // Your code here\n    return 0;\n}`; }
        if (language === 'javascript') return `function ${functionName}(${paramNames.join(', ')}) {\n  // Your code here\n}`;
        return `def ${functionName}(${paramNames.join(', ')}):\n    # Your code here\n    pass`;
    } catch (_e) { return ''; }
}

function inferStarterByTitle(title, language = 'python') {
    const text = String(title || '').toLowerCase();
    const cFallback = '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}';
    const cppFallback = '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}';
    const mk = (py, js, java) => {
        if (language === 'cpp') return cppFallback;
        if (language === 'c') return cFallback;
        if (language === 'javascript') return js;
        if (language === 'java') return java;
        return py;
    };
    if (text === 'two sum') return mk('def twoSum(nums, target):\n    # Your code here\n    pass', 'function twoSum(nums, target) {\n  // Your code here\n}', 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}');
    if (text === 'reverse string') return mk('def reverseString(s):\n    # Your code here\n    pass', 'function reverseString(s) {\n  // Your code here\n}', 'class Solution {\n    public String reverseString(String s) {\n        // Your code here\n        return "";\n    }\n}');
    if (text === 'fizzbuzz') return mk('def fizzBuzz(n):\n    result = []\n    # Your code here\n    return result', 'function fizzBuzz(n) {\n  const result = [];\n  // Your code here\n  return result;\n}', 'import java.util.*;\n\nclass Solution {\n    public List<String> fizzBuzz(int n) {\n        List<String> result = new ArrayList<>();\n        // Your code here\n        return result;\n    }\n}');
    if (text === 'valid parentheses') return mk('def isValid(s):\n    # Your code here\n    pass', 'function isValid(s) {\n  // Your code here\n}', 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}');
    if (text === 'merge sorted arrays') return mk('def merge(nums1, nums2):\n    # Your code here\n    pass', 'function merge(nums1, nums2) {\n  // Your code here\n}', 'import java.util.*;\n\nclass Solution {\n    public List<Integer> merge(List<Integer> nums1, List<Integer> nums2) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}');
    return '';
}

// ── Testcase Parsing (same as battle-room) ──
function parseBattleTestcases(problem) {
    const testCaseText = problem?.testCases || '';
    if (!testCaseText || !String(testCaseText).trim()) {
        return [{ input: '', expected: problem?.expectedOutput || '' }];
    }
    try {
        const parsed = JSON.parse(testCaseText);
        if (Array.isArray(parsed) && parsed.length) {
            const normalized = parsed.map(item => ({ input: String(item?.input ?? ''), expected: String(item?.expected ?? '') })).filter(item => item.expected.length > 0 || item.input.length > 0);
            if (normalized.length) return normalized;
        }
    } catch (_) { }
    const regex = /Input:\s*([\s\S]*?)\s*Expected:\s*([^\n\r]*)(?:\r?\n\r?\n|$)/gi;
    const found = [];
    let match;
    while ((match = regex.exec(testCaseText)) !== null) {
        found.push({ input: stripQuote((match[1] || '').trim()), expected: stripQuote((match[2] || '').trim()) });
    }
    if (found.length) return found;
    const inputMatch = /Input:\s*([^\n\r]*)/i.exec(testCaseText);
    const expectedMatch = /Expected:\s*([^\n\r]*)/i.exec(testCaseText);
    return [{ input: stripQuote((inputMatch?.[1] || '').trim()), expected: stripQuote((expectedMatch?.[1] || (problem?.expectedOutput || '')).trim()) }];
}

function stripQuote(value) {
    const text = String(value || '');
    if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) return text.slice(1, -1);
    return text;
}

function renderTestcaseTabs() {
    const tabs = document.getElementById('testcaseTabs');
    if (!tabs) return;
    if (!battleTestcases.length) { tabs.innerHTML = '<span style="color:var(--text-secondary);font-size:0.85rem;">No testcases</span>'; return; }
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
    if (!run) { verdict.style.display = 'none'; return; }
    const runOutput = document.getElementById('runOutputText');
    if (runOutput) runOutput.textContent = buildRunOutputText(run, selectedTestcaseIndex + 1);
    renderRunVerdict(run, run);
}

// ── Run Code (uses contest submit API, same UX as battle) ──
async function runContestCode() {
    const code = getEditorCode();
    const language = getSelectedLanguage();
    const testcases = battleTestcases.length ? battleTestcases : [{ input: '', expected: '' }];

    if (!code || !code.trim()) { alert('Please write code before running.'); return; }

    const runBtn = document.querySelector('button[onclick="runContestCode()"]');
    const outputCard = document.getElementById('runOutput');
    const outputText = document.getElementById('runOutputText');

    try {
        if (runBtn) { runBtn.disabled = true; runBtn.textContent = 'Running...'; }

        const startedAt = performance.now();
        testcaseRunResults = [];

        // Use the problem submit API for each testcase
        for (let index = 0; index < testcases.length; index++) {
            const testCase = testcases[index];
            try {
                const result = await api.submitCode(problemId, code, language);
                const actual = normalizeText(result?.output || '');
                const expected = normalizeText(testCase?.expected || '');
                const runStatus = result.status === 'ACCEPTED' ? 'PASSED' : 'FAILED';

                testcaseRunResults.push({
                    index, input: testCase.input, expected: testCase.expected,
                    actual: result?.output || '', stderr: '', exitCode: result.status === 'ACCEPTED' ? 0 : 1,
                    timedOut: false, language: language.toUpperCase(), status: runStatus
                });
            } catch (err) {
                testcaseRunResults.push({
                    index, input: testCase.input, expected: testCase.expected,
                    actual: '', stderr: err.message, exitCode: 1,
                    timedOut: false, language: language.toUpperCase(), status: 'FAILED'
                });
            }
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
    } finally {
        if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run Code'; }
    }
}

// ── Submit Solution ──
async function submitContestSolution() {
    if (!requireAuth()) return;

    const code = getEditorCode();
    const language = getSelectedLanguage();
    const outputCard = document.getElementById('runOutput');
    const outputText = document.getElementById('runOutputText');

    try {
        const result = await api.submitCode(problemId, code, language);
        outputCard.style.display = 'block';
        if (result.status === 'ACCEPTED') {
            document.getElementById('judgeStatusTitle').textContent = '✅ Accepted';
            document.getElementById('judgeStatusTitle').style.color = 'var(--success)';
            outputText.style.color = 'var(--success)';
            outputText.textContent = `${result.output}\n\nCoins earned: +${currentProblem?.points || 0} 🪙`;
        } else {
            document.getElementById('judgeStatusTitle').textContent = `❌ ${result.status}`;
            document.getElementById('judgeStatusTitle').style.color = 'var(--danger)';
            outputText.style.color = 'var(--danger)';
            outputText.textContent = result.output;
        }
    } catch (e) {
        outputCard.style.display = 'block';
        document.getElementById('judgeStatusTitle').textContent = '❌ Error';
        document.getElementById('judgeStatusTitle').style.color = 'var(--danger)';
        outputText.style.color = 'var(--danger)';
        outputText.textContent = e.message;
    }
}

// ── Render helpers (same as battle-room) ──
function renderRunVerdict(result, testCase) {
    const verdict = document.getElementById('testcaseVerdict');
    if (!verdict) return;
    const actual = normalizeText(result?.actual || result?.stdout || '');
    const expected = normalizeText(testCase?.expected || '');
    if (result?.timedOut) { verdict.style.display = 'block'; verdict.innerHTML = `<div class="card" style="border-color:var(--danger);padding:0.75rem;"><strong style="color:var(--danger);">Time Limit Exceeded</strong></div>`; return; }
    if ((result?.exitCode ?? 1) !== 0) { verdict.style.display = 'block'; verdict.innerHTML = `<div class="card" style="border-color:var(--danger);padding:0.75rem;"><strong style="color:var(--danger);">Runtime Error</strong><pre style="white-space:pre-wrap;margin-top:0.5rem;color:var(--text-secondary);">${escapeHtml(result?.stderr || 'Execution failed')}</pre></div>`; return; }
    const passed = actual === expected;
    verdict.style.display = 'block';
    verdict.innerHTML = `<div class="card" style="border-color:${passed ? 'var(--success)' : 'var(--danger)'};padding:0.75rem;"><strong style="color:${passed ? 'var(--success)' : 'var(--danger)'};">Testcase ${selectedTestcaseIndex + 1}: ${passed ? 'Passed' : 'Failed'}</strong>${passed ? '' : `<div style="margin-top:0.5rem;color:var(--text-secondary);">Expected: <code>${escapeHtml(testCase?.expected || '<empty>')}</code><br/>Got: <code>${escapeHtml(result?.actual || result?.stdout || '<empty>')}</code></div>`}</div>`;
}

function renderRunSummary(allPassed, runtimeMs, forceFailed = false) {
    const statusTitle = document.getElementById('judgeStatusTitle');
    const runtime = document.getElementById('judgeRuntime');
    const badges = document.getElementById('judgeCaseBadges');
    if (statusTitle) { statusTitle.textContent = (!forceFailed && allPassed) ? 'Accepted' : 'Failed'; statusTitle.style.color = (!forceFailed && allPassed) ? 'var(--success)' : 'var(--danger)'; }
    if (runtime) runtime.textContent = `Runtime: ${runtimeMs} ms`;
    if (badges) {
        badges.innerHTML = testcaseRunResults.map((c, i) => {
            const passed = c.status === 'PASSED';
            return `<span class="badge" style="background:${passed ? 'rgba(0,200,83,0.12)' : 'rgba(255,61,0,0.12)'};color:${passed ? 'var(--success)' : 'var(--danger)'};">${passed ? '✅' : '❌'} Case ${i + 1}</span>`;
        }).join('');
    }
}

function buildRunOutputText(run, caseNo) {
    const lines = [`Case ${caseNo}`, `Language: ${run.language || 'PYTHON'}`, `Exit Code: ${run.exitCode}`, `Timed Out: ${run.timedOut ? 'Yes' : 'No'}`];
    if (run.actual && String(run.actual).trim()) { lines.push('', 'Output:', String(run.actual).trim()); }
    if (run.stderr && String(run.stderr).trim()) { lines.push('', 'Error:', String(run.stderr).trim()); }
    return lines.join('\n');
}

function normalizeText(value) { return String(value || '').replace(/\r\n/g, '\n').trim(); }

function escapeHtml(value) {
    return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
