/*
  Continuous cleanup worker for old terminal knowledge ingestion jobs.
  Calls /api/knowledge/jobs/cleanup in once or loop mode.
*/

const BASE_URL = process.env.KNOWLEDGE_WORKER_BASE_URL || "http://localhost:3001";
const TOKEN = process.env.KNOWLEDGE_WORKER_TOKEN || "";
const RETENTION_DAYS = Number(process.env.KNOWLEDGE_CLEANUP_RETENTION_DAYS || 14);
const INTERVAL_MS = Number(process.env.KNOWLEDGE_CLEANUP_INTERVAL_MS || 86400000);
const BUSINESS_ID = process.env.KNOWLEDGE_CLEANUP_BUSINESS_ID || "";
const ONCE = process.argv.includes("--once");

let running = true;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCleanup() {
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) {
    headers["x-worker-token"] = TOKEN;
  }

  const body = {
    retentionDays: Number.isFinite(RETENTION_DAYS) ? RETENTION_DAYS : 14,
  };

  if (BUSINESS_ID.trim()) {
    body.businessId = BUSINESS_ID.trim();
  }

  const res = await fetch(`${BASE_URL}/api/knowledge/jobs/cleanup`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const message = payload && payload.error ? payload.error : `HTTP ${res.status}`;
    throw new Error(`Cleanup API error: ${message}`);
  }

  const deletedCount = Number(payload.deletedCount || 0);
  console.log(`[KnowledgeCleanup] Deleted ${deletedCount} old job(s)`);
  return deletedCount;
}

async function runLoop() {
  console.log("[KnowledgeCleanup] Starting");
  console.log(`[KnowledgeCleanup] BASE_URL=${BASE_URL}`);
  console.log(`[KnowledgeCleanup] RETENTION_DAYS=${RETENTION_DAYS}`);
  console.log(`[KnowledgeCleanup] INTERVAL_MS=${INTERVAL_MS}`);
  console.log(`[KnowledgeCleanup] MODE=${ONCE ? "once" : "loop"}`);

  while (running) {
    try {
      await runCleanup();

      if (ONCE) {
        break;
      }

      await sleep(Math.max(5000, INTERVAL_MS));
    } catch (error) {
      console.error("[KnowledgeCleanup] Error:", error && error.message ? error.message : error);
      if (ONCE) {
        process.exitCode = 1;
        break;
      }
      await sleep(30000);
    }
  }

  console.log("[KnowledgeCleanup] Stopped");
}

process.on("SIGINT", () => {
  console.log("[KnowledgeCleanup] SIGINT received");
  running = false;
});

process.on("SIGTERM", () => {
  console.log("[KnowledgeCleanup] SIGTERM received");
  running = false;
});

runLoop().catch((error) => {
  console.error("[KnowledgeCleanup] Fatal:", error);
  process.exit(1);
});

