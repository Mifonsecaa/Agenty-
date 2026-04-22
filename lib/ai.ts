import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createHash } from "crypto";
import { prisma } from './prisma';
import { retrieveRagContext } from '@/lib/rag/retriever';
import { analyzeMenuConsistency } from '@/lib/rag/menu-precision';
import { buildCanonicalMenuText, extractMenuEntries, hasMenuLikeSignals } from '@/lib/rag/menu-precision';
import { classifyQueryLayer } from '@/lib/rag/layers';
import { z } from "zod";

console.log("[AIService] Module Loading...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Arquitectura multi-agente: modelos especializados por rol.
export const supervisorModel = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
});

export const brainModel = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
});

export const workerModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
});

export const ragModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY,
});

export const toolModel = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
});

export const ExcelWorkOrderSchema = z.object({
  actionType: z.enum(["APPEND_ROW", "UPDATE_CELL", "CREATE_FILE", "NONE"])
    .describe("El tipo de acción a realizar en el Excel."),
  targetFileName: z.string()
    .describe("Nombre del archivo Excel objetivo (ej. 'reservas.xlsx'). Si no existe en availableFiles y se necesita, usa CREATE_FILE."),
  extractedData: z.record(z.any()).optional()
    .describe("Los datos estructurados a guardar (ej. {'Nombre': 'Juan', 'Hora': '20:00'})."),
  responseToUser: z.string()
    .describe("El mensaje final que se le mostrará al usuario confirmando la acción o pidiendo datos faltantes.")
});

export const jsonExtractorModel = brainModel.withStructuredOutput(ExcelWorkOrderSchema);

export const ConversationStateSchema = z.object({
    status: z.enum(["INIT", "ASK_TIME", "ASK_PEOPLE", "ASK_NAME", "CONFIRMED", "DONE", ""]).describe("El estado actual de la conversación/extracción de datos."),
    collectedData: z.record(z.any()).describe("Los datos recolectados hasta el momento (ej: hora, persona, etc)"),
    missingData: z.array(z.string()).describe("Los datos que aún faltan por recolectar"),
    nextQuestionToUser: z.string().describe("Si faltan datos, formula la pregunta directa al usuario. Si no falta nada y se puede confirmar, confirmarlo amablemente sin saludar.")
});

export const stateExtractorModel = brainModel.withStructuredOutput(ConversationStateSchema);

export const ReservationExtractionSchema = z.object({
    time: z.coerce.string().nullable().default(null).describe("Hora de la reserva si fue mencionada, ej: 20:00, 8pm."),
    people: z.coerce.string().nullable().default(null).describe("Cantidad de personas si fue mencionada."),
    name: z.coerce.string().nullable().default(null).describe("Nombre del cliente si fue mencionado."),
    date: z.coerce.string().nullable().default(null).describe("Fecha si fue mencionada, ej: mañana, 2026-04-16."),
    isAffirmative: z.coerce.boolean().default(false).describe("true solo si el mensaje es una confirmación corta tipo si/ok/dale."),
});

export const reservationExtractorModel = workerModel.withStructuredOutput(ReservationExtractionSchema);

export const ToolExecutionPlanSchema = z.object({
    actionType: z.enum(["APPEND_ROW", "UPDATE_CELL", "CREATE_FILE", "NONE"]),
    targetFileName: z.string().default(""),
    extractedData: z.record(z.any()).default({}),
    responseToUser: z.string().default(""),
});

export const toolExecutionPlanModel = workerModel.withStructuredOutput(ToolExecutionPlanSchema);

