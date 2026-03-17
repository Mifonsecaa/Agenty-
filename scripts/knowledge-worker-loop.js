/*
  Continuous worker for async knowledge ingestion jobs.
  It polls /api/knowledge/jobs/process and processes jobs in batches.
*/

const BASE_URL = process.env.KNOWLEDGE_WORKER_BASE_URL || "http://localhost:3001";
const BATCH_SIZE = Number(process.env.KNOWLEDGE_WORKER_BATCH_SIZE || 5);
const POLL_MS = Number(process.env.KNOWLEDGE_WORKER_POLL_MS || 2500);
const IDLE_MS = Number(process.env.KNOWLEDGE_WORKER_IDLE_MS || 5000);
const TOKEN = process.env.KNOWLEDGE_WORKER_TOKEN || "";
const ONCE = process.argv.includes("--once");

let running = true;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch() {
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) {
    headers["x-worker-token"] = TOKEN;
  }

  const res = await fetch(`${BASE_URL}/api/knowledge/jobs/process`, {
    method: "POST",
    headers,
    body: JSON.stringify({ limit: BATCH_SIZE }),
  });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const message = payload && payload.error ? payload.error : `HTTP ${res.status}`;
    throw new Error(`Worker API error: ${message}`);
  }

  const processedCount = Number(payload.processedCount || 0);
  if (processedCount > 0) {
    console.log(`[KnowledgeWorker] Processed ${processedCount} job(s)`);
  } else {
    console.log("[KnowledgeWorker] Queue idle");
  }

  return processedCount;
}

async function runLoop() {
  console.log("[KnowledgeWorker] Starting");
  console.log(`[KnowledgeWorker] BASE_URL=${BASE_URL}`);
  console.log(`[KnowledgeWorker] BATCH_SIZE=${BATCH_SIZE}`);
  console.log(`[KnowledgeWorker] POLL_MS=${POLL_MS}`);
  console.log(`[KnowledgeWorker] IDLE_MS=${IDLE_MS}`);
  console.log(`[KnowledgeWorker] MODE=${ONCE ? "once" : "loop"}`);

  while (running) {
    try {
      const processed = await processBatch();

      if (ONCE) {
        break;
      }

      await sleep(processed > 0 ? POLL_MS : IDLE_MS);
    } catch (error) {
      console.error("[KnowledgeWorker] Error:", error && error.message ? error.message : error);
      if (ONCE) {
        process.exitCode = 1;
        break;
      }
      await sleep(Math.max(IDLE_MS, 7000));
    }
  }

  console.log("[KnowledgeWorker] Stopped");
}

process.on("SIGINT", () => {
  console.log("[KnowledgeWorker] SIGINT received");
  running = false;
});

process.on("SIGTERM", () => {
  console.log("[KnowledgeWorker] SIGTERM received");
  running = false;
});

runLoop().catch((error) => {
  console.error("[KnowledgeWorker] Fatal:", error);
  process.exit(1);
});

