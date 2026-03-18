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
"[project]/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiService",
    ()=>aiService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
console.log("[AIService] Module Loading...");
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY || ''
});
const aiService = {
    async generateResponse (businessId, messages) {
        try {
            console.log(`[AIService] Starting generation for businessId: ${businessId}`);
            // 1. Obtener la configuración del negocio
            const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
                where: {
                    id: businessId
                }
            });
            if (!business) {
                console.error(`[AIService] Business NOT FOUND in DB for ID: ${businessId}`);
                throw new Error("Negocio no encontrado en la base de datos");
            }
            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles = [];
            try {
                const lastUserMessage = messages.filter((m)=>m.role === 'user').pop()?.content || "";
                if (lastUserMessage && process.env.OPENAI_API_KEY) {
                    const embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
                        openAIApiKey: process.env.OPENAI_API_KEY,
                        modelName: "text-embedding-3-small"
                    });
                    const queryVector = await embeddings.embedQuery(lastUserMessage);
                    const vectorStr = `[${queryVector.join(",")}]`;
                    // Búsqueda vectorial
                    const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
                        SELECT content, metadata
                        FROM "KnowledgeItem"
                        WHERE "businessId" = ${businessId}
                        ORDER BY embedding <-> ${vectorStr}::vector
                        LIMIT 3;
                    `;
                    if (items && items.length > 0) {
                        ragContext = items.map((item)=>{
                            const meta = item.metadata || {};
                            let text = item.content;
                            if (meta.fileUrl) {
                                availableFiles.push({
                                    url: meta.fileUrl,
                                    description: `Documento: ${meta.source || item.name || 'Archivo adjunto'}`
                                });
                                text += `\n[ESTE FRAGMENTO CONTIENE UN ARCHIVO: ${meta.fileUrl}]`;
                            }
                            return text;
                        }).join("\n\n");
                        console.log(`[AIService] RAG Context retrieved: ${items.length} items`);
                    }
                }
            } catch (ragError) {
                console.error("[AIService] Error en RAG retrieval:", ragError);
            }
            const config = business.config;
            let systemPrompt = config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;
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
            // 2. Determinar proveedor - Preferimos OpenAI si está disponible debido a restricciones regionales de Gemini
            const provider = config?.aiProvider || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
            console.log(`[AIService] Business: ${business.name}, Provider Initial Choice: ${provider}`);
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
            if (provider === 'openai') {
                return await callOpenAI();
            } else if (provider === 'github') {
                return await callGitHub();
            } else {
                try {
                    return await callGemini();
                } catch (geminiErr) {
                    console.error("[AIService] Gemini failed, checking for OpenAI fallback...", geminiErr.message || geminiErr);
                    if (process.env.OPENAI_API_KEY) {
                        console.log("[AIService] FALLBACK TO OPENAI TRIGGERED");
                        return await callOpenAI();
                    }
                    throw geminiErr;
                }
            }
        } catch (error) {
            console.error("[AIService] FINAL CRITICAL ERROR:", error.message || error);
            return "Lo siento, tuve un problema técnico al procesar tu mensaje. ¿Podrías repetirlo?";
        }
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b21c3cf5._.js.map