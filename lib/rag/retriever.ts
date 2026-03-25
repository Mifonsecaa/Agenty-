import { OpenAIEmbeddings } from "@langchain/openai";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

type RetrieverCandidate = {
  content: string;
  metadata: Record<string, unknown>;
  distance: number;
  vectorScore: number;
  lexicalScore: number;
  combinedScore: number;
};

type RetrieverRow = { content: string; metadata: unknown; distance: number };

type RetrieverResult = {
  selected: RetrieverCandidate[];
  ragContext: string;
  availableFiles: Array<{ url: string; description: string }>;
  skipped: boolean;
  skipReason?: string;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  lastAccessAt: number;
};

const retrievalCache = new Map<string, CacheEntry<RetrieverResult>>();
const retrievalKeysByBusiness = new Map<string, Set<string>>();
const knowledgePresenceCache = new Map<string, CacheEntry<boolean>>();

const RAG_RETRIEVAL_CACHE_TTL_MS = Number(process.env.RAG_RETRIEVAL_CACHE_TTL_MS || 90000);
const RAG_RETRIEVAL_CACHE_MAX_ENTRIES = Number(process.env.RAG_RETRIEVAL_CACHE_MAX_ENTRIES || 600);
const RAG_RETRIEVAL_CANDIDATES = Number(process.env.RAG_RETRIEVAL_CANDIDATES || 10);
const RAG_RETRIEVAL_TOP_K = Number(process.env.RAG_RETRIEVAL_TOP_K || 4);
const RAG_MIN_VECTOR_SIMILARITY = Number(process.env.RAG_MIN_VECTOR_SIMILARITY || 0.8);
const RAG_MIN_LEXICAL_OVERLAP = Number(process.env.RAG_MIN_LEXICAL_OVERLAP || 0.22);
const RAG_DIVERSITY_SIMILARITY_THRESHOLD = Number(process.env.RAG_DIVERSITY_SIMILARITY_THRESHOLD || 0.9);
const RAG_DIVERSITY_MAX_POOL = Number(process.env.RAG_DIVERSITY_MAX_POOL || 24);
const RAG_CONTEXT_MAX_CHARS = Number(process.env.RAG_CONTEXT_MAX_CHARS || 2600);
const RAG_CONTEXT_MAX_TOKENS = Number(process.env.RAG_CONTEXT_MAX_TOKENS || 900);
const RAG_MULTI_QUERY_ENABLED = (process.env.RAG_MULTI_QUERY_ENABLED || "true").toLowerCase() !== "false";
const RAG_MULTI_QUERY_MAX_VARIANTS = Number(process.env.RAG_MULTI_QUERY_MAX_VARIANTS || 2);
const RAG_KNOWLEDGE_PRESENCE_TTL_MS = Number(process.env.RAG_KNOWLEDGE_PRESENCE_TTL_MS || 90000);

let embeddingsClient: OpenAIEmbeddings | null = null;

function getEmbeddingsClient() {
  if (!embeddingsClient) {
    embeddingsClient = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });
  }
  return embeddingsClient;
}

function nowMs() {
  return Date.now();
}

function buildKey(parts: unknown[]) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u017f\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(value: string) {
  return normalizeForMatch(value)
    .split(" ")
    .filter((term) => term.length >= 3)
    .slice(0, 20);
}

function termSet(value: string) {
  return new Set(extractTerms(value));
}

function tokenSetSimilarity(a: string, b: string) {
  const aSet = termSet(a);
  const bSet = termSet(b);
  if (!aSet.size || !bSet.size) return 0;

  let intersection = 0;
  for (const term of aSet) {
    if (bSet.has(term)) intersection += 1;
  }

  const union = aSet.size + bSet.size - intersection;
  if (!union) return 0;
  return intersection / union;
}

