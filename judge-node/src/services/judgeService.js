import { executePython, executeCpp, executeC, executeJava, executeJavascript } from "./executor.js";
import { wrapUserCode } from "./wrapUserCode.js";
import { standardizeUserCode } from "./standardizeUserCode.js";

function normalizeOutput(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ");
}

const executors = {
  python: executePython,
  java: executeJava,
  c: executeC,
  cpp: executeCpp,
  javascript: executeJavascript
};

// If executor doesn't handle JS, we can add it here or update executor.js. 
// Let's assume executor.js needs a quick update for JS.

export async function runCode({ code, language = 'python', stdin = "" }) {
  const executor = executors[language] || executePython;
  const exec = await executor({ code, stdin });
  return {
    ok: !exec.timedOut && exec.exitCode === 0,
    stdout: exec.stdout,
    stderr: exec.stderr,
    timedOut: exec.timedOut,
    exitCode: exec.exitCode
  };
}

function getVisibleTestcases(problem) {
  const testcases = Array.isArray(problem?.testcases) ? problem.testcases : [];
  return testcases.filter((tc) => tc?.visible === true);
}

function getAllTestcases(problem) {
  return Array.isArray(problem?.testcases) ? problem.testcases : [];
}

async function executeAgainstTestcase({ code, language, testcase, timeoutMs }) {
  const executor = executors[language] || executePython;
  const exec = await executor({ code, stdin: testcase.input, timeoutMs });

  if (exec.timedOut) {
    return {
      status: "TLE",
      output: normalizeOutput(exec.stdout),
      expected: normalizeOutput(testcase.expected),
      error: "Time Limit Exceeded"
    };
  }

  if (exec.exitCode !== 0) {
    return {
      status: "RUNTIME_ERROR",
      output: normalizeOutput(exec.stdout),
      expected: normalizeOutput(testcase.expected),
      error: String(exec.stderr || "Runtime Error").trim()
    };
  }

  const output = normalizeOutput(exec.stdout);
  const expected = normalizeOutput(testcase.expected);
  if (output !== expected) {
    return {
      status: "WRONG_ANSWER",
      output,
      expected,
      error: ""
    };
  }

  return {
    status: "PASSED",
    output,
    expected,
    error: ""
  };
}

export async function runVisibleTestcases({ code, problem, language = 'python', timeoutMs = 2000 }) {
  const visible = getVisibleTestcases(problem);
  const rows = [];

  for (let i = 0; i < visible.length; i++) {
    const tc = visible[i];
    const result = await executeAgainstTestcase({ code, language, testcase: tc, timeoutMs });
    rows.push({
      index: i + 1,
      input: String(tc.input ?? ""),
      expected: normalizeOutput(tc.expected),
      output: result.output,
      verdict: result.status,
      error: result.error || undefined
    });
  }

  return {
    verdict: rows.every((r) => r.verdict === "PASSED") ? "Accepted" : "Completed",
    total: visible.length,
    results: rows
  };
}

export async function judgeSubmission({ code, problem, language = 'python', timeoutMs = 2000 }) {
  const testcases = getAllTestcases(problem);
  let passed = 0;

  for (let i = 0; i < testcases.length; i++) {
    const tc = testcases[i];
    const result = await executeAgainstTestcase({ code, language, testcase: tc, timeoutMs });

    if (result.status === "PASSED") {
      passed += 1;
      continue;
    }

    if (result.status === "RUNTIME_ERROR") {
      return {
        verdict: "Runtime Error",
        error: result.error || "Runtime Error",
        passed,
        total: testcases.length
      };
    }

    if (result.status === "TLE") {
      return {
        verdict: "Time Limit Exceeded",
        passed,
        total: testcases.length
      };
    }

    return {
      verdict: "Wrong Answer",
      failedTestcase: {
        input: String(tc.input ?? ""),
        expected: normalizeOutput(tc.expected),
        output: result.output
      },
      passed,
      total: testcases.length
    };
  }

  return {
    verdict: "Accepted ✅",
    passed,
    total: testcases.length,
    results: allResults
  };
}

// Keeping this for backward compatibility or future hybrid mode
export async function runFunctionStyleTestcases({ userCode, problem, language = 'python', timeoutMs = 2000 }) {
  const { code: stdCode, paramTypes, functionName } = standardizeUserCode(userCode, problem, language);
  const config = JSON.parse(problem.wrapperConfig || '{}');
  const returnType = config.returnType || 'int';
  const wrapped = wrapUserCode(stdCode, functionName, problem.testcases, language, paramTypes, returnType);

  const executor = executors[language] || executePython;
  const exec = await executor({ code: wrapped, stdin: "", timeoutMs });

  if (exec.isCompileError) {
    return { status: "Error", error: exec.stderr, output: "", expected: "", testcase: 0 };
  }

  const results = [];
  let firstFailure = null;

  for (let i = 0; i < problem.testcases.length; i++) {
    const tc = problem.testcases[i];
    const regex = new RegExp(`CASE${i}:\\s*(.*)`);
    const match = exec.stdout.match(regex);
    let actual = match ? match[1].trim() : '';
    let status = "Wrong Answer";
    let errorMsg = null;

    if (actual.startsWith('__EXCEPTION__')) {
      status = "Error";
      errorMsg = actual.replace('__EXCEPTION__', '').trim();
    } else if (normalizeOutput(actual) === normalizeOutput(tc.expected)) {
      status = "Accepted";
    }

    const res = { index: i + 1, input: tc.input, expected: tc.expected, actual, status, error: errorMsg };
    results.push(res);
    if (status !== "Accepted" && !firstFailure) firstFailure = res;
  }

  if (!firstFailure) {
    return { status: "Accepted", output: results[0]?.actual || "", expected: results[0]?.expected || "", error: "", testcase: problem.testcases.length };
  }
  return { status: firstFailure.status === "Error" ? "Error" : "Wrong Answer", output: firstFailure.actual, expected: firstFailure.expected, error: firstFailure.error || "", testcase: firstFailure.index };
}
