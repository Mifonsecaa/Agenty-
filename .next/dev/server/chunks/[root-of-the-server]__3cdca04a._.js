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
;
;
;
class IngestionService {
    splitter;
    embeddings;
    constructor(){
        this.splitter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$text_splitter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RecursiveCharacterTextSplitter"]({
            chunkSize: 600,
            chunkOverlap: 100
        });
        this.embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
            modelName: "text-embedding-3-small"
        });
    }
    async ingestText(businessId, text, metadata = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        console.log(`[Ingestion] Tamaño del texto: ${text.length} caracteres`);
        try {
            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([
                text
            ]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);
            // 2. Procesar cada fragmento
            let processedItems = 0;
            for (const doc of docs){
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${docs.length}...`);
                const embedding = await this.embeddings.embedQuery(doc.pageContent);
                const vectorString = `[${embedding.join(",")}]`;
                // 3. Guardar en la DB con el vector
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                // @ts-ignore - Prisma types might be out of sync
                const knowledgeItem = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.create({
                    data: {
                        businessId,
                        content: doc.pageContent,
                        metadata: {
                            ...metadata,
                            source: metadata.source || "manual_ingestion"
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
            console.log(`[Ingestion] Ingesta completada con éxito: ${docs.length} items.`);
            return docs.length;
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
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
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
    const model = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeIngestionJob;
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
"[project]/lib/validation/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatSchema",
    ()=>chatSchema,
    "createBusinessSchema",
    ()=>createBusinessSchema,
    "generatePromptSchema",
    ()=>generatePromptSchema,
    "improveDescriptionSchema",
    ()=>improveDescriptionSchema,
    "knowledgeCreateSchema",
    ()=>knowledgeCreateSchema,
    "knowledgeQuerySchema",
    ()=>knowledgeQuerySchema,
    "loginSchema",
    ()=>loginSchema,
    "metricsQuerySchema",
    ()=>metricsQuerySchema,
    "onboardingSchema",
    ()=>onboardingSchema,
    "registerSchema",
    ()=>registerSchema,
    "telegramWebhookSchema",
    ()=>telegramWebhookSchema,
    "updateBusinessSchema",
    ()=>updateBusinessSchema,
    "whatsappConnectSchema",
    ()=>whatsappConnectSchema,
    "whatsappWebhookSchema",
    ()=>whatsappWebhookSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const registerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Email inválido"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "El nombre debe tener al menos 2 caracteres")
});
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Email inválido"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "La contraseña es requerida")
});
const createBusinessSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre del negocio es requerido"),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    config: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const updateBusinessSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre del negocio es requerido").optional(),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    config: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
});
const onboardingSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ownerDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, "La descripción debe tener al menos 10 caracteres")
});
const knowledgeQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido")
});
const knowledgeCreateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El contenido es requerido").optional(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre es requerido").optional(),
    url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url("La URL no es válida").optional(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
}).refine((data)=>{
    if (data.url) return true;
    return Boolean(data.text && data.name);
}, {
    message: "Debes enviar URL o contenido con nombre",
    path: [
        "text"
    ]
});
const chatSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El mensaje es requerido"),
    conversationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const improveDescriptionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(5, "El texto debe tener al menos 5 caracteres")
});
const generatePromptSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, "La descripción debe tener al menos 10 caracteres"),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const metricsQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const telegramWebhookSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    update_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        message_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        from: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            first_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
        }),
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }).optional()
});
const whatsappWebhookSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    messaging_product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    entry: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        changes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
                messaging_product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
                messages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
            })
        }))
    }))
});
const whatsappConnectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    phoneNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido"),
    accessToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El accessToken es requerido")
});
}),
"[project]/lib/validation/validate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "serverErrorResponse",
    ()=>serverErrorResponse,
    "successResponse",
    ()=>successResponse,
    "validateData",
    ()=>validateData,
    "validationErrorResponse",
    ()=>validationErrorResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/ZodError.js [app-route] (ecmascript)");
;
;
function validateData(data, schema) {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData
        };
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"]) {
            const errors = error.issues.map((err)=>({
                    field: err.path.join(".") || "root",
                    message: err.message
                }));
            return {
                success: false,
                errors
            };
        }
        return {
            success: false,
            errors: [
                {
                    field: "root",
                    message: "Error de validación desconocido"
                }
            ]
        };
    }
}
function validationErrorResponse(errors) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: "Datos inválidos",
        details: errors
    }, {
        status: 400
    });
}
function serverErrorResponse(message = "Error interno del servidor") {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: message
    }, {
        status: 500
    });
}
function successResponse(data, status = 200) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data
    }, {
        status
    });
}
}),
"[project]/app/api/knowledge/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/next/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/ingestion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/queue.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation/schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation/validate.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const ENABLE_INLINE_QUEUE_KICKOFF = process.env.KNOWLEDGE_INLINE_KICKOFF !== "false";
function stripHtmlToText(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
async function POST(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const body = await req.json();
        const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateData"])(body, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knowledgeCreateSchema"]);
        if (!validation.success) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validationErrorResponse"])(validation.errors);
        }
        let { businessId, text, name, type, url } = validation.data;
        if (url && !text) {
            try {
                const response = await fetch(url, {
                    method: "GET"
                });
                if (!response.ok) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "No se pudo leer la URL"
                    }, {
                        status: 422
                    });
                }
                const html = await response.text();
                text = stripHtmlToText(html);
                name = name || new URL(url).hostname;
                type = type || "text/html";
            } catch (urlError) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "No se pudo extraer contenido de la URL"
                }, {
                    status: 422
                });
            }
        }
        if (type === "application/pdf") {
            try {
                if (!text) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "El PDF no contiene datos para procesar"
                    }, {
                        status: 400
                    });
                }
                console.log("[API Knowledge] Cargando pdf-parse...");
                const pdf = __turbopack_context__.r("[externals]/pdf-parse [external] (pdf-parse, cjs, [project]/node_modules/pdf-parse)");
                const buffer = Buffer.from(text, "base64");
                console.log(`[API Knowledge] Buffer creado, tamaño: ${buffer.length}`);
                const data = await pdf(buffer);
                // Ensure text exists and remove control characters (0x00-0x1F except \n \r \t)
                const parsedText = (data.text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
                text = parsedText;
                console.log(`[API Knowledge] PDF procesado: ${name} (${parsedText.length} caracteres)`);
            } catch (pdfError) {
                console.error("[API Knowledge] Error parseando PDF:", pdfError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to parse PDF",
                    details: pdfError.message || String(pdfError),
                    stack: pdfError.stack
                }, {
                    status: 422
                });
            }
        }
        // Verificar que el negocio pertenece al usuario
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: businessId,
                user: {
                    email: session.user.email
                }
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Business not found or unauthorized"
            }, {
                status: 404
            });
        }
        const safeText = (text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
        if (!safeText.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No hay texto válido para procesar"
            }, {
                status: 400
            });
        }
        const enqueue = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueKnowledgeIngestion"])({
            businessId,
            text: safeText,
            metadata: {
                fileName: name || "document",
                fileType: type || "txt",
                source: url ? "website" : "manual_ingestion",
                url: url || null
            }
        });
        if (enqueue.missingQueueTable) {
            // Fallback temporal para no romper el flujo si la migración aún no está aplicada.
            const chunkCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].ingestText(businessId, safeText, {
                fileName: name || "document",
                fileType: type || "txt"
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Documento procesado en ${chunkCount} fragmentos (modo compatibilidad).`,
                chunkCount,
                mode: "sync_fallback"
            });
        }
        // Kickoff best-effort para procesar rápido en entornos sin worker dedicado.
        if (ENABLE_INLINE_QUEUE_KICKOFF) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processKnowledgeQueueBatch"])(1).catch((queueError)=>{
                console.error("[API Knowledge] Queue kickoff error:", queueError);
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            queued: true,
            deduplicated: enqueue.deduplicated,
            jobId: enqueue.job.id,
            status: enqueue.job.status,
            message: enqueue.deduplicated ? "Este documento ya está en proceso o fue procesado recientemente." : "Documento encolado para ingesta asíncrona."
        }, {
            status: 202
        });
    } catch (error) {
        console.error("[API Knowledge] Error fatal:", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverErrorResponse"])("Error al procesar el conocimiento");
    }
}
async function GET(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(req.url);
        const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateData"])({
            businessId: searchParams.get("businessId")
        }, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knowledgeQuerySchema"]);
        if (!validation.success) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validationErrorResponse"])(validation.errors);
        }
        const { businessId } = validation.data;
        // Verificar que el negocio pertenece al usuario
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: businessId,
                user: {
                    email: session.user.email
                }
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Business not found or unauthorized"
            }, {
                status: 404
            });
        }
        const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
            where: {
                businessId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                content: true,
                metadata: true,
                createdAt: true
            },
            take: 50
        });
        const normalizedItems = items.map((item)=>{
            const metadata = item.metadata;
            const safeMetadata = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : undefined;
            return {
                id: item.id,
                content: item.content,
                metadata: {
                    fileName: typeof safeMetadata?.fileName === "string" ? safeMetadata.fileName : undefined
                },
                createdAt: item.createdAt.toISOString()
            };
        });
        const payload = {
            items: normalizedItems
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["successResponse"])(payload);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Error"
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const body = await req.json();
        const { businessId, itemId, itemIds } = body;
        if (!businessId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing businessId"
            }, {
                status: 400
            });
        }
        // Verificar propiedad del negocio
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: businessId,
                user: {
                    email: session.user.email
                }
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Business not found or unauthorized"
            }, {
                status: 404
            });
        }
        if (Array.isArray(itemIds) && itemIds.length > 0) {
            const cleanItemIds = itemIds.filter((id)=>typeof id === "string" && id.trim().length > 0);
            if (cleanItemIds.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "itemIds inválido"
                }, {
                    status: 400
                });
            }
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].deleteKnowledgeItems(cleanItemIds, businessId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `${result.count} elemento(s) eliminado(s).`,
                deletedCount: result.count
            });
        }
        if (itemId) {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].deleteKnowledgeItem(itemId, businessId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: "Elemento eliminado.",
                deletedCount: result.count
            });
        } else {
            // Peligroso: Si no se envía itemId, borra todo.
            // Para seguridad, requerimos confirmación explícita o solo permitimos si es intencional.
            // Asumiremos que si no hay itemId, es un "Limpiar todo".
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].deleteAllKnowledge(businessId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: "Base de conocimiento vaciada."
            });
        }
    } catch (error) {
        console.error("Delete Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3cdca04a._.js.map