import { executePython } from "./executor.js";

function normalize(s) {
  return String(s ?? "").replace(/\r\n/g, "\n").trim();
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

export async function judgeSubmission({ code, problem, timeoutMs = 2000 }) {
  const rows = [];
  let passed = 0;
  let failed = 0;
  let runtimeError = null;
  const startedAt = Date.now();

  for (let i = 0; i < problem.testcases.length; i++) {
    const tc = problem.testcases[i];
    const exec = await executePython({ code, stdin: tc.input, timeoutMs });

    if (exec.timedOut) {
      rows.push({
        index: i + 1,
        status: "TLE",
        expected: tc.expected,
        got: "",
        stderr: "Time Limit Exceeded"
      });
      failed++;
      continue;
    }

    if (exec.exitCode !== 0) {
      rows.push({
        index: i + 1,
        status: "RUNTIME_ERROR",
        expected: tc.expected,
        got: normalize(exec.stdout),
        stderr: exec.stderr
      });
      failed++;
      runtimeError = exec.stderr || "Runtime Error";
      break;
    }

    const got = normalize(exec.stdout);
    const expected = normalize(tc.expected);
    if (got === expected) {
      rows.push({ index: i + 1, status: "PASSED", expected, got, stderr: "" });
      passed++;
    } else {
      rows.push({ index: i + 1, status: "FAILED", expected, got, stderr: "" });
      failed++;
    }
  }

  const allPassed = failed === 0 && passed === problem.testcases.length;
  const finishedAt = Date.now();

  const summaryLines = rows.map((r) => {
    if (r.status === "PASSED") return `Testcase ${r.index}: Passed`;
    if (r.status === "FAILED") {
      return `Testcase ${r.index}: Failed\nExpected: ${r.expected}\nGot: ${r.got || "<empty>"}`;
    }
    if (r.status === "TLE") return `Testcase ${r.index}: Time Limit Exceeded`;
    return `Testcase ${r.index}: Runtime Error\n${r.stderr || ""}`;
  });

  return {
    status: allPassed ? "ACCEPTED" : runtimeError ? "RUNTIME_ERROR" : "WRONG_ANSWER",
    passed,
    failed,
    total: problem.testcases.length,
    testcaseResults: rows,
    message: summaryLines.join("\n\n"),
    durationMs: finishedAt - startedAt,
    completedAt: finishedAt
  };
}
