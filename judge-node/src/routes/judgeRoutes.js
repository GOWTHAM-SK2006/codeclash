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

router.post("/submit-code", async (req, res) => {
  try {
    const { battleId, playerId, problemId, code, language = "python" } = req.body || {};
    if (!battleId || !playerId || !problemId) {
      return res.status(400).json({ error: "battleId, playerId, problemId are required" });
    }
    if (language !== "python") {
      return res.status(400).json({ error: "Only python supported currently" });
    }
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    const problem = getProblemById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const battle = getBattle(battleId);
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    const judge = await judgeSubmission({ code, problem, timeoutMs: 2000 });
    const updatedBattle = upsertSubmission({ battleId, playerId, result: judge });

    return res.json({
      status: judge.status,
      passed: judge.passed,
      failed: judge.failed,
      total: judge.total,
      testcaseResults: judge.testcaseResults,
      message: judge.message,
      winner: updatedBattle?.winner ?? null
    });
  } catch (err) {
    return res.status(500).json({ error: "Submit failed", details: err.message });
  }
});

export default router;
