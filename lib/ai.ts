import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createHash } from "crypto";
import { prisma } from './prisma';
import { retrieveRagContext } from '@/lib/rag/retriever';

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
            
            try {
                const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
                if (lastUserMessage && process.env.OPENAI_API_KEY) {
                    const retrieval = await retrieveRagContext({ businessId, query: lastUserMessage });
                    ragContext = retrieval.ragContext;
                    availableFiles = retrieval.availableFiles;
                    console.log(`[AIService] RAG retrieval selected ${retrieval.selected.length} chunks`);
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
    clearCacheByBusiness(responseCache, responseKeysByBusiness, businessId);
    businessCache.delete(businessId);
}

