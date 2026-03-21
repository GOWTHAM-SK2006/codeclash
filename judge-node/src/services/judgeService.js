import { executePython, executeCpp, executeC, executeJava } from "./executor.js";
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
  cpp: executeCpp
};

export async function runCode({ code, language = 'python' }) {
  const executor = executors[language] || executePython;
  const exec = await executor({ code, stdin: "" });
  return {
    ok: !exec.timedOut && exec.exitCode === 0,
    stdout: exec.stdout,
    stderr: exec.stderr,
    timedOut: exec.timedOut,
    exitCode: exec.exitCode
  };
}

// ... existing getVisibleTestcases, getAllTestcases, executeAgainstTestcase, runVisibleTestcases, judgeSubmission ...

// LeetCode-style function-only execution (no input/print)
export async function runFunctionStyleTestcases({ userCode, problem, language = 'python', timeoutMs = 2000 }) {
  // 1. Standardize and Correct Signature
  const { code: stdCode, paramTypes, functionName } = standardizeUserCode(userCode, problem, language);

  // 2. Wrap with Test Runner
  const config = JSON.parse(problem.wrapperConfig || '{}');
  const returnType = config.returnType || 'int';
  const wrapped = wrapUserCode(stdCode, functionName, problem.testcases, language, paramTypes, returnType);

  // 3. Execute with appropriate executor
  const executor = executors[language] || executePython;
  const exec = await executor({ code: wrapped, stdin: "", timeoutMs });

  // 4. Handle Compilation Errors
  if (exec.isCompileError) {
    return {
      status: "Error",
      error: exec.stderr,
      output: "",
      expected: "",
      testcase: 0
    };
  }

  // 5. Parse output for each testcase
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

    const res = {
      index: i + 1,
      input: tc.input,
      expected: tc.expected,
      actual,
      status,
      error: errorMsg
    };
    results.push(res);

    if (status !== "Accepted" && !firstFailure) {
      firstFailure = res;
    }
  }

  // 6. Return standardized UI Response Format
  if (!firstFailure) {
    return {
      status: "Accepted",
      output: results[0]?.actual || "",
      expected: results[0]?.expected || "",
      error: "",
      testcase: problem.testcases.length
    };
  }

  return {
    status: firstFailure.status === "Error" ? "Error" : "Wrong Answer",
    output: firstFailure.actual,
    expected: firstFailure.expected,
    error: firstFailure.error || "",
    testcase: firstFailure.index
  };
}