function applyDiversityRerank(candidates: RetrieverCandidate[]) {
  const threshold = Math.max(0.75, Math.min(0.99, RAG_DIVERSITY_SIMILARITY_THRESHOLD));
  const poolLimit = Math.max(6, Math.min(80, RAG_DIVERSITY_MAX_POOL));
  const reranked = candidates.slice(0, poolLimit);

  const selected: RetrieverCandidate[] = [];

  for (const candidate of reranked) {
    let duplicateIdx = -1;
    for (let i = 0; i < selected.length; i++) {
      const similarity = tokenSetSimilarity(candidate.content, selected[i].content);
      if (similarity >= threshold) {
        duplicateIdx = i;
        break;
      }
    }

    if (duplicateIdx === -1) {
      selected.push(candidate);
      continue;
    }

    const previous = selected[duplicateIdx];
    const replaceByLength = candidate.content.length > previous.content.length;
    const replaceByScoreTie =
      candidate.content.length === previous.content.length &&
      candidate.combinedScore > previous.combinedScore;

    // Si son casi duplicados, conservar el chunk mas largo para evitar perdida de detalle.
    if (replaceByLength || replaceByScoreTie) {
      selected[duplicateIdx] = candidate;
    }
  }

  return selected.sort((a, b) => b.combinedScore - a.combinedScore);
}

function lexicalOverlapScore(queryTerms: string[], content: string) {
  if (!queryTerms.length || !content) return 0;
  const normalized = normalizeForMatch(content);
  let hits = 0;
  for (const term of queryTerms) {
    if (normalized.includes(term)) hits += 1;
  }
  return hits / queryTerms.length;
}

function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

function shouldSkipRag(query: string) {
  if ((process.env.RAG_ENABLE_HEURISTIC_SKIP || "true").toLowerCase() === "false") {
    return { skipped: false as const };
  }

  const normalized = normalizeForMatch(query);
  if (!normalized || normalized.length < 4) {
    return { skipped: true as const, reason: "short_query" };
  }

  const smallTalk = ["hola", "buenas", "gracias", "ok", "dale", "hello", "thanks", "hi"];
  if (smallTalk.includes(normalized)) {
    return { skipped: true as const, reason: "small_talk" };
  }

  return { skipped: false as const };
}

function buildQueryVariants(query: string) {
  const normalized = normalizeForMatch(query);
  const variants = new Set<string>();
  variants.add(query.trim());

  if (!RAG_MULTI_QUERY_ENABLED) {
    return Array.from(variants).filter(Boolean);
  }

  const withoutPoliteness = normalized
    .replace(/\b(por favor|porfa|me ayudas|me puedes|podrias|podrias decirme|quiero saber)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (withoutPoliteness && withoutPoliteness !== normalized) {
    variants.add(withoutPoliteness);
  }

  const tokens = normalized.split(" ").filter((t) => t.length >= 3);
  if (tokens.length >= 6) {
    variants.add(tokens.slice(0, 6).join(" "));
  }

  return Array.from(variants).filter(Boolean).slice(0, Math.max(1, Math.min(3, RAG_MULTI_QUERY_MAX_VARIANTS)));
}

async function retrieveRowsForQuery(params: { businessId: string; queryText: string; embeddings: OpenAIEmbeddings; candidatesLimit: number }) {
  const queryVector = await params.embeddings.embedQuery(params.queryText);
  const vectorStr = `[${queryVector.join(",")}]`;

  const rows = await prisma.$queryRaw<Array<{ content: string; metadata: unknown; distance: number }>>`
    SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
    FROM "KnowledgeItem"
    WHERE "businessId" = ${params.businessId}
      AND embedding IS NOT NULL
    ORDER BY embedding <-> ${vectorStr}::vector
    LIMIT ${params.candidatesLimit}
  `;

  return rows;
}

async function retrieveRowsLexicalFallback(params: { businessId: string; queryText: string; candidatesLimit: number }): Promise<RetrieverRow[]> {
  const queryTerms = extractTerms(params.queryText);
  const terms = queryTerms.length > 0 ? queryTerms.slice(0, 5) : [params.queryText.trim()];

  const rows = await prisma.knowledgeItem.findMany({
    where: {
      businessId: params.businessId,
      OR: terms
        .filter(Boolean)
        .map((term) => ({ content: { contains: term, mode: "insensitive" as const } })),
    },
    select: { content: true, metadata: true },
    orderBy: { createdAt: "desc" },
    take: Math.max(params.candidatesLimit * 3, 18),
  });

  // Distancia sintética para reutilizar el mismo pipeline de ranking.
  return rows.map((row, idx) => ({ content: row.content, metadata: row.metadata, distance: 0.95 + idx * 0.001 }));
}

function pruneExpired<T>(cache: Map<string, CacheEntry<T>>) {
  const now = nowMs();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

function enforceMaxEntries<T>(cache: Map<string, CacheEntry<T>>, maxEntries: number) {
  if (cache.size <= maxEntries) return;
  const ordered = Array.from(cache.entries()).sort((a, b) => a[1].lastAccessAt - b[1].lastAccessAt);
  const toDelete = cache.size - maxEntries;
  for (let i = 0; i < toDelete; i++) {
    const key = ordered[i]?.[0];
    if (key) cache.delete(key);
  }
}

function getCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const now = nowMs();
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  entry.lastAccessAt = now;
  return entry.value;
}

function getCachedResult(key: string) {
  const entry = retrievalCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    retrievalCache.delete(key);
    return null;
  }
  entry.lastAccessAt = nowMs();
  return entry.value;
}

