module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/lib/agent/state.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentState",
    ()=>AgentState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/graph/annotation.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$messages_annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/graph/messages_annotation.js [app-route] (ecmascript)");
;
const AgentState = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"].Root({
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$messages_annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MessagesAnnotation"].spec,
    businessId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"])(),
    businessName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"])(),
    config: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"])(),
    customerPhone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"])()
});
}),
"[project]/lib/rag/retriever.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invalidateRagRetrieverCacheForBusiness",
    ()=>invalidateRagRetrieverCacheForBusiness,
    "retrieveRagContext",
    ()=>retrieveRagContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
const retrievalCache = new Map();
const retrievalKeysByBusiness = new Map();
const knowledgePresenceCache = new Map();
const RAG_RETRIEVAL_CACHE_TTL_MS = Number(process.env.RAG_RETRIEVAL_CACHE_TTL_MS || 90000);
const RAG_RETRIEVAL_CACHE_MAX_ENTRIES = Number(process.env.RAG_RETRIEVAL_CACHE_MAX_ENTRIES || 600);
const RAG_RETRIEVAL_CANDIDATES = Number(process.env.RAG_RETRIEVAL_CANDIDATES || 10);
const RAG_RETRIEVAL_TOP_K = Number(process.env.RAG_RETRIEVAL_TOP_K || 4);
const RAG_MIN_VECTOR_SIMILARITY = Number(process.env.RAG_MIN_VECTOR_SIMILARITY || 0.5);
const RAG_CONTEXT_MAX_CHARS = Number(process.env.RAG_CONTEXT_MAX_CHARS || 2600);
const RAG_CONTEXT_MAX_TOKENS = Number(process.env.RAG_CONTEXT_MAX_TOKENS || 900);
const RAG_MULTI_QUERY_ENABLED = (process.env.RAG_MULTI_QUERY_ENABLED || "true").toLowerCase() !== "false";
const RAG_MULTI_QUERY_MAX_VARIANTS = Number(process.env.RAG_MULTI_QUERY_MAX_VARIANTS || 2);
const RAG_KNOWLEDGE_PRESENCE_TTL_MS = Number(process.env.RAG_KNOWLEDGE_PRESENCE_TTL_MS || 90000);
let embeddingsClient = null;
function getEmbeddingsClient() {
    if (!embeddingsClient) {
        embeddingsClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-small"
        });
    }
    return embeddingsClient;
}
function nowMs() {
    return Date.now();
}
function buildKey(parts) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(parts)).digest("hex");
}
function normalizeForMatch(value) {
    return value.toLowerCase().replace(/[^a-z0-9\u00c0-\u017f\s]/gi, " ").replace(/\s+/g, " ").trim();
}
function extractTerms(value) {
    return normalizeForMatch(value).split(" ").filter((term)=>term.length >= 3).slice(0, 20);
}
function lexicalOverlapScore(queryTerms, content) {
    if (!queryTerms.length || !content) return 0;
    const normalized = normalizeForMatch(content);
    let hits = 0;
    for (const term of queryTerms){
        if (normalized.includes(term)) hits += 1;
    }
    return hits / queryTerms.length;
}
function estimateTokens(value) {
    return Math.max(1, Math.ceil(value.length / 4));
}
function shouldSkipRag(query) {
    if ((process.env.RAG_ENABLE_HEURISTIC_SKIP || "true").toLowerCase() === "false") {
        return {
            skipped: false
        };
    }
    const normalized = normalizeForMatch(query);
    if (!normalized || normalized.length < 4) {
        return {
            skipped: true,
            reason: "short_query"
        };
    }
    const smallTalk = [
        "hola",
        "buenas",
        "gracias",
        "ok",
        "dale",
        "hello",
        "thanks",
        "hi"
    ];
    if (smallTalk.includes(normalized)) {
        return {
            skipped: true,
            reason: "small_talk"
        };
    }
    return {
        skipped: false
    };
}
function buildQueryVariants(query) {
    const normalized = normalizeForMatch(query);
    const variants = new Set();
    variants.add(query.trim());
    if (!RAG_MULTI_QUERY_ENABLED) {
        return Array.from(variants).filter(Boolean);
    }
    const withoutPoliteness = normalized.replace(/\b(por favor|porfa|me ayudas|me puedes|podrias|podrias decirme|quiero saber)\b/gi, " ").replace(/\s+/g, " ").trim();
    if (withoutPoliteness && withoutPoliteness !== normalized) {
        variants.add(withoutPoliteness);
    }
    const tokens = normalized.split(" ").filter((t)=>t.length >= 3);
    if (tokens.length >= 6) {
        variants.add(tokens.slice(0, 6).join(" "));
    }
    return Array.from(variants).filter(Boolean).slice(0, Math.max(1, Math.min(3, RAG_MULTI_QUERY_MAX_VARIANTS)));
}
async function retrieveRowsForQuery(params) {
    const queryVector = await params.embeddings.embedQuery(params.queryText);
    const vectorStr = `[${queryVector.join(",")}]`;
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
    SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
    FROM "KnowledgeItem"
    WHERE "businessId" = ${params.businessId}
      AND embedding IS NOT NULL
    ORDER BY embedding <-> ${vectorStr}::vector
    LIMIT ${params.candidatesLimit}
  `;
    return rows;
}
async function retrieveRowsLexicalFallback(params) {
    const queryTerms = extractTerms(params.queryText);
    const terms = queryTerms.length > 0 ? queryTerms.slice(0, 5) : [
        params.queryText.trim()
    ];
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
        where: {
            businessId: params.businessId,
            OR: terms.filter(Boolean).map((term)=>({
                    content: {
                        contains: term,
                        mode: "insensitive"
                    }
                }))
        },
        select: {
            content: true,
            metadata: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: Math.max(params.candidatesLimit * 3, 18)
    });
    // Distancia sintética para reutilizar el mismo pipeline de ranking.
    return rows.map((row, idx)=>({
            content: row.content,
            metadata: row.metadata,
            distance: 0.95 + idx * 0.001
        }));
}
function pruneExpired(cache) {
    const now = nowMs();
    for (const [key, entry] of cache.entries()){
        if (entry.expiresAt <= now) {
            cache.delete(key);
        }
    }
}
function enforceMaxEntries(cache, maxEntries) {
    if (cache.size <= maxEntries) return;
    const ordered = Array.from(cache.entries()).sort((a, b)=>a[1].lastAccessAt - b[1].lastAccessAt);
    const toDelete = cache.size - maxEntries;
    for(let i = 0; i < toDelete; i++){
        const key = ordered[i]?.[0];
        if (key) cache.delete(key);
    }
}
function getCacheValue(cache, key) {
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
function getCachedResult(key) {
    const entry = retrievalCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= nowMs()) {
        retrievalCache.delete(key);
        return null;
    }
    entry.lastAccessAt = nowMs();
    return entry.value;
}
function setCachedResult(businessId, key, value) {
    retrievalCache.set(key, {
        value,
        expiresAt: nowMs() + RAG_RETRIEVAL_CACHE_TTL_MS,
        lastAccessAt: nowMs()
    });
    const keySet = retrievalKeysByBusiness.get(businessId) || new Set();
    keySet.add(key);
    retrievalKeysByBusiness.set(businessId, keySet);
    pruneExpired(retrievalCache);
    enforceMaxEntries(retrievalCache, RAG_RETRIEVAL_CACHE_MAX_ENTRIES);
}
function capContext(chunks) {
    const maxChars = Math.max(600, RAG_CONTEXT_MAX_CHARS);
    const maxTokens = Math.max(200, RAG_CONTEXT_MAX_TOKENS);
    const selected = [];
    let usedChars = 0;
    let usedTokens = 0;
    for (const chunk of chunks){
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
async function hasKnowledgeForBusiness(businessId) {
    const cached = getCacheValue(knowledgePresenceCache, businessId);
    if (typeof cached === "boolean") {
        return cached;
    }
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findFirst({
        where: {
            businessId
        },
        select: {
            id: true
        }
    });
    const hasKnowledge = Boolean(row?.id);
    setCachedResultForPresence(businessId, hasKnowledge);
    return hasKnowledge;
}
function setCachedResultForPresence(businessId, hasKnowledge) {
    knowledgePresenceCache.set(businessId, {
        value: hasKnowledge,
        expiresAt: nowMs() + RAG_KNOWLEDGE_PRESENCE_TTL_MS,
        lastAccessAt: nowMs()
    });
    pruneExpired(knowledgePresenceCache);
    enforceMaxEntries(knowledgePresenceCache, 1000);
}
async function retrieveRagContext(params) {
    const businessId = params.businessId;
    const query = (params.query || "").trim();
    if (!query) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: "missing_query"
        };
    }
    const skip = shouldSkipRag(query);
    if (skip.skipped) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: skip.reason
        };
    }
    const hasKnowledge = await hasKnowledgeForBusiness(businessId);
    if (!hasKnowledge) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: "no_knowledge"
        };
    }
    const cacheKey = buildKey([
        "retrieval",
        businessId,
        normalizeForMatch(query)
    ]);
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
    const queryTerms = extractTerms(query);
    const candidatesLimit = Math.max(4, Math.min(20, RAG_RETRIEVAL_CANDIDATES));
    const topK = Math.max(1, Math.min(8, RAG_RETRIEVAL_TOP_K));
    const variants = buildQueryVariants(query);
    let rowBatches = [];
    if (process.env.OPENAI_API_KEY) {
        try {
            const embeddings = getEmbeddingsClient();
            rowBatches = await Promise.all(variants.map((variant)=>retrieveRowsForQuery({
                    businessId,
                    queryText: variant,
                    embeddings,
                    candidatesLimit
                })));
        } catch (vectorError) {
            console.warn("[RAG Retriever] Vector retrieval failed, fallback to lexical:", vectorError);
        }
    }
    if (!rowBatches.length || rowBatches.every((batch)=>batch.length === 0)) {
        rowBatches = await Promise.all(variants.map((variant)=>retrieveRowsLexicalFallback({
                businessId,
                queryText: variant,
                candidatesLimit
            })));
    }
    const rows = [];
    for (const batch of rowBatches){
        for(let i = 0; i < batch.length; i++){
            rows.push({
                ...batch[i],
                rank: i + 1
            });
        }
    }
    if (!rows.length) {
        const empty = {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: false
        };
        setCachedResult(businessId, cacheKey, empty);
        return empty;
    }
    const fusedByKey = new Map();
    for (const row of rows){
        const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
        const distance = Number(row.distance ?? 2);
        const vectorScore = Math.max(0, 1 - distance);
        const lexicalScore = lexicalOverlapScore(queryTerms, row.content || "");
        const rrfBoost = 1 / (row.rank + 50);
        const combinedScore = vectorScore * 0.66 + lexicalScore * 0.24 + rrfBoost * 0.10;
        const stableId = typeof metadata.contentHash === "string" && metadata.contentHash ? metadata.contentHash : buildKey([
            row.content.slice(0, 180),
            metadata.sourceId || ""
        ]);
        const current = {
            content: row.content,
            metadata,
            distance,
            vectorScore,
            lexicalScore,
            combinedScore
        };
        const prev = fusedByKey.get(stableId);
        if (!prev || current.combinedScore > prev.combinedScore) {
            fusedByKey.set(stableId, current);
        }
    }
    const allRanked = Array.from(fusedByKey.values()).sort((a, b)=>b.combinedScore - a.combinedScore);
    let ranked = allRanked.filter((item)=>item.vectorScore >= RAG_MIN_VECTOR_SIMILARITY || item.lexicalScore >= 0.18).slice(0, topK);
    // Si los umbrales dejaron el set vacío, devolvemos los mejores candidatos
    // para evitar respuestas sin grounding cuando sí hay conocimiento.
    if (!ranked.length && allRanked.length > 0) {
        ranked = allRanked.slice(0, topK);
    }
    const availableFiles = [];
    const contextChunks = [];
    const seenHashes = new Set();
    for (const item of ranked){
        const hash = typeof item.metadata.contentHash === "string" ? item.metadata.contentHash : buildKey([
            "fallback",
            item.content.slice(0, 180)
        ]);
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);
        const fileUrl = typeof item.metadata.fileUrl === "string" ? item.metadata.fileUrl : "";
        const title = typeof item.metadata.title === "string" ? item.metadata.title : typeof item.metadata.fileName === "string" ? item.metadata.fileName : "Archivo adjunto";
        let text = item.content;
        if (fileUrl) {
            availableFiles.push({
                url: fileUrl,
                description: `Documento: ${title}`
            });
            text += `\n[ESTE FRAGMENTO CONTIENE UN ARCHIVO: ${fileUrl}]`;
        }
        contextChunks.push(text);
    }
    const ragContext = capContext(contextChunks).join("\n\n");
    const result = {
        selected: ranked,
        ragContext,
        availableFiles,
        skipped: false
    };
    setCachedResult(businessId, cacheKey, result);
    return result;
}
function invalidateRagRetrieverCacheForBusiness(businessId) {
    const keys = retrievalKeysByBusiness.get(businessId);
    if (!keys) return;
    for (const key of keys.values()){
        retrievalCache.delete(key);
    }
    retrievalKeysByBusiness.delete(businessId);
    knowledgePresenceCache.delete(businessId);
}
}),
"[project]/lib/tools/knowledge-tool.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createKnowledgeTool",
    ()=>createKnowledgeTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/tools/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/retriever.ts [app-route] (ecmascript)");
;
;
;
const TOOL_RAG_MIN_SCORE = Number(process.env.RAG_TOOL_MIN_SCORE || 0.58);
const createKnowledgeTool = (businessId)=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DynamicStructuredTool"]({
        name: "knowledge_search",
        description: "Search in the business knowledge base for specific information about products, prices, policies, or general business rules. Use this whenever you are unsure about an answer or need official data.",
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("The search query to find relevant information in the knowledge base.")
        }),
        func: async ({ query })=>{
            try {
                console.log(`[KnowledgeTool] Searching for: "${query}" (Business: ${businessId})`);
                const retrieval = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveRagContext"])({
                    businessId,
                    query
                });
                const results = retrieval.selected.filter((item)=>item.combinedScore >= TOOL_RAG_MIN_SCORE);
                if (!results.length) {
                    return "No hay información en la base de conocimientos.";
                }
                // 3. Formatear resultados para el agente
                const context = results.map((r)=>{
                    let text = `- ${r.content}`;
                    const meta = r.metadata || {};
                    if (meta.fileUrl) {
                        text += `\n\n[FILE AVAILABLE]: This content is associated with a file. If the user asks for the document, image, or file related to this, you MUST include this tag at the end of your response: [MEDIA_URL: ${meta.fileUrl}]`;
                    }
                    return text;
                }).join("\n\n");
                return context || "La búsqueda no devolvió resultados lo suficientemente similares.";
            } catch (error) {
                console.error("[KnowledgeTool] Error:", error);
                return "Hubo un error al acceder a la base de conocimientos.";
            }
        }
    });
};
}),
"[project]/services/database/reservations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reservationService",
    ()=>reservationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
const BOGOTA_OFFSET_HOURS = -5; // America/Bogota (UTC-5, sin DST)
function parseIsoDateParts(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return {
        year,
        month,
        day
    };
}
function bogotaLocalToUtcDate(dateStr, timeStr) {
    const { year, month, day } = parseIsoDateParts(dateStr);
    const [hour, minute] = timeStr.split(":").map(Number);
    // Si Bogota es UTC-5, para llevar a UTC sumamos 5 horas.
    const utcHour = hour - BOGOTA_OFFSET_HOURS;
    return new Date(Date.UTC(year, month - 1, day, utcHour, minute, 0, 0));
}
function getBogotaDayUtcRange(dateStr) {
    const { year, month, day } = parseIsoDateParts(dateStr);
    const dayStartUtc = new Date(Date.UTC(year, month - 1, day, -BOGOTA_OFFSET_HOURS, 0, 0, 0));
    const nextDayStartUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);
    const dayEndUtc = new Date(nextDayStartUtc.getTime() - 1);
    return {
        dayStartUtc,
        dayEndUtc
    };
}
function getBogotaTimeParts(dateUtc) {
    // Convertimos el instante UTC a reloj local de Bogota y leemos con getters UTC.
    const bogotaClock = new Date(dateUtc.getTime() + BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);
    return {
        hour: bogotaClock.getUTCHours(),
        minute: bogotaClock.getUTCMinutes()
    };
}
const reservationService = {
    /**
     * Verifica disponibilidad para una fecha específica (YYYY-MM-DD)
     */ async checkAvailability (businessId, dateStr) {
        console.log(`[ReservationService] Checking availability for business ${businessId} on ${dateStr}`);
        try {
            const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
                where: {
                    id: businessId
                }
            });
            if (!business) throw new Error("Negocio no encontrado");
            const config = business.config;
            // Parsear fecha local del negocio (America/Bogota)
            const [year, month, day] = dateStr.split("-").map(Number);
            const targetDate = new Date(year, month - 1, day);
            const dayOfWeek = targetDate.getDay() || 7; // 0=Domingo -> 7
            // 1. Buscar horario para este día
            const schedule = config.schedules?.find((s)=>s.daysOfWeek.includes(dayOfWeek));
            if (!schedule) {
                return {
                    available: false,
                    reason: "El negocio está cerrado este día."
                };
            }
            // 2. Generar slots
            const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
            const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
            const duration = config.defaultDurationMinutes || 60;
            // Convertir todo a minutos para facilitar cálculos
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const allSlots = [];
            for(let time = startTotalMinutes; time < endTotalMinutes; time += duration){
                const h = Math.floor(time / 60).toString().padStart(2, '0');
                const m = (time % 60).toString().padStart(2, '0');
                allSlots.push(`${h}:${m}`);
            }
            // 3. Buscar reservas existentes DB para el dia local en Bogota
            const { dayStartUtc, dayEndUtc } = getBogotaDayUtcRange(dateStr);
            const existingReservations = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reservation.findMany({
                where: {
                    businessId,
                    startTime: {
                        gte: dayStartUtc,
                        lte: dayEndUtc
                    },
                    status: "CONFIRMED"
                }
            });
            // 4. Filtrar slots ocupados
            const availableSlots = allSlots.filter((slot)=>{
                const [h, m] = slot.split(":").map(Number);
                const slotTime = new Date(targetDate);
                slotTime.setHours(h, m, 0, 0);
                // Contar cuántas reservas hay en este slot (mismo inicio)
                const conflicts = existingReservations.filter((r)=>{
                    const { hour: rH, minute: rM } = getBogotaTimeParts(r.startTime);
                    return rH === h && rM === m;
                });
                // Verificar capacidad (default 1)
                return conflicts.length < (schedule.maxCapacity || 1);
            });
            return {
                available: true,
                slots: availableSlots
            };
        } catch (error) {
            console.error("[ReservationService] Error:", error);
            throw new Error("Error verificando disponibilidad.");
        }
    },
    /**
     * Crea una nueva reserva
     */ async createReservation (businessId, customerPhone, dateStr, timeStr, details) {
        console.log(`[ReservationService] Creating reservation for ${customerPhone} at ${dateStr} ${timeStr}`);
        try {
            // 1. Validar cliente
            let customer = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].customer.findUnique({
                where: {
                    phone: customerPhone
                }
            });
            if (!customer) {
                // Si no existe, lo creamos
                customer = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].customer.create({
                    data: {
                        phone: customerPhone,
                        name: "Cliente Nuevo"
                    }
                });
            }
            // 2. Calcular tiempos en zona horaria de Bogota y guardar en UTC
            const startTime = bogotaLocalToUtcDate(dateStr, timeStr);
            // Obtener duración del negocio para calcular endTime
            const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
                where: {
                    id: businessId
                }
            });
            const config = business?.config;
            const duration = config?.defaultDurationMinutes || 60;
            const endTime = new Date(startTime.getTime() + duration * 60000);
            // 3. Crear reserva
            // @ts-ignore
            return {
                ...await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reservation.create({
                    data: {
                        businessId,
                        customerId: customer.id,
                        startTime,
                        endTime,
                        status: "CONFIRMED",
                        details: details || "Reserva vía Agente IA",
                        metadata: {
                            source: "ai_agent"
                        }
                    }
                }),
                customerName: customer.name || "Cliente",
                customerPhone: customer.phone,
                timeZone: "America/Bogota"
            };
        } catch (error) {
            console.error("[ReservationService] Create Error:", error);
            throw new Error("No se pudo crear la reserva.");
        }
    },
    /**
     * Cancela una reserva confirmada del cliente
     */ async cancelReservation (businessId, customerPhone, params) {
        console.log(`[ReservationService] Cancelling reservation for ${customerPhone}. business=${businessId}, code=${params.reservationCode || ""}, date=${params.dateStr || ""}, time=${params.timeStr || ""}`);
        try {
            const customer = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].customer.findUnique({
                where: {
                    phone: customerPhone
                }
            });
            if (!customer) {
                throw new Error("No encontré un cliente asociado a este chat.");
            }
            let reservation = null;
            if (params.reservationCode) {
                reservation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reservation.findFirst({
                    where: {
                        businessId,
                        customerId: customer.id,
                        status: "CONFIRMED",
                        id: {
                            endsWith: params.reservationCode.toLowerCase()
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
            } else if (params.dateStr && params.timeStr) {
                const startTime = bogotaLocalToUtcDate(params.dateStr, params.timeStr);
                reservation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reservation.findFirst({
                    where: {
                        businessId,
                        customerId: customer.id,
                        status: "CONFIRMED",
                        startTime
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });
            } else {
                throw new Error("Para cancelar necesito el código de reserva o fecha y hora.");
            }
            if (!reservation) {
                throw new Error("No encontré una reserva activa con esos datos.");
            }
            const cancelled = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reservation.update({
                where: {
                    id: reservation.id
                },
                data: {
                    status: "CANCELLED",
                    metadata: {
                        ...reservation.metadata || {},
                        cancelledBy: "ai_agent",
                        cancelledAt: new Date().toISOString()
                    }
                }
            });
            return {
                ...cancelled,
                customerName: customer.name || "Cliente",
                customerPhone: customer.phone,
                reservationCode: cancelled.id.slice(-4),
                timeZone: "America/Bogota"
            };
        } catch (error) {
            console.error("[ReservationService] Cancel Error:", error);
            throw new Error(error instanceof Error ? error.message : "No se pudo cancelar la reserva.");
        }
    }
};
}),
"[project]/lib/tools/booking-tool.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBookingTool",
    ()=>createBookingTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/tools/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$reservations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/database/reservations.ts [app-route] (ecmascript)");
;
;
;
const MONTHS_ES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
];
const MONTH_INDEX_ES = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12
};
const WEEKDAY_INDEX_ES = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6
};
const WEEKDAY_NAMES_ES = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
];
function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function startOfToday(now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function normalizeNaturalTime(input) {
    const raw = input.trim();
    if (!raw) return null;
    const normalized = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (normalized === "mediodia") return "12:00";
    if (normalized === "medianoche") return "00:00";
    // HH:mm en 24h
    const hhmmMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
        const hour = Number(hhmmMatch[1]);
        const minute = Number(hhmmMatch[2]);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    // Formatos AM/PM: 5pm, 5 pm, 5:30pm, 5:30 pm
    const amPmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (amPmMatch) {
        let hour = Number(amPmMatch[1]);
        const minute = Number(amPmMatch[2] || "0");
        const meridiem = amPmMatch[3];
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
        if (meridiem === "pm" && hour !== 12) hour += 12;
        if (meridiem === "am" && hour === 12) hour = 0;
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    // Formatos con lenguaje natural: "5 de la tarde", "8 de la noche", "9 de la manana"
    const daytimeMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?(?:\s*(?:de\s+la\s+)?)?(manana|tarde|noche)$/);
    if (daytimeMatch) {
        let hour = Number(daytimeMatch[1]);
        const minute = Number(daytimeMatch[2] || "0");
        const period = daytimeMatch[3];
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
        if (period === "manana") {
            if (hour === 12) hour = 0;
        } else {
            // tarde/noche => PM
            if (hour !== 12) hour += 12;
        }
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    // Hora solo numerica: 17, 5
    const hourOnlyMatch = normalized.match(/^(\d{1,2})$/);
    if (hourOnlyMatch) {
        const hour = Number(hourOnlyMatch[1]);
        if (hour < 0 || hour > 23) return null;
        return `${String(hour).padStart(2, "0")}:00`;
    }
    return null;
}
function isWeekdayOnlyExpression(input) {
    const normalized = input.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return /^(?:el\s+)?(?:(proximo|proxima)\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/.test(normalized);
}
function formatSpanishLongDate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${day} de ${MONTHS_ES[month - 1]} del ${year}`;
}
function resolveNextWeekday(targetWeekday, now, forceNextWeek) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let delta = (targetWeekday - candidate.getDay() + 7) % 7;
    // Si menciona "proximo", o cae hoy, saltamos a la semana siguiente para evitar ambiguedad.
    if (forceNextWeek || delta === 0) {
        delta += 7;
    }
    candidate.setDate(candidate.getDate() + delta);
    return candidate;
}
function normalizeNaturalDate(input, now = new Date()) {
    const raw = input.trim();
    if (!raw) return null;
    // 1) Ya viene en formato ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }
    const normalized = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    // 2) Palabras relativas
    if (normalized === "hoy" || normalized === "today") {
        return toIsoDate(new Date(now));
    }
    if (normalized === "manana" || normalized === "tomorrow") {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return toIsoDate(d);
    }
    if (normalized === "pasado manana" || normalized === "day after tomorrow") {
        const d = new Date(now);
        d.setDate(d.getDate() + 2);
        return toIsoDate(d);
    }
    // 3) Dia de semana: "lunes", "el lunes", "proximo lunes"
    const weekdayMatch = normalized.match(/^(?:el\s+)?(?:(proximo|proxima)\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/);
    if (weekdayMatch) {
        const isNextWeek = Boolean(weekdayMatch[1]);
        const weekday = weekdayMatch[2];
        const weekdayIndex = WEEKDAY_INDEX_ES[weekday];
        const d = resolveNextWeekday(weekdayIndex, now, isNextWeek);
        return toIsoDate(d);
    }
    // 4) "15 de marzo" o "15 de marzo de 2026"
    const textMonthMatch = normalized.match(/^(?:el\s+)?(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?$/);
    if (textMonthMatch) {
        const day = Number(textMonthMatch[1]);
        const monthName = textMonthMatch[2];
        const month = MONTH_INDEX_ES[monthName];
        let year = textMonthMatch[3] ? Number(textMonthMatch[3]) : now.getFullYear();
        if (!month || day < 1 || day > 31) return null;
        const candidate = new Date(year, month - 1, day);
        if (Number.isNaN(candidate.getTime())) return null;
        if (!textMonthMatch[3] && candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            year += 1;
            const nextYearCandidate = new Date(year, month - 1, day);
            if (Number.isNaN(nextYearCandidate.getTime())) return null;
            return toIsoDate(nextYearCandidate);
        }
        return toIsoDate(candidate);
    }
    // 5) Dia suelto: "15" o "el 15"
    const dayOnlyMatch = normalized.match(/^(?:el\s+)?(\d{1,2})$/);
    if (dayOnlyMatch) {
        const day = Number(dayOnlyMatch[1]);
        if (day < 1 || day > 31) return null;
        const candidate = new Date(now.getFullYear(), now.getMonth(), day);
        // Si ese dia ya paso en el mes actual, usar siguiente mes.
        if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            candidate.setMonth(candidate.getMonth() + 1);
        }
        return toIsoDate(candidate);
    }
    // 6) dd/mm, dd-mm, dd/mm/yyyy, dd-mm-yyyy
    const slashOrDashMatch = normalized.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
    if (slashOrDashMatch) {
        const day = Number(slashOrDashMatch[1]);
        const month = Number(slashOrDashMatch[2]);
        let year = slashOrDashMatch[3] ? Number(slashOrDashMatch[3]) : now.getFullYear();
        if (year < 100) year += 2000;
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;
        const candidate = new Date(year, month - 1, day);
        if (Number.isNaN(candidate.getTime())) return null;
        return toIsoDate(candidate);
    }
    return null;
}
const createBookingTool = (businessId, customerPhone)=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DynamicStructuredTool"]({
        name: "booking_manager",
        description: "Use this tool to check availability or create a reservation for the customer. ALWAYS check availability before creating a reservation.",
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
                "CHECK",
                "CREATE",
                "CANCEL"
            ]).describe("Action to perform: CHECK for availability, CREATE to book, CANCEL to cancel."),
            date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Date in natural language or YYYY-MM-DD. Examples: 'mañana', 'pasado mañana', 'lunes', 'próximo lunes', '15', '15/03', '15 de marzo', '2026-03-15'."),
            time: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Time in natural language or HH:mm. Examples: '5pm', '5:30 pm', '5 de la tarde', '17:00'. Required for CREATE."),
            details: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Extra details for the reservation (e.g., 'Haircut and beard')."),
            reservationCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Optional reservation code (last 4 chars), used for CANCEL.")
        }),
        func: async ({ action, date, time, details, reservationCode })=>{
            try {
                const parsedDate = normalizeNaturalDate(date);
                if ((action === "CHECK" || action === "CREATE" || action === "CANCEL" && !reservationCode) && !parsedDate) {
                    return "No pude interpretar la fecha. Dime una fecha como 'mañana', 'pasado mañana', 'lunes', '15', '15/03', '15 de marzo' o '2026-03-15'.";
                }
                const normalizedCode = reservationCode?.trim().toLowerCase();
                const parsedTime = time ? normalizeNaturalTime(time) : null;
                const now = new Date();
                const today = startOfToday(now);
                const candidate = parsedDate ? new Date(`${parsedDate}T00:00:00`) : null;
                if (candidate && candidate < today) {
                    const suggestedDate = resolveNextWeekday(candidate.getDay(), now, false);
                    const suggestedDateText = formatSpanishLongDate(toIsoDate(suggestedDate));
                    const suggestedWeekday = WEEKDAY_NAMES_ES[suggestedDate.getDay()];
                    return `¿Te parece bien el próximo ${suggestedWeekday}, ${suggestedDateText}, a la misma hora, o prefieres otro día?`;
                }
                const fullDateText = parsedDate ? formatSpanishLongDate(parsedDate) : "";
                if (action === "CHECK") {
                    if (!parsedDate) {
                        return "No pude interpretar la fecha. Dime una fecha como 'mañana', 'pasado mañana', 'lunes', '15', '15/03', '15 de marzo' o '2026-03-15'.";
                    }
                    console.log(`[BookingTool] CHECK requested. businessId=${businessId}, rawDate=${date}, parsedDate=${parsedDate}`);
                    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$reservations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reservationService"].checkAvailability(businessId, parsedDate);
                    if (!result.available) {
                        return `No hay disponibilidad para el ${fullDateText}. Motivo: ${result.reason || "Cerrado o sin cupo."}`;
                    }
                    const slots = result.slots || [];
                    if (slots.length === 0) {
                        return `No hay horarios libres para el ${fullDateText}. ¿Te propongo otro día?`;
                    }
                    return `Horarios disponibles para el ${fullDateText}: ${slots.join(", ")}.`;
                }
                if (action === "CREATE") {
                    if (!parsedDate) {
                        return "No pude interpretar la fecha. Dime una fecha como 'mañana', 'pasado mañana', 'lunes', '15', '15/03', '15 de marzo' o '2026-03-15'.";
                    }
                    console.log(`[BookingTool] CREATE requested. businessId=${businessId}, customerPhone=${customerPhone || "missing"}, rawDate=${date}, parsedDate=${parsedDate}, rawTime=${time || "missing"}, parsedTime=${parsedTime || "invalid"}, details=${details || ""}`);
                    if (!time) return "Necesito la hora para confirmar la reserva (por ejemplo, '5 de la tarde' o '17:00').";
                    if (!parsedTime) return "No pude interpretar la hora. Dímela como '5pm', '5 de la tarde' o '17:00'.";
                    if (!customerPhone) return "Error: Customer phone number is missing. Cannot book.";
                    // Si el usuario dio solo dia de semana, pedimos confirmacion de la fecha exacta.
                    if (isWeekdayOnlyExpression(date)) {
                        return `Para evitar confusiones, ¿confirmas que quieres reservar para el ${fullDateText} a las ${parsedTime}?`;
                    }
                    const reservation = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$reservations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reservationService"].createReservation(businessId, customerPhone, parsedDate, parsedTime, details);
                    const bookingName = reservation.customerName && reservation.customerName !== "Cliente Nuevo" ? reservation.customerName : "Cliente";
                    const safeDetails = details?.trim();
                    console.log(`[BookingTool] CREATE success. reservationId=${reservation.id}, customerPhone=${customerPhone}, date=${parsedDate}, time=${parsedTime}`);
                    return [
                        "Listo, tu reserva quedó confirmada ✅",
                        `A nombre de: ${bookingName}`,
                        `Fecha: ${fullDateText}`,
                        `Hora (Bogotá): ${parsedTime}`,
                        safeDetails ? `Detalle: ${safeDetails}` : "",
                        `Código de reserva: #${reservation.id.slice(-4)}`
                    ].filter(Boolean).join("\n");
                }
                if (action === "CANCEL") {
                    console.log(`[BookingTool] CANCEL requested. businessId=${businessId}, customerPhone=${customerPhone || "missing"}, code=${normalizedCode || ""}, rawDate=${date || ""}, parsedDate=${parsedDate || ""}, rawTime=${time || ""}, parsedTime=${parsedTime || ""}`);
                    if (!customerPhone) return "No tengo el número del cliente para cancelar la reserva.";
                    if (!normalizedCode && !parsedDate) {
                        return "Para cancelar, indícame el código de reserva o una fecha (por ejemplo: 'cancela mi reserva del lunes').";
                    }
                    if (!normalizedCode && !parsedTime) {
                        return "Para cancelar por fecha, también necesito la hora (por ejemplo, '5 de la tarde' o '17:00').";
                    }
                    const cancelled = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$reservations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reservationService"].cancelReservation(businessId, customerPhone, {
                        reservationCode: normalizedCode,
                        dateStr: parsedDate || undefined,
                        timeStr: parsedTime || undefined
                    });
                    const cancelDateIso = cancelled.startTime instanceof Date ? cancelled.startTime.toISOString().slice(0, 10) : parsedDate || "";
                    const cancelDateText = cancelDateIso ? formatSpanishLongDate(cancelDateIso) : parsedDate ? formatSpanishLongDate(parsedDate) : "";
                    const cancelTimeText = parsedTime || (cancelled.startTime instanceof Date ? (()=>{
                        const bogotaClock = new Date(cancelled.startTime.getTime() - 5 * 60 * 60 * 1000);
                        return `${String(bogotaClock.getUTCHours()).padStart(2, "0")}:${String(bogotaClock.getUTCMinutes()).padStart(2, "0")}`;
                    })() : "");
                    return [
                        "Listo, tu reserva quedó cancelada ✅",
                        cancelled.customerName ? `A nombre de: ${cancelled.customerName}` : "",
                        cancelDateText ? `Fecha: ${cancelDateText}` : "",
                        cancelTimeText ? `Hora (Bogotá): ${cancelTimeText}` : "",
                        `Código de reserva: #${cancelled.reservationCode || cancelled.id.slice(-4)}`
                    ].filter(Boolean).join("\n");
                }
                return "Invalid action.";
            } catch (error) {
                console.error(`[BookingTool] Action failed. action=${action}, businessId=${businessId}, customerPhone=${customerPhone || "missing"}, date=${date}, time=${time || "missing"}. Error=${error?.message || error}`);
                return `Error performing booking action: ${error.message}`;
            }
        }
    });
};
}),
"[project]/lib/agent/graph.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAgentGraph",
    ()=>createAgentGraph
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$state$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/graph/state.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$prebuilt$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/prebuilt/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$prebuilt$2f$tool_node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/langgraph/dist/prebuilt/tool_node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/chat_models/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/google-genai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/google-genai/dist/chat_models.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$agent$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/agent/state.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2f$knowledge$2d$tool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/tools/knowledge-tool.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2f$booking$2d$tool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/tools/booking-tool.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/messages/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/messages/system.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const createAgentGraph = (businessId, businessName, config, customerPhone)=>{
    // 1. Definir herramientas habilitadas para este agente
    const tools = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2f$knowledge$2d$tool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createKnowledgeTool"])(businessId),
        // Booking requiere phone para CREATE; se inyecta desde el canal (WhatsApp/Telegram)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2f$booking$2d$tool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBookingTool"])(businessId, customerPhone)
    ];
    const toolNode = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$prebuilt$2f$tool_node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ToolNode"](tools);
    // 2. Definir el modelo (OpenAI es superior para Tool Calling)
    const provider = config?.aiProvider || "openai";
    let model;
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
        model = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            modelName: "gpt-4o-mini",
            temperature: 0.7,
            streaming: false
        }).bindTools(tools);
    } else if (provider === "github" && process.env.GITHUB_TOKEN) {
        // GitHub Models (via Azure AI Inference)
        model = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            modelName: "gpt-4o",
            temperature: 0.7,
            configuration: {
                baseURL: "https://models.inference.ai.azure.com",
                apiKey: process.env.GITHUB_TOKEN
            }
        }).bindTools(tools);
    } else {
        // Fallback a Gemini si es necesario
        model = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$google$2d$genai$2f$dist$2f$chat_models$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatGoogleGenerativeAI"]({
            model: "gemini-1.5-flash",
            temperature: 0.7,
            apiKey: process.env.GEMINI_API_KEY
        }).bindTools(tools);
    }
    // 3. Nodo del Agente (El que piensa)
    const callModel = async (state)=>{
        const { messages, businessName, config } = state;
        // System Prompt dinámico
        let systemPrompt = config?.systemPrompt || `Eres un asistente experto para ${businessName}. Sé amable y conciso.
       Utiliza tus herramientas si necesitas datos específicos sobre productos o políticas.`;
        systemPrompt += `\n\nTienes acceso a una herramienta de reservas llamada booking_manager.\n` + `- Usa action="CHECK" para consultar disponibilidad en una fecha (YYYY-MM-DD).\n` + `- Usa action="CREATE" para crear una reserva cuando el cliente confirme fecha y hora.\n` + `- Usa action="CANCEL" para cancelar una reserva cuando el cliente lo solicite (por código o por fecha y hora).\n` + `Antes de crear, siempre verifica primero. Explica al cliente las opciones de horarios en lenguaje natural.\n` + `REGLAS OBLIGATORIAS DE RESERVA:\n` + `1) Si el usuario habla de reservar, disponibilidad, citas u horarios, DEBES usar booking_manager; no inventes horarios.\n` + `2) No menciones fechas pasadas ni años pasados (por ejemplo 2023) en tu respuesta final al cliente.\n` + `3) Si la fecha del usuario es ambigua o antigua, ofrece una alternativa próxima con fecha completa en español (ejemplo: 16 de marzo del 2026).\n` + `4) No confirmes una reserva sin pasar por booking_manager action="CREATE".\n` + `5) No confirmes una cancelación sin pasar por booking_manager action="CANCEL".`;
        const response = await model.invoke([
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SystemMessage"](systemPrompt),
            ...messages
        ]);
        return {
            messages: [
                response
            ]
        };
    };
    // 4. Lógica de decisión: ¿Seguimos a las herramientas o terminamos?
    const shouldContinue = (state)=>{
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.additional_kwargs?.tool_calls || lastMessage.tool_calls?.length > 0) {
            return "tools";
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["END"];
    };
    // 5. Construir el Grafo
    const workflow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$state$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StateGraph"](__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$agent$2f$state$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgentState"]).addNode("agent", callModel).addNode("tools", toolNode).addEdge(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["START"], "agent").addConditionalEdges("agent", shouldContinue).addEdge("tools", "agent"); // Vuelve al agente después de usar la herramienta
    return workflow.compile();
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9822c178._.js.map