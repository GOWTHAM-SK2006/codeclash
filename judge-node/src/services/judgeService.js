import { executePython, executeCpp, executeC, executeJava, executeJavascript } from "./executor.js";

function normalizeOutput(value) {
  return String(value ?? "").trim();
}

const executors = {
  python: executePython,
  java: executeJava,
  c: executeC,
  cpp: executeCpp,
  javascript: executeJavascript
};

/**
 * Executes user code exactly as written.
 * Stdin is used for input, Stdout for output.
 */
export async function judgeSubmission({ code, language = 'python', testcases = [] }) {
  const executor = executors[language] || executePython;
  const tcResults = [];
  let passedCount = 0;

  for (let i = 0; i < testcases.length; i++) {
    const tc = testcases[i];
    const exec = await executor({
      code,
      stdin: tc.input || "",
      timeoutMs: 3000 // Standard 3s timeout
    });

    let result = "Pass";
    const actual = normalizeOutput(exec.stdout);
    const expected = normalizeOutput(tc.expected);

    if (exec.timedOut) {
      result = "Time Limit Exceeded";
    } else if (exec.exitCode !== 0) {
      result = "Runtime Error";
    } else if (actual !== expected) {
      result = "Fail";
    }

    if (result === "Pass") passedCount++;

    tcResults.push({
      input: tc.input,
      expected: expected,
      actual: actual,
      result: result
    });
  }

  const status = passedCount === testcases.length ? "Accepted"
    : (tcResults.some(r => r.result === "Runtime Error") ? "Error" : "Failed");

  return {
    status,
    testcases: tcResults
  };
}

// Minimal runCode for testing
export async function runCode({ code, language = 'python', stdin = "" }) {
  const executor = executors[language] || executePython;
  const exec = await executor({ code, stdin });
  return {
    ok: !exec.timedOut && exec.exitCode === 0,
    stdout: exec.stdout,
    stderr: exec.stderr,
    timedOut: exec.timedOut
  };
}
