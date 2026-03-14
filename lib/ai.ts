import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { prisma } from './prisma';

console.log("[AIService] Module Loading...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const aiService = {
    async generateResponse(businessId: string, messages: ChatMessage[]) {
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
                    const embeddings = new OpenAIEmbeddings({ 
                        openAIApiKey: process.env.OPENAI_API_KEY, 
                        modelName: "text-embedding-3-small" 
                    });
                    
                    const queryVector = await embeddings.embedQuery(lastUserMessage);
                    const vectorStr = `[${queryVector.join(",")}]`;

                    // Búsqueda vectorial
                    const items = await prisma.$queryRaw`
                        SELECT content, metadata
                        FROM "KnowledgeItem"
                        WHERE "businessId" = ${businessId}
                        ORDER BY embedding <-> ${vectorStr}::vector
                        LIMIT 3;
                    ` as any[];

                    if (items && items.length > 0) {
                        ragContext = items.map(item => {
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

            const config = business.config as any;
            let systemPrompt = config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;

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
            const provider = config?.aiProvider || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
            console.log(`[AIService] Business: ${business.name}, Provider Initial Choice: ${provider}`);

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

            if (provider === 'openai') {
                return await callOpenAI();
            } else if (provider === 'github') {
                return await callGitHub();
            } else {
                try {
                    return await callGemini();
                } catch (geminiErr: any) {
                    console.error("[AIService] Gemini failed, checking for OpenAI fallback...", geminiErr.message || geminiErr);
                    if (process.env.OPENAI_API_KEY) {
                        console.log("[AIService] FALLBACK TO OPENAI TRIGGERED");
                        return await callOpenAI();
                    }
                    throw geminiErr;
                }
            }
        } catch (error: any) {
            console.error("[AIService] FINAL CRITICAL ERROR:", error.message || error);
            return "Lo siento, tuve un problema técnico al procesar tu mensaje. ¿Podrías repetirlo?";
        }
    }
};