function setCachedResult(businessId: string, key: string, value: RetrieverResult) {
  retrievalCache.set(key, {
    value,
    expiresAt: nowMs() + RAG_RETRIEVAL_CACHE_TTL_MS,
    lastAccessAt: nowMs(),
  });

  const keySet = retrievalKeysByBusiness.get(businessId) || new Set<string>();
  keySet.add(key);
  retrievalKeysByBusiness.set(businessId, keySet);

  pruneExpired(retrievalCache);
  enforceMaxEntries(retrievalCache, RAG_RETRIEVAL_CACHE_MAX_ENTRIES);
}

function capContext(chunks: string[]) {
  const maxChars = Math.max(600, RAG_CONTEXT_MAX_CHARS);
  const maxTokens = Math.max(200, RAG_CONTEXT_MAX_TOKENS);

  const selected: string[] = [];
  let usedChars = 0;
  let usedTokens = 0;

  for (const chunk of chunks) {
    const value = chunk.trim();
    if (!value) continue;

    const nextChars = value.length + 2;
    const nextTokens = estimateTokens(value);

    if (selected.length > 0 && (usedChars + nextChars > maxChars || usedTokens + nextTokens > maxTokens)) {
      break;
    }

    if (selected.length === 0 && (nextChars > maxChars || nextTokens > maxTokens)) {
      const maxFromTokens = Math.max(200, maxTokens * 4);
      selected.push(value.slice(0, Math.min(maxChars, maxFromTokens)));
      break;
    }

    selected.push(value);
    usedChars += nextChars;
    usedTokens += nextTokens;
  }

  return selected;
}

async function hasKnowledgeForBusiness(businessId: string) {
  const cached = getCacheValue(knowledgePresenceCache, businessId);
  if (typeof cached === "boolean") {
    return cached;
  }

  const row = await prisma.knowledgeItem.findFirst({
    where: { businessId },
    select: { id: true },
  });

  const hasKnowledge = Boolean(row?.id);
  setCachedResultForPresence(businessId, hasKnowledge);
  return hasKnowledge;
}

function setCachedResultForPresence(businessId: string, hasKnowledge: boolean) {
  knowledgePresenceCache.set(businessId, {
    value: hasKnowledge,
    expiresAt: nowMs() + RAG_KNOWLEDGE_PRESENCE_TTL_MS,
    lastAccessAt: nowMs(),
  });
  pruneExpired(knowledgePresenceCache);
  enforceMaxEntries(knowledgePresenceCache, 1000);
}

