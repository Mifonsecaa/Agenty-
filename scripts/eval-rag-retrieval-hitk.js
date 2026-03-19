/*
  Retrieval quality eval for RAG (hit@k + MRR).

  Usage:
    RAG_EVAL_BUSINESS_ID=<business_id> npm run eval:rag:retrieval

  Optional:
    RAG_EVAL_DATASET=scripts/rag-retrieval-eval.sample.json
    RAG_EVAL_KS=1,3,5
    RAG_EVAL_PRIMARY_K=3
    RAG_EVAL_MIN_HIT_RATE=0.7
*/

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const BUSINESS_ID = process.env.RAG_EVAL_BUSINESS_ID || "";
const DATASET_PATH = process.env.RAG_EVAL_DATASET || path.join("scripts", "rag-retrieval-eval.starter.json");
const KS = String(process.env.RAG_EVAL_KS || "1,3,5")
  .split(",")
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isFinite(v) && v > 0)
  .sort((a, b) => a - b);
const PRIMARY_K = Number(process.env.RAG_EVAL_PRIMARY_K || 3);
const MIN_HIT_RATE = Number(process.env.RAG_EVAL_MIN_HIT_RATE || 0.7);
const OUTPUT_JSON = (process.env.RAG_EVAL_OUTPUT_JSON || "false").toLowerCase() === "true";

const CANDIDATES = Number(process.env.RAG_RETRIEVAL_CANDIDATES || 10);
const TOP_K = Number(process.env.RAG_RETRIEVAL_TOP_K || 4);
const MIN_VECTOR = Number(process.env.RAG_MIN_VECTOR_SIMILARITY || 0.6);

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u017f\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(value) {
  return normalizeForMatch(value)
    .split(" ")
    .filter((term) => term.length >= 3)
    .slice(0, 20);
}

function lexicalOverlapScore(queryTerms, content) {
  if (!queryTerms.length || !content) return 0;
  const normalized = normalizeForMatch(content);
  let hits = 0;
  for (const term of queryTerms) {
    if (normalized.includes(term)) hits += 1;
  }
  return hits / queryTerms.length;
}

function readDataset(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Dataset file not found: ${absolutePath}`);
  }
  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Dataset must be a non-empty array.");
  }
  return parsed;
}

function toMeta(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function includesAnyText(content, terms) {
  if (!Array.isArray(terms) || !terms.length) return false;
  const hay = normalizeForMatch(content);
  return terms.some((term) => hay.includes(normalizeForMatch(term)));
}

function isRelevant(item, expected) {
  const meta = toMeta(item.metadata);
  const sourceIds = Array.isArray(expected.sourceIds) ? expected.sourceIds : [];
  const contentHashes = Array.isArray(expected.contentHashes) ? expected.contentHashes : [];
  const mustContainAny = Array.isArray(expected.mustContainAny) ? expected.mustContainAny : [];

  if (sourceIds.length && typeof meta.sourceId === "string" && sourceIds.includes(meta.sourceId)) {
    return true;
  }

  if (contentHashes.length && typeof meta.contentHash === "string" && contentHashes.includes(meta.contentHash)) {
    return true;
  }

  return mustContainAny.length > 0 && includesAnyText(item.content, mustContainAny);
}

async function retrieve(query, embeddings) {
  const queryVector = await embeddings.embedQuery(query);
  const vectorStr = `[${queryVector.join(",")}]`;
  const queryTerms = extractTerms(query);

  const rows = await prisma.$queryRaw`
    SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
    FROM "KnowledgeItem"
    WHERE "businessId" = ${BUSINESS_ID}
      AND embedding IS NOT NULL
    ORDER BY embedding <-> ${vectorStr}::vector
    LIMIT ${Math.max(4, Math.min(20, CANDIDATES))}
  `;

  return rows
    .map((row) => {
      const distance = Number(row.distance ?? 2);
      const vectorScore = Math.max(0, 1 - distance);
      const lexicalScore = lexicalOverlapScore(queryTerms, row.content || "");
      return {
        ...row,
        vectorScore,
        lexicalScore,
        combinedScore: vectorScore * 0.72 + lexicalScore * 0.28,
      };
    })
    .filter((item) => item.vectorScore >= MIN_VECTOR || item.lexicalScore >= 0.28)
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, Math.max(1, Math.min(10, TOP_K)));
}

async function run() {
  if (!BUSINESS_ID) {
    throw new Error("Missing RAG_EVAL_BUSINESS_ID");
  }

  if (!KS.length) {
    throw new Error("RAG_EVAL_KS must contain at least one positive integer");
  }

  const { OpenAIEmbeddings } = await import("@langchain/openai");
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });

  const dataset = readDataset(DATASET_PATH);
  const maxK = Math.max(...KS);

  const hits = new Map();
  for (const k of KS) hits.set(k, 0);

  let reciprocalRankSum = 0;
  let evaluated = 0;
  const misses = [];

  for (const testCase of dataset) {
    const query = String(testCase.query || "").trim();
    const expected = testCase.expected || {};
    if (!query) continue;

    const results = await retrieve(query, embeddings);
    const limited = results.slice(0, maxK);

    let firstRelevantRank = null;
    for (let i = 0; i < limited.length; i++) {
      if (isRelevant(limited[i], expected)) {
        firstRelevantRank = i + 1;
        break;
      }
    }

    for (const k of KS) {
      if (firstRelevantRank && firstRelevantRank <= k) {
        hits.set(k, (hits.get(k) || 0) + 1);
      }
    }

    reciprocalRankSum += firstRelevantRank ? 1 / firstRelevantRank : 0;
    evaluated += 1;

    if (!firstRelevantRank) {
      misses.push({
        id: testCase.id || `case-${evaluated}`,
        query,
        topResultsPreview: limited.map((r) => ({
          score: Number(r.combinedScore.toFixed(3)),
          content: String(r.content || "").slice(0, 140),
        })),
      });
    }
  }

  if (!evaluated) {
    throw new Error("No valid test cases found in dataset");
  }

  const metrics = {};
  for (const k of KS) {
    const value = (hits.get(k) || 0) / evaluated;
    metrics[`hit@${k}`] = Number(value.toFixed(4));
  }
  metrics.mrr = Number((reciprocalRankSum / evaluated).toFixed(4));

  const report = {
    businessId: BUSINESS_ID,
    datasetPath: DATASET_PATH,
    evaluated,
    kValues: KS,
    metrics,
    misses: misses.slice(0, 10),
  };

  console.log("[RagRetrievalEval] Report");
  console.log(JSON.stringify(report, null, 2));

  if (OUTPUT_JSON) {
    console.log(`RAG_EVAL_RESULT=${JSON.stringify(report)}`);
  }

  const primaryHit = metrics[`hit@${PRIMARY_K}`];
  if (typeof primaryHit !== "number") {
    console.log(`[RagRetrievalEval] WARN: hit@${PRIMARY_K} not present in RAG_EVAL_KS`);
    process.exitCode = 1;
    return;
  }

  if (primaryHit < MIN_HIT_RATE) {
    console.log(
      `[RagRetrievalEval] FAIL: hit@${PRIMARY_K}=${primaryHit} is below threshold ${MIN_HIT_RATE}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[RagRetrievalEval] PASS: hit@${PRIMARY_K}=${primaryHit} (threshold ${MIN_HIT_RATE})`
  );
}

run()
  .catch((error) => {
    console.error("[RagRetrievalEval] Error:", error && error.message ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

