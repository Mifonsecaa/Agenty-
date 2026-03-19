import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createHash } from "crypto";
import { prisma } from './prisma';
import { retrieveRagContext } from '@/lib/rag/retriever';
import { analyzeMenuConsistency } from '@/lib/rag/menu-precision';

console.log("[AIService] Module Loading...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

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
    return messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 300),
    }));
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

            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles: { url: string, description: string }[] = [];
            
            const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
            const asksForDocument = /(menu|men[uú]|cat[aá]logo|carta|pdf|archivo|documento|imagen|foto|lista\s+de\s+precios|precios\s+completos|menu\s+completo|base\s+de\s+conocimiento|conocimiento|compartir|muestrame|mu[eé]strame)/i.test(lastUserMessage);
            const asksForEverything = /(todo|toda|todos|todas|completo|completa|cualquier\s+cosa|todo\s+lo\s+que\s+tengas|todo\s+el\s+menu|men[uú]\s+completo)/i.test(lastUserMessage);

            try {
                if (lastUserMessage) {
                    const retrieval = await retrieveRagContext({ businessId, query: lastUserMessage });
                    ragContext = retrieval.ragContext;
                    availableFiles = retrieval.availableFiles;
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
            } catch (ragError) {
                console.error("[AIService] Error en RAG retrieval:", ragError);
            }

            const config = business.config as any;
            let systemPrompt = options.systemPrompt?.trim() || config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;

            // Inyectar contexto RAG al prompt
            if (ragContext) {
                systemPrompt += `\n\nINFORMACIÓN RELEVANTE DE TU BASE DE CONOCIMIENTO (RAG):\n${ragContext}`;
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

            const asksSensitiveData = /(precio|precios|costo|costos|tarifa|tarifas|valor|cu[aá]nto|horario|horarios|stock|disponible|promoci[oó]n|promo|descuento|pol[ií]tica|condiciones)/i.test(lastUserMessage);
            const asksMenuOrPrice = /(menu|men[uú]|carta|precio|precios|lista\s+de\s+precios|catalogo|cat[aá]logo)/i.test(lastUserMessage);

            // Guardrail duro: si no hay evidencia de KB para preguntas sensibles, evitar respuesta inventada.
            if (asksSensitiveData && !ragContext && availableFiles.length === 0) {
                return "No tengo ese dato confirmado en la base de conocimiento en este momento. Si quieres, te ayudo a verificarlo o a escalarlo con el negocio.";
            }

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
                    messages: [{ role: 'system', content: systemPrompt }, ...messages],
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
                    messages: [{ role: 'system', content: systemPrompt }, ...messages],
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
                const history = messages.slice(0, -1).map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                }));
                const lastMessage = messages[messages.length - 1].content;
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

            // Cuando el usuario pide explícitamente un archivo/menu, forzamos etiqueta MEDIA_URL
            // para que el canal (Telegram/WhatsApp) envíe el adjunto real.
            if (asksForDocument && availableFiles.length > 0 && !/\[MEDIA_URL:\s*[^\]]+\]/i.test(finalResponse)) {
                const asksImage = /(imagen|im[aá]genes|foto|fotos|jpg|jpeg|png|webp|gif)/i.test(lastUserMessage);
                const prioritized = asksImage
                    ? [...availableFiles].sort((a, b) => {
                        const scoreA = /(image|png|jpg|jpeg|webp|gif|imagen|foto)/i.test(a.description) ? 1 : 0;
                        const scoreB = /(image|png|jpg|jpeg|webp|gif|imagen|foto)/i.test(b.description) ? 1 : 0;
                        return scoreB - scoreA;
                    })
                    : availableFiles;

                const filesToShare = asksForEverything
                    ? prioritized.slice(0, 5)
                    : prioritized.slice(0, 1);

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

