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
    config: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$langgraph$2f$dist$2f$graph$2f$annotation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Annotation"])()
});
}),
"[project]/lib/tools/knowledge-tool.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createKnowledgeTool",
    ()=>createKnowledgeTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/tools/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
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
                const embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
                    modelName: "text-embedding-3-small"
                });
                // 1. Generar embedding para la consulta
                const queryEmbedding = await embeddings.embedQuery(query);
                const vectorString = `[${queryEmbedding.join(",")}]`;
                // 2. Búsqueda semántica en JS vanilla (Fallback sin PGVector)
                console.log("[KnowledgeTool] Fetching all items for JS cosine similarity...");
                const allItems = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
                    where: {
                        businessId: businessId
                    },
                    select: {
                        content: true,
                        metadata: true,
                        embedding: true
                    }
                });
                if (!allItems || allItems.length === 0) {
                    return "No hay información en la base de conocimientos.";
                }
                // Función simple de similitud coseno
                const cosineSimilarity = (a, b)=>{
                    const dotProduct = a.reduce((sum, val, i)=>sum + val * b[i], 0);
                    const magnitudeA = Math.sqrt(a.reduce((sum, val)=>sum + val * val, 0));
                    const magnitudeB = Math.sqrt(b.reduce((sum, val)=>sum + val * val, 0));
                    return dotProduct / (magnitudeA * magnitudeB);
                };
                const results = allItems.map((item)=>{
                    const embedding = item.embedding;
                    if (!embedding || !Array.isArray(embedding)) return {
                        ...item,
                        similarity: 0
                    };
                    return {
                        ...item,
                        similarity: cosineSimilarity(queryEmbedding, embedding)
                    };
                }).sort((a, b)=>b.similarity - a.similarity).slice(0, 4);
                if (!results || results.length === 0) {
                    return "No se encontró información relevante en la base de conocimientos. Por favor, intenta ser más específico o informa al usuario que no tienes ese dato exacto.";
                }
                // 3. Formatear resultados para el agente
                const context = results.filter((r)=>r.similarity > 0.3) // Filtro de calidad mínimo
                .map((r)=>`- ${r.content}`).join("\n\n");
                return context || "La búsqueda no devolvió resultados lo suficientemente similares.";
            } catch (error) {
                console.error("[KnowledgeTool] Error:", error);
                return "Hubo un error al acceder a la base de conocimientos.";
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/messages/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/messages/system.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
const createAgentGraph = (businessId, businessName, config)=>{
    // 1. Definir herramientas habilitadas para este agente
    const tools = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2f$knowledge$2d$tool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createKnowledgeTool"])(businessId)
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
        const systemPrompt = config?.systemPrompt || `Eres un asistente experto para ${businessName}. Sé amable y conciso. 
       Utiliza tus herramientas si necesitas datos específicos sobre productos o políticas.`;
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
"[project]/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiService",
    ()=>aiService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
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
            const config = business.config;
            // 2. Usar el Agente de LangGraph
            console.log("[AIService] Initializing Agent Graph...");
            const { createAgentGraph } = __turbopack_context__.r("[project]/lib/agent/graph.ts [app-route] (ecmascript)"); // Import dinámico para evitar ciclos si los hubiera
            // Convertir mensajes al formato de LangChain si es necesario
            // La gráfica espera { messages: [...] }
            // Los mensajes de entrada son { role, content }
            // LangGraph/LangChain maneja esto, pero asegurémonos de mapear 'user'/'assistant'
            const agent = createAgentGraph(business.id, business.name, config);
            const inputs = {
                messages: messages.map((m)=>({
                        role: m.role,
                        content: m.content
                    })),
                businessId: business.id,
                businessName: business.name,
                config: config
            };
            const configGraph = {
                configurable: {
                    thread_id: `thread-${Date.now()}`
                }
            };
            console.log("[AIService] Invoking Agent...");
            const result = await agent.invoke(inputs, configGraph);
            // Extraer la última respuesta del asistente
            const lastMessage = result.messages[result.messages.length - 1];
            console.log("[AIService] Agent finished. Response length:", lastMessage.content.length);
            return lastMessage.content;
        } catch (error) {
            console.error("[AIService] Error generating response:", error);
            return "Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?";
        }
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e4fa9fbd._.js.map