import { executePython } from "./executor.js";
import { wrapUserCode } from "./wrapUserCode.js";
import { standardizeUserCode } from "./standardizeUserCode.js";

function normalizeOutput(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ");
}

export async function runCode({ code }) {
  const exec = await executePython({ code, stdin: "" });
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

async function executeAgainstTestcase({ code, testcase, timeoutMs }) {
  const exec = await executePython({ code, stdin: testcase.input, timeoutMs });

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

export async function runVisibleTestcases({ code, problem, timeoutMs = 2000 }) {
  const visible = getVisibleTestcases(problem);
  const rows = [];

  for (let i = 0; i < visible.length; i++) {
    const tc = visible[i];
    const result = await executeAgainstTestcase({ code, testcase: tc, timeoutMs });
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

export async function judgeSubmission({ code, problem, timeoutMs = 2000 }) {
  const testcases = getAllTestcases(problem);
  let passed = 0;

  for (let i = 0; i < testcases.length; i++) {
    const tc = testcases[i];
    const result = await executeAgainstTestcase({ code, testcase: tc, timeoutMs });

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
    total: testcases.length
  };
}

// LeetCode-style function-only execution (no input/print)
export async function runFunctionStyleTestcases({ userCode, functionName, problem, timeoutMs = 2000 }) {
  // Standardize user code before execution
  const stdCode = standardizeUserCode(userCode, problem, 'python');
  const wrapped = wrapUserCode(stdCode, functionName, problem.testcases);
  // Execute wrapped code
  const exec = await executePython({ code: wrapped, stdin: "", timeoutMs });
  // Parse output for each testcase
  const results = [];
  let passed = 0;
  for (let i = 0; i < problem.testcases.length; i++) {
    const tc = problem.testcases[i];
    const regex = new RegExp(`CASE${i}:(.*)`);
    const match = exec.stdout.match(regex);
    let actual = match ? match[1].trim() : '';
    let status = "Wrong Answer";
    let errorMsg = null;
    if (actual.startsWith('__EXCEPTION__')) {
      status = "Runtime Error";
      errorMsg = actual.replace('__EXCEPTION__', '').trim();
    } else if (normalizeOutput(actual) === normalizeOutput(tc.expected)) {
      status = "Accepted";
      passed++;
    }
    results.push({
      input: tc.input,
      expected: tc.expected,
      actual,
      status,
      error: errorMsg
    });
  }
  return {
    status: passed === problem.testcases.length ? "Accepted" : (passed > 0 ? "Partial" : "Wrong Answer"),
    passed,
    total: problem.testcases.length,
    results
  };
}
