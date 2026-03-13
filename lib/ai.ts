import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
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

            const config = business.config as any;
            
            // 2. Usar el Agente de LangGraph
            console.log("[AIService] Initializing Agent Graph...");
            const { createAgentGraph } = require("@/lib/agent/graph"); // Import dinámico para evitar ciclos si los hubiera
            
            // Convertir mensajes al formato de LangChain si es necesario
            // La gráfica espera { messages: [...] }
            // Los mensajes de entrada son { role, content }
            // LangGraph/LangChain maneja esto, pero asegurémonos de mapear 'user'/'assistant'
            
            const agent = createAgentGraph(business.id, business.name, config);
            
            const inputs = {
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                businessId: business.id,
                businessName: business.name,
                config: config
            };

            const configGraph = { configurable: { thread_id: `thread-${Date.now()}` } };
            
            console.log("[AIService] Invoking Agent...");
            const result = await agent.invoke(inputs, configGraph);
            
            // Extraer la última respuesta del asistente
            const lastMessage = result.messages[result.messages.length - 1];
            console.log("[AIService] Agent finished. Response length:", lastMessage.content.length);
            
            return lastMessage.content as string;

        } catch (error: any) {
            console.error("[AIService] Error generating response:", error);
            return "Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?";
        }
    }
};
