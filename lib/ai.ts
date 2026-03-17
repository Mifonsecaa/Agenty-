import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { createHash } from "crypto";
import { prisma } from './prisma';

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
}

type RagCacheValue = {
    ragContext: string;
    availableFiles: { url: string; description: string }[];
};

type RagCandidate = {
    content: string;
    metadata: Record<string, unknown>;
    distance: number;
    vectorScore: number;
    lexicalScore: number;
    combinedScore: number;
};

type CacheEntry<T> = {
    value: T;
    expiresAt: number;
    lastAccessAt: number;
};

const RAG_CACHE_TTL_MS = Number(process.env.AI_RAG_CACHE_TTL_MS || 120000);
const RESPONSE_CACHE_TTL_MS = Number(process.env.AI_RESPONSE_CACHE_TTL_MS || 45000);
const RAG_CACHE_MAX_ENTRIES = Number(process.env.AI_RAG_CACHE_MAX_ENTRIES || 500);
const RESPONSE_CACHE_MAX_ENTRIES = Number(process.env.AI_RESPONSE_CACHE_MAX_ENTRIES || 300);
const RAG_RETRIEVAL_CANDIDATES = Number(process.env.RAG_RETRIEVAL_CANDIDATES || 10);
const RAG_RETRIEVAL_TOP_K = Number(process.env.RAG_RETRIEVAL_TOP_K || 4);
const RAG_CONTEXT_MAX_CHARS = Number(process.env.RAG_CONTEXT_MAX_CHARS || 2600);
const RAG_MIN_VECTOR_SIMILARITY = Number(process.env.RAG_MIN_VECTOR_SIMILARITY || 0.6);

const ragCache = new Map<string, CacheEntry<RagCacheValue>>();
const responseCache = new Map<string, CacheEntry<string>>();
const ragKeysByBusiness = new Map<string, Set<string>>();
const responseKeysByBusiness = new Map<string, Set<string>>();

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

function normalizeForMatch(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u017F\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractTerms(value: string) {
    return normalizeForMatch(value)
        .split(" ")
        .filter((term) => term.length >= 3)
        .slice(0, 20);
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

function capContextByChars(chunks: string[], maxChars: number) {
    let used = 0;
    const selected: string[] = [];
    for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        const next = chunk.length + 2;
        if (selected.length > 0 && used + next > maxChars) break;
        if (selected.length === 0 && chunk.length > maxChars) {
            selected.push(chunk.slice(0, maxChars));
            break;
        }
        selected.push(chunk);
        used += next;
    }
    return selected;
}

export const aiService = {
    async generateResponse(businessId: string, messages: ChatMessage[], options: GenerateOptions = {}) {
        try {
            console.log(`[AIService] Starting generation for businessId: ${businessId}`);

            // 1. Obtener la configuración del negocio
            const business = await prisma.business.findUnique({
                where: { id: businessId }
            });

            if (!business) {
                console.error(`[AIService] Business NOT FOUND in DB for ID: ${businessId}`);
                throw new Error("Negocio no encontrado en la base de datos");
            }

            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles: { url: string, description: string }[] = [];
            
            try {
                const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
                if (lastUserMessage && process.env.OPENAI_API_KEY) {
                    const ragKey = buildCacheKey(["rag", businessId, lastUserMessage]);
                    const cachedRag = getCacheValue(ragCache, ragKey);

                    if (cachedRag) {
                        ragContext = cachedRag.ragContext;
                        availableFiles = cachedRag.availableFiles;
                        console.log("[AIService] RAG cache hit");
                    } else {
                        const embeddings = new OpenAIEmbeddings({ 
                            openAIApiKey: process.env.OPENAI_API_KEY, 
                            modelName: "text-embedding-3-small" 
                        });
                        
                        const queryVector = await embeddings.embedQuery(lastUserMessage);
                        const vectorStr = `[${queryVector.join(",")}]`;
                        const queryTerms = extractTerms(lastUserMessage);

                        const candidatesLimit = Math.max(4, Math.min(20, RAG_RETRIEVAL_CANDIDATES));
                        const finalTopK = Math.max(1, Math.min(8, RAG_RETRIEVAL_TOP_K));

                        // Búsqueda vectorial + distancia para reranking liviano.
                        const items = await prisma.$queryRaw`
                            SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
                            FROM "KnowledgeItem"
                            WHERE "businessId" = ${businessId}
                              AND embedding IS NOT NULL
                            ORDER BY embedding <-> ${vectorStr}::vector
                            LIMIT ${candidatesLimit};
                        ` as Array<{ content: string; metadata: unknown; distance: number }>;

                        if (items && items.length > 0) {
                            const ranked = items
                                .map((item) => {
                                    const metadata = (item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata))
                                        ? (item.metadata as Record<string, unknown>)
                                        : {};
                                    const distance = Number(item.distance ?? 2);
                                    const vectorScore = Math.max(0, 1 - distance);
                                    const lexicalScore = lexicalOverlapScore(queryTerms, item.content || "");
                                    const combinedScore = vectorScore * 0.72 + lexicalScore * 0.28;

                                    return {
                                        content: item.content,
                                        metadata,
                                        distance,
                                        vectorScore,
                                        lexicalScore,
                                        combinedScore,
                                    } as RagCandidate;
                                })
                                .filter((item) => item.vectorScore >= RAG_MIN_VECTOR_SIMILARITY || item.lexicalScore >= 0.28)
                                .sort((a, b) => b.combinedScore - a.combinedScore)
                                .slice(0, finalTopK);

                            const seenChunkHashes = new Set<string>();
                            const contextChunks: string[] = [];

                            for (const item of ranked) {
                                const hash = typeof item.metadata.contentHash === "string"
                                    ? item.metadata.contentHash
                                    : buildCacheKey(["rag-content", item.content.slice(0, 200)]);
                                if (seenChunkHashes.has(hash)) continue;
                                seenChunkHashes.add(hash);

                                const fileUrl = typeof item.metadata.fileUrl === "string" ? item.metadata.fileUrl : "";
                                const fileDescription = typeof item.metadata.title === "string"
                                    ? item.metadata.title
                                    : (typeof item.metadata.source === "string" ? item.metadata.source : "Archivo adjunto");

                                let text = item.content;
                                if (fileUrl) {
                                    availableFiles.push({
                                        url: fileUrl,
                                        description: `Documento: ${fileDescription}`,
                                    });
                                    text += `\n[ESTE FRAGMENTO CONTIENE UN ARCHIVO: ${fileUrl}]`;
                                }

                                contextChunks.push(text);
                            }

                            ragContext = capContextByChars(contextChunks, Math.max(800, RAG_CONTEXT_MAX_CHARS)).join("\n\n");
                            setCacheValue(
                                ragCache,
                                ragKey,
                                { ragContext, availableFiles },
                                RAG_CACHE_TTL_MS,
                                RAG_CACHE_MAX_ENTRIES
                            );
                            registerCacheKey(ragKeysByBusiness, businessId, ragKey);
                            console.log(`[AIService] RAG Context retrieved: ${items.length} candidates, ${contextChunks.length} selected`);
                        }
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
    clearCacheByBusiness(ragCache, ragKeysByBusiness, businessId);
    clearCacheByBusiness(responseCache, responseKeysByBusiness, businessId);
}

