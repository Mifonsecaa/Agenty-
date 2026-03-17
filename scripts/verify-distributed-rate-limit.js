/*
  Quick verifier for distributed rate-limit behavior across two app instances.
  Configure BASE_URL_A and BASE_URL_B to point to two running instances.
*/

const BASE_URL_A = process.env.BASE_URL_A || "http://localhost:3001";
const BASE_URL_B = process.env.BASE_URL_B || "http://localhost:3002";
const REQUESTS = Number(process.env.VERIFY_BURST_REQUESTS || 20);

async function isReachable(baseUrl) {
  try {
    // A 404 still means the server is reachable and listening.
    await fetch(baseUrl, { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

async function hit(baseUrl, idx) {
  const res = await fetch(`${baseUrl}/api/metrics?businessId=test&days=7`, {
    headers: {
      "x-forwarded-for": "203.0.113.50",
      "user-agent": "verify-distributed-rate-limit",
      "x-test-run": String(idx),
    },
  });

  return {
    baseUrl,
    status: res.status,
  };
}

async function run() {
  console.log(`[Verify] BASE_URL_A=${BASE_URL_A}`);
  console.log(`[Verify] BASE_URL_B=${BASE_URL_B}`);
  console.log(`[Verify] REQUESTS=${REQUESTS}`);

  const [reachableA, reachableB] = await Promise.all([
    isReachable(BASE_URL_A),
    isReachable(BASE_URL_B),
  ]);

  if (!reachableA) {
    console.error(`[Verify] BASE_URL_A is not reachable: ${BASE_URL_A}`);
    console.error("[Verify] Start your first app instance and retry.");
    process.exit(1);
    return;
  }

  if (!reachableB) {
    console.error(`[Verify] BASE_URL_B is not reachable: ${BASE_URL_B}`);
    console.error("[Verify] Start a second app instance to validate distributed limits.");
    console.error("[Verify] Example: npx next dev -H 0.0.0.0 -p 3002");
    process.exit(1);
    return;
  }

  const tasks = [];
  for (let i = 0; i < REQUESTS; i++) {
    tasks.push(hit(i % 2 === 0 ? BASE_URL_A : BASE_URL_B, i));
  }

  const settled = await Promise.allSettled(tasks);
  const failed = settled.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    console.error(`[Verify] ${failed.length} request(s) failed during burst test.`);
    process.exit(1);
    return;
  }

  const results = settled.map((result) => result.value);

  const byStatus = new Map();
  for (const result of results) {
    byStatus.set(result.status, (byStatus.get(result.status) || 0) + 1);
  }

  console.log("[Verify] Status distribution:");
  for (const [status, count] of [...byStatus.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${status}: ${count}`);
  }

  const got429 = results.some((r) => r.status === 429);
  if (!got429) {
    console.log("[Verify] No 429 observed. Increase VERIFY_BURST_REQUESTS or lower METRICS_RATE_LIMIT_MAX.");
    process.exitCode = 1;
    return;
  }

  console.log("[Verify] 429 observed across shared requester key. Check both instances logs for cross-instance limiting.");
}

run().catch((error) => {
  console.error("[Verify] Error:", error && error.message ? error.message : error);
  process.exit(1);
});

