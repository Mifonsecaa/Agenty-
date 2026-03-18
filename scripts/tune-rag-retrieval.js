/*
  Grid-search autotuner for retrieval config (hit@k / MRR) using eval-rag-retrieval-hitk.js.

  Usage:
    RAG_EVAL_BUSINESS_ID=<business_id> npm run tune:rag:retrieval

  Optional:
    RAG_EVAL_DATASET=scripts/rag-retrieval-eval.generated.json
    RAG_TUNE_TOP_KS=3,4,5
    RAG_TUNE_MIN_VECTORS=0.55,0.6,0.65
    RAG_TUNE_MULTI_QUERY=true,false
    RAG_TUNE_MAX_VARIANTS=1,2
    RAG_EVAL_PRIMARY_K=3
*/

const { spawnSync } = require("child_process");
const path = require("path");

const BUSINESS_ID = process.env.RAG_EVAL_BUSINESS_ID || "";
const DATASET = process.env.RAG_EVAL_DATASET || path.join("scripts", "rag-retrieval-eval.starter.json");
const PRIMARY_K = Number(process.env.RAG_EVAL_PRIMARY_K || 3);
const OUTPUT_JSON = (process.env.RAG_TUNE_OUTPUT_JSON || "false").toLowerCase() === "true";
const OUTPUT_FILE = process.env.RAG_TUNE_OUTPUT_FILE || "";

function parseList(value, parser) {
  return String(value || "")
    .split(",")
    .map((v) => parser(v.trim()))
    .filter((v) => v !== null && v !== undefined);
}

const TOP_KS = parseList(process.env.RAG_TUNE_TOP_KS || "3,4,5", (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

const MIN_VECTORS = parseList(process.env.RAG_TUNE_MIN_VECTORS || "0.55,0.6,0.65", (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : null;
});

const MULTI_QUERY_OPTIONS = parseList(process.env.RAG_TUNE_MULTI_QUERY || "true,false", (v) => {
  const normalized = String(v).toLowerCase();
  if (normalized === "true" || normalized === "false") return normalized;
  return null;
});

const MAX_VARIANTS = parseList(process.env.RAG_TUNE_MAX_VARIANTS || "1,2", (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

function runEval(config) {
  const scriptPath = path.join(process.cwd(), "scripts", "eval-rag-retrieval-hitk.js");
  const env = {
    ...process.env,
    RAG_EVAL_BUSINESS_ID: BUSINESS_ID,
    RAG_EVAL_DATASET: DATASET,
    RAG_EVAL_PRIMARY_K: String(PRIMARY_K),
    RAG_EVAL_MIN_HIT_RATE: "0",
    RAG_EVAL_OUTPUT_JSON: "true",
    RAG_RETRIEVAL_TOP_K: String(config.topK),
    RAG_MIN_VECTOR_SIMILARITY: String(config.minVector),
    RAG_MULTI_QUERY_ENABLED: config.multiQuery,
    RAG_MULTI_QUERY_MAX_VARIANTS: String(config.maxVariants),
  };

  const result = spawnSync(process.execPath, [scriptPath], {
    env,
    encoding: "utf8",
    shell: false,
  });

  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const match = output.match(/RAG_EVAL_RESULT=({[\s\S]*})/);
  if (!match) {
    return {
      ok: false,
      error: "Could not parse eval JSON output",
      output,
      config,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(match[1]);
  } catch (error) {
    return {
      ok: false,
      error: `Invalid eval JSON: ${error.message || error}`,
      output,
      config,
    };
  }

  const hitKey = `hit@${PRIMARY_K}`;
  return {
    ok: true,
    config,
    metrics: parsed.metrics || {},
    primaryHit: Number(parsed.metrics?.[hitKey] || 0),
    mrr: Number(parsed.metrics?.mrr || 0),
    evaluated: Number(parsed.evaluated || 0),
  };
}

function rankResults(results) {
  return [...results].sort((a, b) => {
    if (b.primaryHit !== a.primaryHit) return b.primaryHit - a.primaryHit;
    if (b.mrr !== a.mrr) return b.mrr - a.mrr;
    return b.evaluated - a.evaluated;
  });
}

function run() {
  if (!BUSINESS_ID) {
    console.error("[RagTune] Missing RAG_EVAL_BUSINESS_ID");
    process.exit(1);
    return;
  }

  const configs = [];
  for (const topK of TOP_KS) {
    for (const minVector of MIN_VECTORS) {
      for (const multiQuery of MULTI_QUERY_OPTIONS) {
        for (const maxVariants of MAX_VARIANTS) {
          configs.push({ topK, minVector, multiQuery, maxVariants });
        }
      }
    }
  }

  if (!configs.length) {
    console.error("[RagTune] No valid config combinations generated");
    process.exit(1);
    return;
  }

  console.log(`[RagTune] Testing ${configs.length} config combinations...`);

  const successes = [];
  const failures = [];

  for (const config of configs) {
    const result = runEval(config);
    if (!result.ok) {
      failures.push(result);
      continue;
    }
    successes.push(result);
  }

  if (!successes.length) {
    console.error("[RagTune] All combinations failed.");
    for (const failure of failures.slice(0, 3)) {
      console.error("[RagTune] Failure sample:", failure.error);
    }
    process.exit(1);
    return;
  }

  const ranked = rankResults(successes);
  const best = ranked[0];

  console.log("[RagTune] Top configs:");
  ranked.slice(0, 5).forEach((item, idx) => {
    console.log(
      `${idx + 1}. hit@${PRIMARY_K}=${item.primaryHit.toFixed(4)} mrr=${item.mrr.toFixed(4)} ` +
      `topK=${item.config.topK} minVector=${item.config.minVector} ` +
      `multiQuery=${item.config.multiQuery} maxVariants=${item.config.maxVariants}`
    );
  });

  console.log("[RagTune] Suggested env values:");
  console.log(`RAG_RETRIEVAL_TOP_K=${best.config.topK}`);
  console.log(`RAG_MIN_VECTOR_SIMILARITY=${best.config.minVector}`);
  console.log(`RAG_MULTI_QUERY_ENABLED=${best.config.multiQuery}`);
  console.log(`RAG_MULTI_QUERY_MAX_VARIANTS=${best.config.maxVariants}`);

  const report = {
    businessId: BUSINESS_ID,
    dataset: DATASET,
    primaryK: PRIMARY_K,
    testedCombinations: configs.length,
    successes: successes.length,
    failures: failures.length,
    best,
    top: ranked.slice(0, 5),
  };

  if (OUTPUT_FILE) {
    const fs = require("fs");
    const outputPath = path.isAbsolute(OUTPUT_FILE) ? OUTPUT_FILE : path.join(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`[RagTune] Saved report to ${outputPath}`);
  }

  if (OUTPUT_JSON) {
    console.log(`RAG_TUNE_RESULT=${JSON.stringify(report)}`);
  }

  if (failures.length > 0) {
    console.log(`[RagTune] WARN: ${failures.length} combination(s) failed to parse/evaluate.`);
  }
}

run();