export const SpreadsheetExecutorRequestSchema = z.object({
    action: z.enum(["LIST", "LIST_SHEETS", "READ_CELL", "UPDATE_CELL", "APPEND_ROW", "CREATE_FILE", "NONE"]),
    targetFileName: z.coerce.string().optional(),
    sourceId: z.coerce.string().optional(),
    fileRef: z.coerce.string().optional(),
    sheet: z.coerce.string().optional(),
    cell: z.coerce.string().optional(),
    value: z.coerce.string().optional(),
    rowValues: z.array(z.coerce.string()).optional(),
    data: z.record(z.any()).optional(),
    responseToUser: z.coerce.string().optional(),
}).superRefine((payload, ctx) => {
    const needsTarget = payload.action !== "NONE" && payload.action !== "LIST";
    const hasTarget = Boolean(payload.targetFileName || payload.sourceId || payload.fileRef);

    if (needsTarget && !hasTarget) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fileRef"],
            message: "MISSING_FILE_REF",
        });
    }

    if (["LIST_SHEETS", "READ_CELL", "UPDATE_CELL", "APPEND_ROW"].includes(payload.action) && !payload.sheet) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sheet"],
            message: "MISSING_SHEET",
        });
    }

    if (payload.action === "READ_CELL" && !payload.cell) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cell"],
            message: "MISSING_CELL",
        });
    }

    if (payload.action === "UPDATE_CELL") {
        if (!payload.cell) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["cell"],
                message: "MISSING_CELL",
            });
        }
        if (typeof payload.value !== "string" || !payload.value.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["value"],
                message: "MISSING_VALUE",
            });
        }
    }

    if (payload.action === "APPEND_ROW") {
        const rowValues = Array.isArray(payload.rowValues) ? payload.rowValues : [];
        const hasRowValues = rowValues.some((v) => String(v || "").trim().length > 0);
        if (!hasRowValues) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["rowValues"],
                message: "MISSING_ROW_VALUES",
            });
        }
    }

    if (payload.action === "CREATE_FILE" && !payload.targetFileName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["targetFileName"],
            message: "MISSING_TARGET_FILE_NAME",
        });
    }
});

export const spreadsheetExecutorRequestModel = workerModel.withStructuredOutput(SpreadsheetExecutorRequestSchema);

export const SpreadsheetToolDecisionSchema = z.object({
    shouldInvokeTool: z.coerce.boolean().default(false),
    reason: z.coerce.string().default(""),
});

export const spreadsheetToolDecisionModel = workerModel.withStructuredOutput(SpreadsheetToolDecisionSchema);

export function createRequiredToolAgent(tools: any[]) {
    return (toolModel as any).bindTools(tools, { tool_choice: "required" });
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GenerateOptions {
    provider?: 'openai' | 'github' | 'gemini';
    systemPrompt?: string;
    businessSnapshot?: {
        id: string;
        name: string;
        config: unknown;
    };
}

type CacheEntry<T> = {
    value: T;
    expiresAt: number;
    lastAccessAt: number;
};

const RESPONSE_CACHE_TTL_MS = Number(process.env.AI_RESPONSE_CACHE_TTL_MS || 45000);
const RESPONSE_CACHE_MAX_ENTRIES = Number(process.env.AI_RESPONSE_CACHE_MAX_ENTRIES || 300);
const AI_MAX_HISTORY_MESSAGES = Number(process.env.AI_MAX_HISTORY_MESSAGES || 5);
const RAG_STRICT_MIN_CONFIDENCE = Number(process.env.RAG_STRICT_MIN_CONFIDENCE || 0.62);

const responseCache = new Map<string, CacheEntry<string>>();
const responseKeysByBusiness = new Map<string, Set<string>>();
const businessCache = new Map<string, CacheEntry<{ id: string; name: string; config: unknown }>>();
const BUSINESS_CACHE_TTL_MS = Number(process.env.AI_BUSINESS_CACHE_TTL_MS || 45000);

function nowMs() {
    return Date.now();
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
    const entriesByLastAccess = Array.from(cache.entries()).sort((a, b) => a[1].lastAccessAt - b[1].lastAccessAt);
    const toDelete = cache.size - maxEntries;
    for (let i = 0; i < toDelete; i++) {
        const key = entriesByLastAccess[i]?.[0];
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

function setCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number, maxEntries: number) {
    const now = nowMs();
    cache.set(key, {
        value,
        expiresAt: now + ttlMs,
        lastAccessAt: now,
    });
    pruneExpired(cache);
    enforceMaxEntries(cache, maxEntries);
}

function registerCacheKey(index: Map<string, Set<string>>, businessId: string, key: string) {
    if (!businessId) return;
    const set = index.get(businessId) || new Set<string>();
    set.add(key);
    index.set(businessId, set);
}

async function getBusinessSnapshot(businessId: string) {
    const cached = getCacheValue(businessCache, businessId);
    if (cached) {
        return cached;
    }

    const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true, name: true, config: true },
    });

    if (!business) {
        return null;
    }

    setCacheValue(businessCache, businessId, business, BUSINESS_CACHE_TTL_MS, 500);
    return business;
}

