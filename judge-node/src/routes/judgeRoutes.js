import express from "express";
import { getProblemById } from "../data/problems.js";
import { runCode, judgeSubmission } from "../services/judgeService.js";
import { getBattle, upsertSubmission } from "../services/battleService.js";

const router = express.Router();

router.post("/run-code", async (req, res) => {
  try {
    const { code, language = "python", problemId } = req.body || {};
    if (language !== "python") {
      return res.status(400).json({ error: "Only python supported currently" });
    }
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    if (problemId && !getProblemById(problemId)) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const result = await runCode({ code });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Run failed", details: err.message });
  }
});

// POST /submit-code
// Supports two modes:
//   1. Standalone judge: { code, problemId }
//      — no battle context required; returns LeetCode-style results array
//   2. Battle judge:     { code, problemId, battleId, playerId }
//      — updates battle state and returns winner info as well
//
// Input values in testcases MUST be line-by-line raw values (not "nums=...").
// e.g. "[2,7,11,15]\n9"  — first line consumed by first input(), second by next.
router.post("/submit-code", async (req, res) => {
  try {
    const { battleId, playerId, problemId, code, language = "python" } = req.body || {};

    if (language !== "python") {
      return res.status(400).json({ error: "Only python supported currently" });
    }
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }
    if (!problemId) {
      return res.status(400).json({ error: "problemId is required" });
    }

    const problem = getProblemById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const judge = await judgeSubmission({ code, problem, timeoutMs: 2000 });

    // Build the LeetCode-style results array --------------------------------
    const results = judge.testcaseResults.map((r) => {
      if (r.status === "PASSED") {
        return { test: r.index, status: "Passed" };
      }
      if (r.status === "TLE") {
        return { test: r.index, status: "Time Limit Exceeded" };
      }
      if (r.status === "RUNTIME_ERROR") {
        return {
          test: r.index,
          status: "Runtime Error",
          error: r.stderr || "Runtime Error"
        };
      }
      // FAILED
      return {
        test: r.index,
        status: "Failed",
        expected: r.expected,
        got: r.got || ""
      };
    });

    // Battle mode: update battle state if both battleId and playerId provided
    let winner = null;
    if (battleId && playerId) {
      const battle = getBattle(battleId);
      if (!battle) return res.status(404).json({ error: "Battle not found" });
      const updatedBattle = upsertSubmission({ battleId, playerId, result: judge });
      winner = updatedBattle?.winner ?? null;
    }

    return res.json({
      status: judge.status,          // "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR"
      passed: judge.passed,
      failed: judge.failed,
      total: judge.total,
      results,                        // LeetCode-style per-testcase array
      message: judge.message,
      ...(winner !== null && { winner })
    });
  } catch (err) {
    return res.status(500).json({ error: "Submit failed", details: err.message });
  }
});

export default router;
