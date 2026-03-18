module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "query"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/services/database/business.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "saveWhatsAppCredentials",
    ()=>saveWhatsAppCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
async function saveWhatsAppCredentials(userId, accessToken) {
    try {
        // Aquí, en un futuro, podrías usar el token para obtener más detalles
        // como el Phone Number ID y el Business ID desde la API de Meta.
        // Por ahora, guardaremos solo el token.
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                userId
            }
        });
        if (!business) {
            throw new Error(`No se encontró un negocio para el usuario ${userId}`);
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.update({
            where: {
                id: business.id
            },
            data: {
                whatsappAccessToken: accessToken
            }
        });
        console.log(`Credenciales de WhatsApp guardadas para el negocio: ${business.name}`);
        return {
            success: true
        };
    } catch (error) {
        console.error("Error al guardar las credenciales de WhatsApp:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$facebook$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/facebook.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@next-auth/prisma-adapter/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$business$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/database/business.ts [app-route] (ecmascript)"); // 1. Importar nuestro nuevo servicio
;
;
;
;
;
;
;
;
const authOptions = {
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$facebook$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "email,public_profile,whatsapp_business_management,whatsapp_business_messaging"
                }
            }
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) throw new Error("Credenciales inválidas");
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user || !user.password) throw new Error("Usuario no encontrado");
                const isPasswordCorrect = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");
                return user;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async signIn ({ user, account }) {
            // 2. Si la conexión es de Facebook y tenemos un token...
            if (account?.provider === 'facebook' && account.access_token) {
                console.log("Recibido token de Facebook, guardando credenciales...");
                // 3. Llamamos a la función para guardar el token en la base de datos
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$business$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveWhatsAppCredentials"])(user.id, account.access_token);
            }
            return true; // Permitir siempre el inicio de sesión/conexión
        },
        async session ({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

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
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
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
"[project]/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiService",
    ()=>aiService,
    "invalidateAiCachesForBusiness",
    ()=>invalidateAiCachesForBusiness
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/retriever.ts [app-route] (ecmascript)");
;
;
;
;
;
console.log("[AIService] Module Loading...");
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY || ''
});
const RESPONSE_CACHE_TTL_MS = Number(process.env.AI_RESPONSE_CACHE_TTL_MS || 45000);
const RESPONSE_CACHE_MAX_ENTRIES = Number(process.env.AI_RESPONSE_CACHE_MAX_ENTRIES || 300);
const responseCache = new Map();
const responseKeysByBusiness = new Map();
const businessCache = new Map();
const BUSINESS_CACHE_TTL_MS = Number(process.env.AI_BUSINESS_CACHE_TTL_MS || 45000);
function nowMs() {
    return Date.now();
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
    const entriesByLastAccess = Array.from(cache.entries()).sort((a, b)=>a[1].lastAccessAt - b[1].lastAccessAt);
    const toDelete = cache.size - maxEntries;
    for(let i = 0; i < toDelete; i++){
        const key = entriesByLastAccess[i]?.[0];
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
function setCacheValue(cache, key, value, ttlMs, maxEntries) {
    const now = nowMs();
    cache.set(key, {
        value,
        expiresAt: now + ttlMs,
        lastAccessAt: now
    });
    pruneExpired(cache);
    enforceMaxEntries(cache, maxEntries);
}
function registerCacheKey(index, businessId, key) {
    if (!businessId) return;
    const set = index.get(businessId) || new Set();
    set.add(key);
    index.set(businessId, set);
}
async function getBusinessSnapshot(businessId) {
    const cached = getCacheValue(businessCache, businessId);
    if (cached) {
        return cached;
    }
    const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
        where: {
            id: businessId
        },
        select: {
            id: true,
            name: true,
            config: true
        }
    });
    if (!business) {
        return null;
    }
    setCacheValue(businessCache, businessId, business, BUSINESS_CACHE_TTL_MS, 500);
    return business;
}
function clearCacheByBusiness(cache, index, businessId) {
    const keys = index.get(businessId);
    if (!keys) return;
    for (const key of keys.values()){
        cache.delete(key);
    }
    index.delete(businessId);
}
function buildCacheKey(parts) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(parts)).digest("hex");
}
function compactMessagesForKey(messages) {
    return messages.slice(-6).map((m)=>({
            role: m.role,
            content: m.content.slice(0, 300)
        }));
}
async function loadBusinessKnowledgeFiles(businessId) {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
        where: {
            businessId
        },
        select: {
            metadata: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 120
    });
    const seen = new Set();
    const files = [];
    for (const row of rows){
        const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
        const fileUrl = typeof metadata.fileUrl === "string" ? metadata.fileUrl : "";
        if (!fileUrl || seen.has(fileUrl)) continue;
        seen.add(fileUrl);
        const fileName = typeof metadata.fileName === "string" ? metadata.fileName : "Archivo adjunto";
        const fileType = typeof metadata.fileType === "string" ? metadata.fileType : "archivo";
        files.push({
            url: fileUrl,
            description: `${fileName} (${fileType})`
        });
        if (files.length >= 12) break;
    }
    return files;
}
const aiService = {
    async generateResponse (businessId, messages, options = {}) {
        try {
            console.log(`[AIService] Starting generation for businessId: ${businessId}`);
            // 1. Obtener la configuración del negocio
            const business = options.businessSnapshot || await getBusinessSnapshot(businessId);
            if (!business) {
                console.error(`[AIService] Business NOT FOUND in DB for ID: ${businessId}`);
                throw new Error("Negocio no encontrado en la base de datos");
            }
            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles = [];
            const lastUserMessage = messages.filter((m)=>m.role === 'user').pop()?.content || "";
            const asksForDocument = /(menu|men[uú]|cat[aá]logo|carta|pdf|archivo|documento|imagen|foto|lista\s+de\s+precios|precios\s+completos|menu\s+completo|base\s+de\s+conocimiento|conocimiento|compartir|muestrame|mu[eé]strame)/i.test(lastUserMessage);
            const asksForEverything = /(todo|toda|todos|todas|completo|completa|cualquier\s+cosa|todo\s+lo\s+que\s+tengas|todo\s+el\s+menu|men[uú]\s+completo)/i.test(lastUserMessage);
            try {
                if (lastUserMessage) {
                    const retrieval = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveRagContext"])({
                        businessId,
                        query: lastUserMessage
                    });
                    ragContext = retrieval.ragContext;
                    availableFiles = retrieval.availableFiles;
                    console.log(`[AIService] RAG retrieval selected ${retrieval.selected.length} chunks`);
                }
                // Garantiza acceso a adjuntos aunque no hayan quedado en top-k del retriever.
                const allKnowledgeFiles = await loadBusinessKnowledgeFiles(businessId);
                if (allKnowledgeFiles.length > 0) {
                    const seenUrls = new Set(availableFiles.map((f)=>f.url));
                    for (const file of allKnowledgeFiles){
                        if (seenUrls.has(file.url)) continue;
                        availableFiles.push(file);
                        seenUrls.add(file.url);
                    }
                }
            } catch (ragError) {
                console.error("[AIService] Error en RAG retrieval:", ragError);
            }
            const config = business.config;
            let systemPrompt = options.systemPrompt?.trim() || config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;
            // Inyectar contexto RAG al prompt
            if (ragContext) {
                systemPrompt += `\n\nINFORMACIÓN RELEVANTE DE TU BASE DE CONOCIMIENTO (RAG):\n${ragContext}`;
            }
            // Inyectar instrucciones para archivos
            if (availableFiles.length > 0) {
                systemPrompt += `\n\nTIENES ACCESO A LOS SIGUIENTES ARCHIVOS. Si el usuario solicita explícitamente ver el menú, catálogo, horario o documento mencionado, DEBES añadir al final de tu respuesta el comando: [MEDIA_URL: <url_del_archivo>].
                
                Archivos disponibles:
                ${availableFiles.map((f)=>`- ${f.description} (URL: ${f.url})`).join("\n")}`;
            }
            // Regla anti-alucinación para datos sensibles (precios, horarios, políticas).
            systemPrompt += "\n\nREGLA CRITICA: nunca inventes precios, horarios, stock o condiciones comerciales. Si no aparecen en la base de conocimiento/contexto, responde explícitamente que no tienes ese dato confirmado y ofrece escalar o pedir verificación.";
            const asksSensitiveData = /(precio|precios|costo|costos|tarifa|tarifas|valor|cu[aá]nto|horario|horarios|stock|disponible|promoci[oó]n|promo|descuento|pol[ií]tica|condiciones)/i.test(lastUserMessage);
            // Guardrail duro: si no hay evidencia de KB para preguntas sensibles, evitar respuesta inventada.
            if (asksSensitiveData && !ragContext && availableFiles.length === 0) {
                return "No tengo ese dato confirmado en la base de conocimiento en este momento. Si quieres, te ayudo a verificarlo o a escalarlo con el negocio.";
            }
            // 2. Determinar proveedor - Preferimos OpenAI si está disponible debido a restricciones regionales de Gemini
            const provider = options.provider || config?.aiProvider || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
            console.log(`[AIService] Business: ${business.name}, Provider Initial Choice: ${provider}`);
            const responseCacheKey = buildCacheKey([
                "response",
                businessId,
                provider,
                systemPrompt,
                compactMessagesForKey(messages)
            ]);
            const cachedResponse = getCacheValue(responseCache, responseCacheKey);
            if (cachedResponse) {
                console.log("[AIService] Response cache hit");
                return cachedResponse;
            }
            const callOpenAI = async ()=>{
                if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
                console.log("[AIService] Calling OpenAI (gpt-4o-mini)...");
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });
                return response.choices[0].message.content;
            };
            const callGitHub = async ()=>{
                if (!process.env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");
                console.log("[AIService] Calling GitHub Models (gpt-4o)...");
                const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
                    baseURL: "https://models.inference.ai.azure.com",
                    apiKey: process.env.GITHUB_TOKEN
                });
                const response = await client.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        ...messages
                    ],
                    model: "gpt-4o",
                    temperature: 0.7,
                    max_tokens: 300
                });
                return response.choices[0].message.content;
            };
            const callGemini = async ()=>{
                if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
                console.log("[AIService] Calling Gemini (gemini-1.5-flash)...");
                const model = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash'
                });
                const history = messages.slice(0, -1).map((msg)=>({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [
                            {
                                text: msg.content
                            }
                        ]
                    }));
                const lastMessage = messages[messages.length - 1].content;
                const chat = model.startChat({
                    history,
                    systemInstruction: {
                        role: "system",
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    },
                    generationConfig: {
                        maxOutputTokens: 300,
                        temperature: 0.7
                    }
                });
                const result = await chat.sendMessage(lastMessage);
                return result.response.text();
            };
            let finalResponse = "";
            if (provider === 'openai') {
                finalResponse = await callOpenAI() || "";
            } else if (provider === 'github') {
                finalResponse = await callGitHub() || "";
            } else {
                try {
                    finalResponse = await callGemini() || "";
                } catch (geminiErr) {
                    console.error("[AIService] Gemini failed, checking for OpenAI fallback...", geminiErr.message || geminiErr);
                    if (process.env.OPENAI_API_KEY) {
                        console.log("[AIService] FALLBACK TO OPENAI TRIGGERED");
                        finalResponse = await callOpenAI() || "";
                    } else {
                        throw geminiErr;
                    }
                }
            }
            // Cuando el usuario pide explícitamente un archivo/menu, forzamos etiqueta MEDIA_URL
            // para que el canal (Telegram/WhatsApp) envíe el adjunto real.
            if (asksForDocument && availableFiles.length > 0 && !/\[MEDIA_URL:\s*[^\]]+\]/i.test(finalResponse)) {
                const asksImage = /(imagen|im[aá]genes|foto|fotos|jpg|jpeg|png|webp|gif)/i.test(lastUserMessage);
                const prioritized = asksImage ? [
                    ...availableFiles
                ].sort((a, b)=>{
                    const scoreA = /(image|png|jpg|jpeg|webp|gif|imagen|foto)/i.test(a.description) ? 1 : 0;
                    const scoreB = /(image|png|jpg|jpeg|webp|gif|imagen|foto)/i.test(b.description) ? 1 : 0;
                    return scoreB - scoreA;
                }) : availableFiles;
                const filesToShare = asksForEverything ? prioritized.slice(0, 5) : prioritized.slice(0, 1);
                const mediaTags = filesToShare.filter((file)=>Boolean(file.url)).map((file)=>`[MEDIA_URL: ${file.url}]`).join("\n");
                if (mediaTags) {
                    finalResponse = `${finalResponse.trim()}\n\n${mediaTags}`;
                }
            }
            setCacheValue(responseCache, responseCacheKey, finalResponse, RESPONSE_CACHE_TTL_MS, RESPONSE_CACHE_MAX_ENTRIES);
            registerCacheKey(responseKeysByBusiness, businessId, responseCacheKey);
            return finalResponse;
        } catch (error) {
            console.error("[AIService] FINAL CRITICAL ERROR:", error.message || error);
            return "Lo siento, tuve un problema técnico al procesar tu mensaje. ¿Podrías repetirlo?";
        }
    }
};
function invalidateAiCachesForBusiness(businessId) {
    clearCacheByBusiness(responseCache, responseKeysByBusiness, businessId);
    businessCache.delete(businessId);
}
}),
"[project]/lib/rag/ingestion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IngestionService",
    ()=>IngestionService,
    "ingestionService",
    ()=>ingestionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/textsplitters/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$text_splitter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/textsplitters/dist/text_splitter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/retriever.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function normalizeContent(value) {
    return value.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function hashText(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(value).digest("hex");
}
function estimateTokenCount(value) {
    return Math.max(1, Math.ceil(value.length / 4));
}
function detectLang(value) {
    return /[\u00C0-\u017F]|\b(el|la|los|las|de|para|con|sin|que|por)\b/i.test(value) ? "es" : "unknown";
}
function buildSourceId(businessId, metadata) {
    if (typeof metadata.sourceId === "string" && metadata.sourceId.trim()) {
        return metadata.sourceId.trim();
    }
    const seed = [
        metadata.url || "",
        metadata.fileName || "",
        metadata.title || "",
        metadata.source || "manual_ingestion"
    ].join("|");
    if (!seed.replace(/\|/g, "").trim()) {
        return `manual:${businessId}`;
    }
    return `src:${hashText(seed).slice(0, 16)}`;
}
class IngestionService {
    splitter;
    embeddings;
    constructor(){
        this.splitter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$text_splitter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RecursiveCharacterTextSplitter"]({
            chunkSize: Number(process.env.RAG_CHUNK_SIZE || 700),
            chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP || 120),
            separators: [
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
                "; ",
                ", ",
                " "
            ]
        });
        this.embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
            modelName: "text-embedding-3-small"
        });
    }
    async ingestText(businessId, text, metadata = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        console.log(`[Ingestion] Tamaño del texto: ${text.length} caracteres`);
        try {
            const normalizedText = normalizeContent(text || "");
            if (!normalizedText) {
                throw new Error("EMPTY_TEXT_AFTER_NORMALIZATION");
            }
            const minChunkChars = Number(process.env.RAG_MIN_CHUNK_CHARS || 60);
            const sourceId = buildSourceId(businessId, metadata);
            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([
                normalizedText
            ]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);
            const candidateChunks = docs.map((doc)=>normalizeContent(doc.pageContent || "")).filter((chunk)=>chunk.length >= minChunkChars);
            if (!candidateChunks.length) {
                throw new Error("NO_VALID_CHUNKS");
            }
            // Deduplicacion intra-documento por hash de contenido normalizado.
            const localDedup = new Set();
            const dedupedChunks = [];
            for (const chunk of candidateChunks){
                const contentHash = hashText(chunk);
                if (localDedup.has(contentHash)) continue;
                localDedup.add(contentHash);
                dedupedChunks.push({
                    content: chunk,
                    hash: contentHash
                });
            }
            // Deduplicacion contra chunks ya ingestados para el mismo sourceId.
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
                where: {
                    businessId,
                    metadata: {
                        path: [
                            "sourceId"
                        ],
                        equals: sourceId
                    }
                },
                select: {
                    metadata: true
                },
                take: 3000,
                orderBy: {
                    createdAt: "desc"
                }
            });
            const existingHashes = new Set();
            for (const row of existing){
                const meta = row.metadata;
                if (meta && typeof meta === "object" && !Array.isArray(meta)) {
                    const hash = meta.contentHash;
                    if (typeof hash === "string" && hash) {
                        existingHashes.add(hash);
                    }
                }
            }
            const finalChunks = dedupedChunks.filter((chunk)=>!existingHashes.has(chunk.hash));
            if (!finalChunks.length) {
                console.log("[Ingestion] Todos los chunks ya existian para sourceId. Se omite ingesta.");
                return 0;
            }
            console.log(`[Ingestion] Generando embeddings batch para ${finalChunks.length} chunks...`);
            const embeddings = await this.embeddings.embedDocuments(finalChunks.map((chunk)=>chunk.content));
            if (embeddings.length !== finalChunks.length) {
                throw new Error("EMBEDDING_BATCH_SIZE_MISMATCH");
            }
            // 2. Procesar cada fragmento
            let processedItems = 0;
            for (const [index, chunk] of finalChunks.entries()){
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${finalChunks.length}...`);
                const embedding = embeddings[index];
                const vectorString = `[${embedding.join(",")}]`;
                // 3. Guardar en la DB con el vector
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                // @ts-ignore - Prisma types might be out of sync
                const knowledgeItem = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.create({
                    data: {
                        businessId,
                        content: chunk.content,
                        metadata: {
                            ...metadata,
                            source: metadata.source || "manual_ingestion",
                            sourceId,
                            chunkIndex: processedItems,
                            contentHash: chunk.hash,
                            tokenCount: estimateTokenCount(chunk.content),
                            title: typeof metadata.title === "string" && metadata.title.trim() ? metadata.title : typeof metadata.fileName === "string" ? metadata.fileName : "document",
                            fileType: metadata.fileType || metadata.type || "txt",
                            lang: typeof metadata.lang === "string" ? metadata.lang : detectLang(chunk.content),
                            ingestedAt: new Date().toISOString()
                        }
                    }
                });
                console.log(`[Ingestion] Actualizando embedding para item ID: ${knowledgeItem.id}`);
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`, vectorString, knowledgeItem.id);
                } catch (vectorError) {
                    console.warn(`[Ingestion] Warning: No se pudo guardar el vector para item ${knowledgeItem.id}. ¿pgvector instalado?`, vectorError.message);
                    // Intentamos fallback a JSON si la columna es JSON (por compatibilidad temporal)
                    try {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::jsonb WHERE id = $2`, vectorString, knowledgeItem.id);
                    } catch (jsonError) {
                    // Ignoramos si también falla
                    }
                }
                processedItems++;
            }
            console.log(`[Ingestion] Ingesta completada con éxito: ${processedItems} items.`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateAiCachesForBusiness"])(businessId);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateRagRetrieverCacheForBusiness"])(businessId);
            return processedItems;
        } catch (error) {
            console.error("[Ingestion] Error durante la ingesta:", error);
            throw error;
        }
    }
    async deleteAllKnowledge(businessId) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                businessId
            }
        });
    }
    async deleteKnowledgeItem(itemId, businessId) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                id: itemId,
                businessId
            }
        });
    }
    async deleteKnowledgeItems(itemIds, businessId) {
        if (itemIds.length === 0) {
            return {
                count: 0
            };
        }
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                businessId,
                id: {
                    in: itemIds
                }
            }
        });
    }
    async ingestStructuredKnowledge(businessId, item, metadata = {}) {
        console.log(`[Ingestion] Ingesting Structured Knowledge Chunk for business ${businessId} (Content size: ${item.content.length}, tags: ${item.tags.join(',')})`);
        try {
            // Generar embedding (que es obligatorio para vector store)
            const embedding = await this.embeddings.embedQuery(item.content);
            const vectorString = `[${embedding.join(",")}]`;
            // Guardar en DB con metadatos enriquecidos por el Agente
            const knowledgeItem = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.create({
                data: {
                    businessId,
                    content: item.content,
                    metadata: {
                        ...metadata,
                        tags: item.tags,
                        relevance: item.relevance,
                        isAgentGenerated: true,
                        source: metadata.source || "agent_ingestion"
                    }
                }
            });
            // Actualizar vector
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`, vectorString, knowledgeItem.id);
            return knowledgeItem;
        } catch (error) {
            console.error("[Ingestion] Error ingesting structured chunk:", error);
            throw error;
        }
    }
}
const ingestionService = new IngestionService();
}),
"[project]/lib/rag/queue.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enqueueKnowledgeIngestion",
    ()=>enqueueKnowledgeIngestion,
    "getKnowledgeJob",
    ()=>getKnowledgeJob,
    "getKnowledgeQueueSummary",
    ()=>getKnowledgeQueueSummary,
    "processKnowledgeQueueBatch",
    ()=>processKnowledgeQueueBatch,
    "processNextKnowledgeJob",
    ()=>processNextKnowledgeJob,
    "replayKnowledgeJobs",
    ()=>replayKnowledgeJobs
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/ingestion.ts [app-route] (ecmascript)");
;
;
;
const QUEUE_STATUS_ORDER = [
    "PENDING",
    "PROCESSING",
    "RETRY",
    "COMPLETED",
    "FAILED",
    "DLQ"
];
const ACTIVE_QUEUE_STATUSES = [
    "PENDING",
    "PROCESSING",
    "RETRY"
];
const RETRYABLE_ERROR_MATCHERS = [
    "ETIMEDOUT",
    "ECONNRESET",
    "ENOTFOUND",
    "429",
    "rate limit",
    "temporarily",
    "timeout"
];
function getKnowledgeJobModel() {
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
    if (!model) return null;
    if (typeof model.findFirst !== "function" || typeof model.create !== "function") {
        return null;
    }
    return model;
}
function sanitizeText(value) {
    // Remove invalid control chars that can break UTF-8 writes.
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}
function buildFingerprint({ businessId, text, metadata }) {
    const normalized = JSON.stringify({
        businessId,
        text: sanitizeText(text).trim(),
        metadata: metadata || {}
    });
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(normalized).digest("hex");
}
function isMissingQueueTable(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('relation "KnowledgeIngestionJob" does not exist');
}
function isRetryableError(error) {
    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
    return RETRYABLE_ERROR_MATCHERS.some((matcher)=>message.includes(matcher.toLowerCase()));
}
function computeNextRetryDate(attempt) {
    const baseMs = 5000;
    const maxMs = 5 * 60 * 1000;
    const expMs = Math.min(baseMs * Math.pow(2, Math.max(0, attempt - 1)), maxMs);
    const jitterMs = Math.floor(Math.random() * 1500);
    return new Date(Date.now() + expMs + jitterMs);
}
function getAgeBucket(createdAt, nowMs) {
    const ageMs = nowMs - createdAt.getTime();
    const ageMinutes = ageMs / 60000;
    if (ageMinutes < 5) return "lt5m";
    if (ageMinutes < 30) return "m5To30";
    if (ageMinutes < 120) return "m30To120";
    return "gte120m";
}
async function enqueueKnowledgeIngestion(payload) {
    const model = getKnowledgeJobModel();
    if (!model) {
        return {
            job: null,
            deduplicated: false,
            missingQueueTable: true
        };
    }
    const fingerprint = buildFingerprint(payload);
    try {
        const existing = await model.findFirst({
            where: {
                businessId: payload.businessId,
                fingerprint,
                status: {
                    in: [
                        "PENDING",
                        "PROCESSING",
                        "RETRY",
                        "COMPLETED"
                    ]
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        if (existing) {
            return {
                job: existing,
                deduplicated: true,
                missingQueueTable: false
            };
        }
        const job = await model.create({
            data: {
                businessId: payload.businessId,
                payload,
                fingerprint,
                status: "PENDING",
                attempts: 0,
                maxAttempts: 3,
                nextRunAt: new Date()
            }
        });
        return {
            job,
            deduplicated: false,
            missingQueueTable: false
        };
    } catch (error) {
        if (isMissingQueueTable(error)) {
            return {
                job: null,
                deduplicated: false,
                missingQueueTable: true
            };
        }
        throw error;
    }
}
async function getKnowledgeJob(jobId) {
    const model = getKnowledgeJobModel();
    if (!model || typeof model.findUnique !== "function") return null;
    return model.findUnique({
        where: {
            id: jobId
        }
    });
}
async function claimNextKnowledgeJob() {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`
    UPDATE "KnowledgeIngestionJob" j
    SET status = 'PROCESSING',
        "startedAt" = COALESCE(j."startedAt", NOW()),
        "updatedAt" = NOW()
    WHERE j.id = (
      SELECT id
      FROM "KnowledgeIngestionJob"
      WHERE status IN ('PENDING', 'RETRY')
        AND "nextRunAt" <= NOW()
      ORDER BY "nextRunAt" ASC, "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING j.id, j."businessId", j.attempts, j."maxAttempts", j.payload
    `);
    if (!rows?.length) return null;
    return rows[0];
}
async function processNextKnowledgeJob() {
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
    const job = await claimNextKnowledgeJob();
    if (!job) {
        return {
            processed: false
        };
    }
    try {
        const payload = job.payload || {
            businessId: job.businessId,
            text: "",
            metadata: {}
        };
        const text = sanitizeText(payload.text || "");
        if (!text.trim()) {
            throw new Error("EMPTY_TEXT_PAYLOAD");
        }
        const chunkCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].ingestText(job.businessId, text, payload.metadata || {});
        await model.update({
            where: {
                id: job.id
            },
            data: {
                status: "COMPLETED",
                chunkCount,
                finishedAt: new Date(),
                lastError: null
            }
        });
        return {
            processed: true,
            jobId: job.id,
            status: "COMPLETED",
            chunkCount
        };
    } catch (error) {
        const attempt = job.attempts + 1;
        const canRetry = attempt < job.maxAttempts && isRetryableError(error);
        const nextStatus = canRetry ? "RETRY" : "DLQ";
        await model.update({
            where: {
                id: job.id
            },
            data: {
                attempts: attempt,
                status: nextStatus,
                lastError: error instanceof Error ? error.message : String(error),
                nextRunAt: canRetry ? computeNextRetryDate(attempt) : new Date(),
                finishedAt: canRetry ? null : new Date()
            }
        });
        return {
            processed: true,
            jobId: job.id,
            status: nextStatus,
            error: error instanceof Error ? error.message : String(error),
            attempt
        };
    }
}
async function processKnowledgeQueueBatch(limit = 3) {
    const results = [];
    for(let i = 0; i < limit; i++){
        const result = await processNextKnowledgeJob();
        if (!result.processed) break;
        results.push(result);
    }
    return results;
}
async function getKnowledgeQueueSummary(params) {
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
    const where = params?.businessId ? {
        businessId: params.businessId
    } : {};
    try {
        const grouped = await model.groupBy({
            by: [
                "status"
            ],
            where,
            _count: {
                _all: true
            }
        });
        const countMap = new Map();
        for (const row of grouped){
            countMap.set(row.status, row._count._all || 0);
        }
        const byStatus = QUEUE_STATUS_ORDER.map((status)=>({
                status,
                count: countMap.get(status) || 0
            }));
        const activeJobs = await model.findMany({
            where: {
                ...where,
                status: {
                    in: [
                        ...ACTIVE_QUEUE_STATUSES
                    ]
                }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: "asc"
            },
            take: 2000
        });
        const nowMs = Date.now();
        const ageBuckets = {
            lt5m: 0,
            m5To30: 0,
            m30To120: 0,
            gte120m: 0
        };
        for (const job of activeJobs){
            const bucket = getAgeBucket(job.createdAt, nowMs);
            ageBuckets[bucket] += 1;
        }
        const totalsAll = byStatus.reduce((sum, row)=>sum + row.count, 0);
        const totalsActive = ACTIVE_QUEUE_STATUSES.reduce((sum, status)=>sum + (countMap.get(status) || 0), 0);
        return {
            businessId: params?.businessId,
            totals: {
                all: totalsAll,
                active: totalsActive,
                completed: countMap.get("COMPLETED") || 0,
                failed: countMap.get("FAILED") || 0,
                dlq: countMap.get("DLQ") || 0
            },
            byStatus,
            ageBuckets,
            oldestActiveCreatedAt: activeJobs[0]?.createdAt?.toISOString() || null,
            missingQueueTable: false
        };
    } catch (error) {
        if (isMissingQueueTable(error)) {
            return {
                businessId: params?.businessId,
                totals: {
                    all: 0,
                    active: 0,
                    completed: 0,
                    failed: 0,
                    dlq: 0
                },
                byStatus: QUEUE_STATUS_ORDER.map((status)=>({
                        status,
                        count: 0
                    })),
                ageBuckets: {
                    lt5m: 0,
                    m5To30: 0,
                    m30To120: 0,
                    gte120m: 0
                },
                oldestActiveCreatedAt: null,
                missingQueueTable: true
            };
        }
        throw error;
    }
}
async function replayKnowledgeJobs(params) {
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
    const limit = Math.max(1, Math.min(200, params?.limit ?? 50));
    const candidates = await model.findMany({
        where: {
            ...params?.businessId ? {
                businessId: params.businessId
            } : {},
            ...params?.jobId ? {
                id: params.jobId
            } : {},
            status: {
                in: [
                    "DLQ",
                    "FAILED"
                ]
            }
        },
        orderBy: {
            createdAt: "asc"
        },
        take: limit,
        select: {
            id: true
        }
    });
    if (!candidates.length) {
        return {
            count: 0,
            ids: []
        };
    }
    const ids = candidates.map((job)=>job.id);
    const updated = await model.updateMany({
        where: {
            id: {
                in: ids
            }
        },
        data: {
            status: "RETRY",
            nextRunAt: new Date(),
            finishedAt: null
        }
    });
    return {
        count: updated.count,
        ids
    };
}
}),
"[project]/app/api/knowledge/jobs/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/next/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/queue.ts [app-route] (ecmascript)");
;
;
;
;
;
async function GET(_req, { params }) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const { id } = await params;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing id"
            }, {
                status: 400
            });
        }
        const job = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKnowledgeJob"])(id);
        if (!job) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Job not found"
            }, {
                status: 404
            });
        }
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: job.businessId,
                user: {
                    email: session.user.email
                }
            },
            select: {
                id: true
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forbidden"
            }, {
                status: 403
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                id: job.id,
                status: job.status,
                attempts: job.attempts,
                maxAttempts: job.maxAttempts,
                chunkCount: job.chunkCount ?? 0,
                lastError: job.lastError || null,
                createdAt: job.createdAt,
                startedAt: job.startedAt,
                finishedAt: job.finishedAt
            }
        });
    } catch (error) {
        console.error("[API Knowledge Job] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__40a0bfee._.js.map