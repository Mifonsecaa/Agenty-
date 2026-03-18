/*
  Validate retrieval eval dataset structure.

  Usage:
    npm run rag:dataset:validate

  Optional:
    RAG_EVAL_DATASET=scripts/rag-retrieval-eval.generated.json
*/

const fs = require("fs");
const path = require("path");

const DATASET = process.env.RAG_EVAL_DATASET || "scripts/rag-retrieval-eval.starter.json";

function fail(message) {
  console.error(`[RagDatasetValidate] ${message}`);
  process.exitCode = 1;
}

function isArrayOfStrings(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function run() {
  const filePath = path.isAbsolute(DATASET) ? DATASET : path.join(process.cwd(), DATASET);
  if (!fs.existsSync(filePath)) {
    fail(`Dataset not found: ${filePath}`);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${error.message || error}`);
    return;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    fail("Dataset must be a non-empty array");
    return;
  }

  let issues = 0;
  const ids = new Set();

  parsed.forEach((item, idx) => {
    const pos = idx + 1;
    if (!item || typeof item !== "object") {
      console.error(`[RagDatasetValidate] case #${pos}: item must be an object`);
      issues += 1;
      return;
    }

    if (typeof item.id !== "string" || !item.id.trim()) {
      console.error(`[RagDatasetValidate] case #${pos}: missing/invalid id`);
      issues += 1;
    } else if (ids.has(item.id)) {
      console.error(`[RagDatasetValidate] case #${pos}: duplicate id '${item.id}'`);
      issues += 1;
    } else {
      ids.add(item.id);
    }

    if (typeof item.query !== "string" || item.query.trim().length < 4) {
      console.error(`[RagDatasetValidate] case #${pos}: query must be a non-empty string`);
      issues += 1;
    }

    const expected = item.expected;
    if (!expected || typeof expected !== "object") {
      console.error(`[RagDatasetValidate] case #${pos}: expected must be an object`);
      issues += 1;
      return;
    }

    const sourceIds = expected.sourceIds || [];
    const contentHashes = expected.contentHashes || [];
    const mustContainAny = expected.mustContainAny || [];

    if (!isArrayOfStrings(sourceIds)) {
      console.error(`[RagDatasetValidate] case #${pos}: expected.sourceIds must be string[]`);
      issues += 1;
    }

    if (!isArrayOfStrings(contentHashes)) {
      console.error(`[RagDatasetValidate] case #${pos}: expected.contentHashes must be string[]`);
      issues += 1;
    }

    if (!isArrayOfStrings(mustContainAny)) {
      console.error(`[RagDatasetValidate] case #${pos}: expected.mustContainAny must be string[]`);
      issues += 1;
    }

    if (
      Array.isArray(sourceIds) &&
      Array.isArray(contentHashes) &&
      Array.isArray(mustContainAny) &&
      sourceIds.length === 0 &&
      contentHashes.length === 0 &&
      mustContainAny.length === 0
    ) {
      console.error(`[RagDatasetValidate] case #${pos}: at least one expectation list must have values`);
      issues += 1;
    }
  });

  if (issues > 0) {
    fail(`Validation failed with ${issues} issue(s)`);
    return;
  }

  console.log(`[RagDatasetValidate] OK - ${parsed.length} case(s) validated (${filePath})`);
}

run();