function clearCacheByBusiness(cache: Map<string, CacheEntry<any>>, index: Map<string, Set<string>>, businessId: string) {
    const keys = index.get(businessId);
    if (!keys) return;
    for (const key of keys.values()) {
        cache.delete(key);
    }
    index.delete(businessId);
}

function buildCacheKey(parts: unknown[]) {
    return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

function compactMessagesForKey(messages: ChatMessage[]) {
    return messages.slice(-Math.max(4, Math.min(12, AI_MAX_HISTORY_MESSAGES))).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 300),
    }));
}

function trimChatMessages(messages: ChatMessage[]) {
    const maxMessages = Math.max(4, Math.min(12, AI_MAX_HISTORY_MESSAGES));
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
}

async function loadBusinessKnowledgeFiles(businessId: string) {
    const rows = await prisma.knowledgeItem.findMany({
        where: { businessId },
        select: { metadata: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 120,
    });

    const seen = new Set<string>();
    const files: Array<{ url: string; description: string }> = [];

    for (const row of rows) {
        const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
            ? row.metadata as Record<string, unknown>
            : {};

        const fileUrl = typeof metadata.fileUrl === "string" ? metadata.fileUrl : "";
        if (!fileUrl || seen.has(fileUrl)) continue;
        seen.add(fileUrl);

        const fileName = typeof metadata.fileName === "string" ? metadata.fileName : "Archivo adjunto";
        const fileType = typeof metadata.fileType === "string" ? metadata.fileType : "archivo";
        files.push({ url: fileUrl, description: `${fileName} (${fileType})` });

        if (files.length >= 12) break;
    }

    return files;
}

function hasPriceSignals(text: string) {
    return /([$€£]\s?\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s?(usd|eur|mxn|cop|s\/))/i.test(text || "");
}

function mediaQueryTerms(query: string) {
    return String(query || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 3)
        .slice(0, 12);
}

function scoreMediaForQuery(file: { url: string; description: string }, query: string) {
    const haystack = `${file.description} ${file.url}`.toLowerCase();
    const terms = mediaQueryTerms(query);
    if (!terms.length) return 0;
    let score = 0;
    for (const term of terms) {
        if (haystack.includes(term)) score += 1;
    }
    return score;
}

function selectMediaByQuery(params: {
    files: Array<{ url: string; description: string }>;
    query: string;
    asksForEverything: boolean;
    asksImage: boolean;
}) {
    const ranked = [...params.files]
        .map((file) => {
            const score = scoreMediaForQuery(file, params.query);
            const imageBoost = params.asksImage && /(image|png|jpg|jpeg|webp|gif|imagen|foto)/i.test(file.description)
                ? 1
                : 0;
            return { file, score: score + imageBoost };
        })
        .sort((a, b) => b.score - a.score);

    const filtered = ranked.filter((item) => item.score > 0).map((item) => item.file);
    if (!filtered.length) return [] as Array<{ url: string; description: string }>;

    return params.asksForEverything ? filtered.slice(0, 5) : filtered.slice(0, 1);
}

async function loadMenuFallbackContext(businessId: string) {
    const rows = await prisma.knowledgeItem.findMany({
        where: { businessId },
        select: { content: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 240,
    });

    const candidates = rows
        .map((row) => String(row.content || ""))
        .filter((content) => hasMenuLikeSignals(content))
        .slice(0, 100);

    if (!candidates.length) return "";

    const merged = candidates.join("\n\n");
    const entries = extractMenuEntries(merged);
    if (entries.length < 3) return "";

    return buildCanonicalMenuText(entries);
}

export const aiService = {
    async generateResponse(businessId: string, messages: ChatMessage[], options: GenerateOptions = {}) {
        try {
            console.log(`[AIService] Starting generation for businessId: ${businessId}`);

            // 1. Obtener la configuración del negocio
            const business = options.businessSnapshot || await getBusinessSnapshot(businessId);

            if (!business) {
                console.error(`[AIService] Business NOT FOUND in DB for ID: ${businessId}`);
                throw new Error("Negocio no encontrado en la base de datos");
            }

            const config = business.config as any;

            // Revisar respuestas personalizadas antes de llamar a la IA
            const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
            if (config.customResponses && Array.isArray(config.customResponses)) {
                for (const custom of config.customResponses) {
                    if (custom.trigger && custom.response && lastUserMessage.toLowerCase().includes(custom.trigger.toLowerCase())) {
                        console.log(`[AIService] Match found for custom response: ${custom.trigger}`);
                        return custom.response;
                    }
                }
            }

            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles: { url: string, description: string }[] = [];
            let ragTopScore = 0;
            let retrievalLayer = classifyQueryLayer(lastUserMessage);

            const asksForDocument = /(menu|men[uú]|cat[aá]logo|carta|pdf|archivo|documento|imagen|foto|lista\s+de\s+precios|precios\s+completos|menu\s+completo|base\s+de\s+conocimiento|conocimiento|compartir|muestrame|mu[eé]strame)/i.test(lastUserMessage);
            const asksForEverything = /(todo|toda|todos|todas|completo|completa|cualquier\s+cosa|todo\s+lo\s+que\s+tengas|todo\s+el\s+menu|men[uú]\s+completo)/i.test(lastUserMessage);
            const asksMenuOrPrice = /(menu|men[uú]|carta|precio|precios|lista\s+de\s+precios|catalogo|cat[aá]logo)/i.test(lastUserMessage);

            try {
                if (lastUserMessage) {
                    const retrieval = await retrieveRagContext({
                        businessId,
                        query: lastUserMessage,
                        retrievalLayer,
                    });
                    ragContext = retrieval.ragContext;
                    availableFiles = retrieval.availableFiles;
                    ragTopScore = retrieval.selected?.[0]?.combinedScore || 0;
                    console.log(`[AIService] RAG retrieval selected ${retrieval.selected.length} chunks`);
                }

                // Garantiza acceso a adjuntos aunque no hayan quedado en top-k del retriever.
                const allKnowledgeFiles = await loadBusinessKnowledgeFiles(businessId);
                if (allKnowledgeFiles.length > 0) {
                    const seenUrls = new Set(availableFiles.map((f) => f.url));
                    for (const file of allKnowledgeFiles) {
                        if (seenUrls.has(file.url)) continue;
                        availableFiles.push(file);
                        seenUrls.add(file.url);
                    }
                }

                // Fase 3.1+: Si el retriever no trae contexto útil para menú/precios,
                // usamos un fallback determinístico con conocimiento existente.
                if (asksMenuOrPrice && (!ragContext || !hasPriceSignals(ragContext))) {
                    const fallbackMenuContext = await loadMenuFallbackContext(businessId);
                    if (fallbackMenuContext) {
                        ragContext = ragContext
                            ? `${ragContext}\n\n[MENU_CANONICO_FALLBACK]\n${fallbackMenuContext}`
                            : `[MENU_CANONICO_FALLBACK]\n${fallbackMenuContext}`;
                        console.log("[AIService] Menu fallback context injected");
                    }
                }
            } catch (ragError) {
                console.error("[AIService] Error en RAG retrieval:", ragError);
            }

            let systemPrompt = options.systemPrompt?.trim() || config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;
            const hasAssistantHistory = messages.some((m) => m.role === "assistant");

            if (config?.welcomeMessage) {
                systemPrompt += `\n\nAl iniciar una conversación o saludar, tu mensaje debe ser en base a la siguiente plantilla de bienvenida: "${config.welcomeMessage}". No repitas este saludo si la conversación ya está en curso.`;
            }

            if (hasAssistantHistory) {
                systemPrompt += "\n\nCONTEXTO ACTIVO: esta conversacion ya fue iniciada. No envíes mensaje de bienvenida ni reinicies la charla; responde directamente a la última solicitud del usuario.";
            }

            if (config?.customResponses && Array.isArray(config.customResponses) && config.customResponses.length > 0) {
                systemPrompt += `\n\nREGLAS ESTRICTAS DE CONVERSACIÓN (RESPUESTAS PREDEFINIDAS):\n`;
                for (const custom of config.customResponses) {
                    if (custom.trigger && custom.response) {
                        systemPrompt += `- Si el usuario dice algo relacionado o semánticamente similar a "${custom.trigger}", tu respuesta debe ser exactamente o basarse fuertemente en: "${custom.response}".\n`;
                    }
                }
            }

            // Inyectar contexto RAG al prompt
            if (ragContext) {
                systemPrompt += `\n\nINFORMACIÓN RELEVANTE DE TU BASE DE CONOCIMIENTO (RAG | CAPA=${retrievalLayer}):\n${ragContext}`;
            }

            // Inyectar instrucciones para archivos
            if (availableFiles.length > 0) {
                systemPrompt += `\n\nTIENES ACCESO A LOS SIGUIENTES ARCHIVOS. Si el usuario solicita explícitamente ver el menú, catálogo, horario o documento mencionado, DEBES añadir al final de tu respuesta el comando: [MEDIA_URL: <url_del_archivo>].
                
                Archivos disponibles:
                ${availableFiles.map(f => `- ${f.description} (URL: ${f.url})`).join("\n")}`;
            }

            // Regla anti-alucinación para datos sensibles (precios, horarios, políticas).
            systemPrompt += "\n\nREGLA CRITICA: nunca inventes precios, horarios, stock o condiciones comerciales. Si no aparecen en la base de conocimiento/contexto, responde explícitamente que no tienes ese dato confirmado y ofrece escalar o pedir verificación.";
            systemPrompt += "\nREGLA ADICIONAL PARA PRECIOS: no reasignes precios entre productos. Si detectas duda o inconsistencia, responde solo con los items confirmados y marca el resto como 'precio no confirmado'.";
            systemPrompt += "\nPOLITICA DE GROUNDING ESTRICTO (CERO TOLERANCIA): usa unicamente la informacion del bloque RAG y herramientas. " +
                "Si no hay evidencia textual exacta, responde exactamente: 'Lo siento, no tengo esa información específica en mis registros'. No uses conocimiento externo.";
            systemPrompt += "\nREGLA ESTRICTA DE HERRAMIENTAS: nunca respondas con frases de espera tipo 'voy a revisar' o 'espera un momento'. " +
                "Cuando una accion dependa de herramientas, prioriza ejecutar la herramienta y luego responder con el resultado.";
            systemPrompt += "\nREGLA DE PRIVACIDAD: nunca reveles nombres, telefonos o datos personales de terceros en reservas o agendas. Solo informa disponibilidad (disponible/no disponible) sin identificar personas.";

            const asksSensitiveData = /(precio|precios|costo|costos|tarifa|tarifas|valor|cu[aá]nto|horario|horarios|stock|disponible|promoci[oó]n|promo|descuento|pol[ií]tica|condiciones)/i.test(lastUserMessage);

            // Guardrail duro: si no hay evidencia de KB para preguntas sensibles, evitar respuesta inventada.
            if (asksSensitiveData && (!ragContext || ragTopScore < RAG_STRICT_MIN_CONFIDENCE) && availableFiles.length === 0) {
                return config.handoffMessage || "Lo siento, no tengo esa información específica en mis registros. Te comparto solo datos confirmados.";
            }

            const recentMessages = trimChatMessages(messages);

            // Fase 3.1: si detectamos conflicto de precios para un mismo item,
            // respondemos de forma segura y transparente en vez de arriesgar una alucinación.
            if (asksMenuOrPrice && ragContext) {
                const menuConsistency = analyzeMenuConsistency(ragContext);
                if (menuConsistency.conflicts.length > 0) {
                    const topConflicts = menuConsistency.conflicts
                        .slice(0, 5)
                        .map((c) => `${c.item} (${c.prices.join(" / ")})`)
                        .join(", ");

                    return `Detecté inconsistencias en algunos precios de la base de conocimiento (${topConflicts}). Para evitar darte un dato incorrecto, te comparto solo precios confirmados o, si prefieres, puedo escalarlo para validación humana.`;
                }
            }

            // 2. Determinar proveedor - Preferimos OpenAI si está disponible debido a restricciones regionales de Gemini
            const provider = options.provider || config?.aiProvider || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
            console.log(`[AIService] Business: ${business.name}, Provider Initial Choice: ${provider}`);

            const responseCacheKey = buildCacheKey([
                "response",
                businessId,
                provider,
                systemPrompt,
                compactMessagesForKey(messages),
            ]);
            const cachedResponse = getCacheValue(responseCache, responseCacheKey);
            if (cachedResponse) {
                console.log("[AIService] Response cache hit");
                return cachedResponse;
            }

            const callOpenAI = async () => {
                if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
                console.log("[AIService] Calling OpenAI (gpt-4o-mini)...");
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: systemPrompt }, ...recentMessages],
                    temperature: 0.7,
                    max_tokens: 300,
                });
                return response.choices[0].message.content;
            };

            const callGitHub = async () => {
                if (!process.env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");
                console.log("[AIService] Calling GitHub Models (gpt-4o)...");
                const client = new OpenAI({
                    baseURL: "https://models.inference.ai.azure.com",
                    apiKey: process.env.GITHUB_TOKEN
                });
                
                const response = await client.chat.completions.create({
                    messages: [{ role: 'system', content: systemPrompt }, ...recentMessages],
                    model: "gpt-4o",
                    temperature: 0.7,
                    max_tokens: 300,
                });
                return response.choices[0].message.content;
            };

            const callGemini = async () => {
                if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
                console.log("[AIService] Calling Gemini (gemini-1.5-flash)...");
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const history = recentMessages.slice(0, -1).map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                }));
                const lastMessage = recentMessages[recentMessages.length - 1].content;
                const chat = model.startChat({
                    history,
                    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
                });
                const result = await chat.sendMessage(lastMessage);
                return result.response.text();
            };

            let finalResponse = "";
            if (provider === 'openai') {
                finalResponse = (await callOpenAI()) || "";
            } else if (provider === 'github') {
                finalResponse = (await callGitHub()) || "";
            } else {
                try {
                    finalResponse = (await callGemini()) || "";
                } catch (geminiErr: any) {
                    console.error("[AIService] Gemini failed, checking for OpenAI fallback...", geminiErr.message || geminiErr);
                    if (process.env.OPENAI_API_KEY) {
                        console.log("[AIService] FALLBACK TO OPENAI TRIGGERED");
                        finalResponse = (await callOpenAI()) || "";
                    } else {
                        throw geminiErr;
                    }
                }
            }

            // Cuando el usuario pide archivos, solo adjuntamos media si existe coincidencia semántica mínima
            // entre consulta y archivo para evitar enviar imágenes/documentos equivocados.
            if (asksForDocument && availableFiles.length > 0 && !/\[MEDIA_URL:\s*[^\]]+\]/i.test(finalResponse)) {
                const asksImage = /(imagen|im[aá]genes|foto|fotos|jpg|jpeg|png|webp|gif)/i.test(lastUserMessage);
                const filesToShare = selectMediaByQuery({
                    files: availableFiles,
                    query: lastUserMessage,
                    asksForEverything,
                    asksImage,
                });

                const mediaTags = filesToShare
                    .filter((file) => Boolean(file.url))
                    .map((file) => `[MEDIA_URL: ${file.url}]`)
                    .join("\n");

                if (mediaTags) {
                    finalResponse = `${finalResponse.trim()}\n\n${mediaTags}`;
                }
            }

            setCacheValue(
                responseCache,
                responseCacheKey,
                finalResponse,
                RESPONSE_CACHE_TTL_MS,
                RESPONSE_CACHE_MAX_ENTRIES
            );
            registerCacheKey(responseKeysByBusiness, businessId, responseCacheKey);

            // Charge trial tokens if the business belongs to a trial user
            try {
                const owner = await prisma.business.findUnique({ where: { id: businessId }, select: { userId: true } });
                if (owner?.userId) {
                    const user = await prisma.user.findUnique({ where: { id: owner.userId }, select: { id: true, trialTokenLimit: true, trialTokensUsed: true } }) as any;
                    if (user && typeof user.trialTokenLimit === 'number') {
                        // Simple heuristic: estimate tokens based on content length
                        const inputText = messages.map(m => m.content || '').join(' ');
                        const estimatedTokens = Math.max(1, Math.floor(inputText.length / 4 + finalResponse.length / 4));
                        const newUsage = (user.trialTokensUsed || 0) + estimatedTokens;
                        await prisma.$executeRaw`UPDATE "User" SET trialTokensUsed = ${newUsage} WHERE id = ${user.id}`;
                    }
                }
            } catch (e) {
                console.warn('[AIService] Could not charge trial tokens:', e);
            }

            return finalResponse;
        } catch (error: any) {
            console.error("[AIService] FINAL CRITICAL ERROR:", error.message || error);
            return "Lo siento, tuve un problema técnico al procesar tu mensaje. ¿Podrías repetirlo?";
        }
    }
};

export function invalidateAiCachesForBusiness(businessId: string) {
    clearCacheByBusiness(responseCache, responseKeysByBusiness, businessId);
    businessCache.delete(businessId);
}