export async function retrieveRagContext(params: { businessId: string; query: string }): Promise<RetrieverResult> {
  const businessId = params.businessId;
  const query = (params.query || "").trim();

  if (!query) {
    return { selected: [], ragContext: "", availableFiles: [], skipped: true, skipReason: "missing_query" };
  }

  const skip = shouldSkipRag(query);
  if (skip.skipped) {
    return { selected: [], ragContext: "", availableFiles: [], skipped: true, skipReason: skip.reason };
  }

  const hasKnowledge = await hasKnowledgeForBusiness(businessId);
  if (!hasKnowledge) {
    return { selected: [], ragContext: "", availableFiles: [], skipped: true, skipReason: "no_knowledge" };
  }

  const cacheKey = buildKey(["retrieval", businessId, normalizeForMatch(query)]);
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  const queryTerms = extractTerms(query);

  const candidatesLimit = Math.max(4, Math.min(20, RAG_RETRIEVAL_CANDIDATES));
  const topK = Math.max(1, Math.min(8, RAG_RETRIEVAL_TOP_K));
  const variants = buildQueryVariants(query);

  let rowBatches: RetrieverRow[][] = [];
  if (process.env.OPENAI_API_KEY) {
    try {
      const embeddings = getEmbeddingsClient();
      rowBatches = await Promise.all(
        variants.map((variant) =>
          retrieveRowsForQuery({
            businessId,
            queryText: variant,
            embeddings,
            candidatesLimit,
          })
        )
      );
    } catch (vectorError) {
      console.warn("[RAG Retriever] Vector retrieval failed, fallback to lexical:", vectorError);
    }
  }

  if (!rowBatches.length || rowBatches.every((batch) => batch.length === 0)) {
    rowBatches = await Promise.all(
      variants.map((variant) =>
        retrieveRowsLexicalFallback({
          businessId,
          queryText: variant,
          candidatesLimit,
        })
      )
    );
  }

  const rows: Array<{ content: string; metadata: unknown; distance: number; rank: number }> = [];
  for (const batch of rowBatches) {
    for (let i = 0; i < batch.length; i++) {
      rows.push({ ...batch[i], rank: i + 1 });
    }
  }

  if (!rows.length) {
    const empty = { selected: [], ragContext: "", availableFiles: [], skipped: false };
    setCachedResult(businessId, cacheKey, empty);
    return empty;
  }

  const fusedByKey = new Map<string, RetrieverCandidate>();
  for (const row of rows) {
      const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
      const distance = Number(row.distance ?? 2);
      const vectorScore = Math.max(0, 1 - distance);
      const lexicalScore = lexicalOverlapScore(queryTerms, row.content || "");
      const rrfBoost = 1 / (row.rank + 50);
      const combinedScore = vectorScore * 0.66 + lexicalScore * 0.24 + rrfBoost * 0.10;

      const stableId = typeof metadata.contentHash === "string" && metadata.contentHash
        ? metadata.contentHash
        : buildKey([row.content.slice(0, 180), metadata.sourceId || ""]);

      const current = {
        content: row.content,
        metadata,
        distance,
        vectorScore,
        lexicalScore,
        combinedScore,
      } as RetrieverCandidate;

      const prev = fusedByKey.get(stableId);
      if (!prev || current.combinedScore > prev.combinedScore) {
        fusedByKey.set(stableId, current);
      }
  }

  const allRanked = Array.from(fusedByKey.values()).sort((a, b) => b.combinedScore - a.combinedScore);

  const diversityRanked = applyDiversityRerank(allRanked);

  let ranked = diversityRanked
    .filter((item) => item.vectorScore >= RAG_MIN_VECTOR_SIMILARITY || item.lexicalScore >= RAG_MIN_LEXICAL_OVERLAP)
    .slice(0, topK);

  // Si los umbrales dejaron el set vacío, devolvemos los mejores candidatos
  // para evitar respuestas sin grounding cuando sí hay conocimiento.
  if (!ranked.length && diversityRanked.length > 0) {
    ranked = diversityRanked.slice(0, topK);
  }

  const availableFiles: Array<{ url: string; description: string }> = [];
  const contextChunks: string[] = [];
  const seenHashes = new Set<string>();

  for (const item of ranked) {
    const hash = typeof item.metadata.contentHash === "string"
      ? item.metadata.contentHash
      : buildKey(["fallback", item.content.slice(0, 180)]);
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    const fileUrl = typeof item.metadata.fileUrl === "string" ? item.metadata.fileUrl : "";
    const title = typeof item.metadata.title === "string"
      ? item.metadata.title
      : (typeof item.metadata.fileName === "string" ? item.metadata.fileName : "Archivo adjunto");

    let text = item.content;
    if (fileUrl) {
      availableFiles.push({ url: fileUrl, description: `Documento: ${title}` });
      text += `\n[ESTE FRAGMENTO CONTIENE UN ARCHIVO: ${fileUrl}]`;
    }

    contextChunks.push(text);
  }

  const ragContext = capContext(contextChunks).join("\n\n");
  const result: RetrieverResult = {
    selected: ranked,
    ragContext,
    availableFiles,
    skipped: false,
  };

  setCachedResult(businessId, cacheKey, result);
  return result;
}

export function invalidateRagRetrieverCacheForBusiness(businessId: string) {
  const keys = retrievalKeysByBusiness.get(businessId);
  if (!keys) return;
  for (const key of keys.values()) {
    retrievalCache.delete(key);
  }
  retrievalKeysByBusiness.delete(businessId);
  knowledgePresenceCache.delete(businessId);
}

