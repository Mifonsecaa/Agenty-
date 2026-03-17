/*
  Reads /api/metrics/ops and prints key Redis + transcription counters.
*/

const BASE_URL = process.env.OPS_BASE_URL || "http://localhost:3001";
const TOKEN = process.env.OPS_WORKER_TOKEN || process.env.TRANSCRIPTION_WORKER_TOKEN || process.env.KNOWLEDGE_WORKER_TOKEN || "";

async function isReachable(baseUrl) {
  try {
    await fetch(baseUrl, { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

function pick(obj, key) {
  if (!obj || typeof obj !== "object") return 0;
  const value = obj[key];
  return typeof value === "number" ? value : 0;
}

async function run() {
  try {
    console.log(`[OpsVerify] OPS_BASE_URL=${BASE_URL}`);

    const reachable = await isReachable(BASE_URL);
    if (!reachable) {
      console.error(`[OpsVerify] App is not reachable at ${BASE_URL}`);
      console.error("[OpsVerify] Start your app and retry (example: npm run dev).");
      process.exitCode = 1;
      return;
    }

    const headers = {};
    if (TOKEN) {
      headers["x-worker-token"] = TOKEN;
    } else {
      console.log("[OpsVerify] No worker token detected in env; relying on session auth.");
    }

    const res = await fetch(`${BASE_URL}/api/metrics/ops`, { headers });
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      console.error(`[OpsVerify] Request failed: HTTP ${res.status}`);
      if (res.status === 401) {
        console.error("[OpsVerify] Tip: set OPS_WORKER_TOKEN/TRANSCRIPTION_WORKER_TOKEN or login session for auth.");
      }
      if (payload && payload.error) {
        console.error(`[OpsVerify] API error: ${payload.error}`);
      }
      process.exitCode = 1;
      return;
    }

    if (!payload || !payload.data) {
      console.error("[OpsVerify] Invalid API response payload from /api/metrics/ops");
      process.exitCode = 1;
      return;
    }

    const counters = payload?.data?.counters || {};
    const durations = payload?.data?.durations || {};

    const keys = [
      "traffic.redis_enabled",
      "traffic.redis_connected",
      "traffic.redis_unavailable",
      "traffic.redis_fallback_memory",
      "transcription.job.enqueue",
      "transcription.job.enqueue_deduplicated",
      "transcription.job.completed",
      "transcription.job.retry",
      "transcription.job.dlq",
      "transcription.worker.process_requests",
      "transcription.worker.jobs_processed",
    ];

    console.log("[OpsVerify] Key counters:");
    for (const key of keys) {
      console.log(`  ${key}: ${pick(counters, key)}`);
    }

    const durationKeys = [
      "transcription.job.latency_ms",
      "transcription.job.error_latency_ms",
      "transcription.worker.request_latency_ms",
      "transcription.worker.batch_latency_ms",
    ];

    console.log("[OpsVerify] Key durations:");
    for (const key of durationKeys) {
      const d = durations[key];
      if (!d) {
        console.log(`  ${key}: n/a`);
        continue;
      }
      console.log(`  ${key}: count=${d.count}, avgMs=${d.avgMs}, maxMs=${d.maxMs}`);
    }
  } catch (error) {
    console.error("[OpsVerify] Error:", error && error.message ? error.message : error);
    process.exitCode = 1;
  }
}

run();

