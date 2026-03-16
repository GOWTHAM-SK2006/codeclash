import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

const MAX_OUTPUT_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 2000;

function truncateUtf8(str, maxBytes) {
  const buf = Buffer.from(str, "utf8");
  if (buf.length <= maxBytes) return str;
  return buf.subarray(0, maxBytes).toString("utf8");
}

export async function executePython({ code, stdin = "", timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codeclash-"));
  const filePath = path.join(tempDir, "solution.py");

  let timedOut = false;
  try {
    await fs.writeFile(filePath, code ?? "", { mode: 0o600 });

    const child = spawn("python3", [filePath], {
      cwd: tempDir,
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      env: { PATH: process.env.PATH }
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout = truncateUtf8(stdout + chunk.toString("utf8"), MAX_OUTPUT_BYTES);
    });

    child.stderr.on("data", (chunk) => {
      stderr = truncateUtf8(stderr + chunk.toString("utf8"), MAX_OUTPUT_BYTES);
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();

    const result = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, timeoutMs);

      child.on("error", (err) => {
        clearTimeout(timer);
        resolve({ exitCode: 1, stdout, stderr: `Executor error: ${err.message}`, timedOut: false });
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({ exitCode: code ?? 1, stdout, stderr, timedOut });
      });
    });

    return result;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
