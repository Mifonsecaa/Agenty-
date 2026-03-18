/*
  Generate a business-specific retrieval eval dataset from current KnowledgeItem rows.

  Usage:
    RAG_EVAL_BUSINESS_ID=<business_id> npm run rag:dataset:generate

  Optional:
    RAG_EVAL_GENERATE_COUNT=20
    RAG_EVAL_OUTPUT=scripts/rag-retrieval-eval.generated.json
*/

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const BUSINESS_ID = process.env.RAG_EVAL_BUSINESS_ID || "";
const COUNT = Number(process.env.RAG_EVAL_GENERATE_COUNT || 20);
const OUTPUT = process.env.RAG_EVAL_OUTPUT || "scripts/rag-retrieval-eval.generated.json";

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u017f\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTerms(text) {
  const blacklist = new Set(["para", "con", "sin", "una", "uno", "que", "como", "esta", "este", "sobre", "desde", "hasta", "por", "las", "los", "del", "de", "el", "la"]);
  const terms = normalizeForMatch(text)
    .split(" ")
    .filter((w) => w.length >= 4 && !blacklist.has(w));
  return Array.from(new Set(terms)).slice(0, 4);
}

function toMeta(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return {};
}

function buildQuery(title, terms) {
  if (title) return `Que informacion importante hay sobre ${title}?`;
  if (terms.length) return `Podrias explicarme sobre ${terms.slice(0, 2).join(" y ")}?`;
  return "Que informacion relevante tienes sobre este tema?";
}

async function run() {
  if (!BUSINESS_ID) {
    throw new Error("Missing RAG_EVAL_BUSINESS_ID");
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
    take: Math.max(50, COUNT * 5),
  });

  if (!rows.length) {
    throw new Error("No knowledge items found for this business");
  }

  const out = [];
  const seen = new Set();

  for (const row of rows) {
    if (out.length >= COUNT) break;

    const meta = toMeta(row.metadata);
    const sourceId = typeof meta.sourceId === "string" ? meta.sourceId : undefined;
    const contentHash = typeof meta.contentHash === "string" ? meta.contentHash : undefined;
    const title = typeof meta.title === "string" ? meta.title : (typeof meta.fileName === "string" ? meta.fileName : "");
    const terms = pickTerms(row.content || "");

    const dedupKey = sourceId || contentHash || row.id;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    out.push({
      id: `generated-${out.length + 1}`,
      query: buildQuery(title, terms),
      expected: {
        sourceIds: sourceId ? [sourceId] : [],
        contentHashes: contentHash ? [contentHash] : [],
        mustContainAny: terms,
      },
      notes: {
        title: title || null,
        knowledgeItemId: row.id,
      },
    });
  }

  const outputPath = path.isAbsolute(OUTPUT) ? OUTPUT : path.join(process.cwd(), OUTPUT);
  fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`[RagDatasetGen] Generated ${out.length} cases -> ${outputPath}`);
}

run()
  .catch((error) => {
    console.error("[RagDatasetGen] Error:", error && error.message ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

