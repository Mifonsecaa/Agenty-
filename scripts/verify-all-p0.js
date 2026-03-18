/*
  Runs all P0 verification checks and prints PASS/WARN/FAIL summary.
*/

const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = process.cwd();

const checks = [
  {
    name: "Migration audio queue",
    command: process.execPath,
    args: [path.join(ROOT, "scripts", "check-audio-queue-migration.js")],
  },
  {
    name: "Redis distributed rate-limit",
    command: process.execPath,
    args: [path.join(ROOT, "scripts", "verify-distributed-rate-limit.js")],
  },
  {
    name: "Ops metrics endpoint",
    command: process.execPath,
    args: [path.join(ROOT, "scripts", "verify-ops-metrics.js")],
  },
];

function printDivider() {
  console.log("------------------------------------------------------------");
}

function runCheck(check) {
  printDivider();
  console.log(`[P0] Running: ${check.name}`);

  const result = spawnSync(check.command, check.args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (typeof result.status === "number" && result.status === 0) {
    console.log(`[P0] Result: PASS - ${check.name}`);
    return { status: "PASS", check: check.name };
  }

  if (result.error) {
    console.log(`[P0] Result: FAIL - ${check.name}`);
    console.log(`[P0] Error: ${result.error.message}`);
    return { status: "FAIL", check: check.name, error: result.error.message };
  }

  console.log(`[P0] Result: FAIL - ${check.name}`);
  return { status: "FAIL", check: check.name, exitCode: result.status };
}

function summarize(results) {
  printDivider();
  console.log("[P0] Summary");

  for (const result of results) {
    console.log(`  ${result.status}: ${result.check}`);
  }

  const hasFail = results.some((result) => result.status === "FAIL");
  printDivider();

  if (hasFail) {
    console.log("[P0] Overall: FAIL");
    process.exitCode = 1;
    return;
  }

  console.log("[P0] Overall: PASS");
}

function run() {
  console.log("[P0] Starting full verification suite...");
  console.log(`[P0] Workspace: ${ROOT}`);

  const results = checks.map(runCheck);
  summarize(results);
}

run();

