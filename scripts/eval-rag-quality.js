/*
  RAG quality smoke evaluation for a business knowledge base.

  Usage:
    RAG_EVAL_BUSINESS_ID=<id> node scripts/eval-rag-quality.js
*/

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BUSINESS_ID = process.env.RAG_EVAL_BUSINESS_ID || "";
const TAKE = Number(process.env.RAG_EVAL_TAKE || 1000);

function toMeta(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 10000) / 100;
}

async function run() {
  if (!BUSINESS_ID) {
    console.error("[RagEval] Missing RAG_EVAL_BUSINESS_ID");
    process.exit(1);
    return;
  }

  const rows = await prisma.knowledgeItem.findMany({
    where: { businessId: BUSINESS_ID },
    select: {
      id: true,
      content: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(5000, TAKE)),
  });

  if (!rows.length) {
    console.log("[RagEval] No knowledge items found for business.");
    process.exitCode = 1;
    return;
  }

  const uniqueHashes = new Set();
  let withSourceId = 0;
  let withChunkIndex = 0;
  let withTokenCount = 0;
  let withHash = 0;
  let nonEmptyChunks = 0;
  let totalChars = 0;

  for (const row of rows) {
    const content = String(row.content || "").trim();
    if (content) {
      nonEmptyChunks += 1;
      totalChars += content.length;
    }

    const meta = toMeta(row.metadata);
    if (typeof meta.sourceId === "string" && meta.sourceId.trim()) withSourceId += 1;
    if (typeof meta.chunkIndex === "number") withChunkIndex += 1;
    if (typeof meta.tokenCount === "number" && Number.isFinite(meta.tokenCount)) withTokenCount += 1;
    if (typeof meta.contentHash === "string" && meta.contentHash.trim()) {
      withHash += 1;
      uniqueHashes.add(meta.contentHash.trim());
    }
  }

  const duplicateHashCount = withHash - uniqueHashes.size;

  const report = {
    businessId: BUSINESS_ID,
    sampledItems: rows.length,
    nonEmptyChunks,
    avgChunkChars: Math.round(totalChars / Math.max(1, nonEmptyChunks)),
    metadataCoverage: {
      sourceIdPct: pct(withSourceId, rows.length),
      chunkIndexPct: pct(withChunkIndex, rows.length),
      tokenCountPct: pct(withTokenCount, rows.length),
      contentHashPct: pct(withHash, rows.length),
    },
    dedup: {
      duplicateHashCount,
      duplicateHashPct: pct(duplicateHashCount, Math.max(1, withHash)),
    },
    thresholds: {
      minCoveragePct: 90,
      maxDuplicateHashPct: 5,
    },
  };

  const coverageOk =
    report.metadataCoverage.sourceIdPct >= 90 &&
    report.metadataCoverage.chunkIndexPct >= 90 &&
    report.metadataCoverage.tokenCountPct >= 90 &&
    report.metadataCoverage.contentHashPct >= 90;

  const dedupOk = report.dedup.duplicateHashPct <= 5;

  console.log("[RagEval] Report");
  console.log(JSON.stringify(report, null, 2));

  if (!coverageOk || !dedupOk) {
    console.log("[RagEval] WARN: Quality thresholds not fully met.");
    process.exitCode = 1;
    return;
  }

  console.log("[RagEval] PASS: RAG metadata and dedup quality look good.");
}

run()
  .catch((error) => {
    console.error("[RagEval] Error:", error && error.message ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

