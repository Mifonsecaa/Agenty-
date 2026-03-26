// services/agent-execution.ts
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendWhatsAppMessage } from '@/services/whatsapp-sender';
import { aiService } from '@/lib/ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface IncomingMessage {
    platform: 'whatsapp' | 'instagram' | 'telegram';
    text: string;
    contactId: string;
    businessId: string;
}

export interface ExecuteAgentInput {
    businessId: string;
    platform: 'whatsapp' | 'instagram' | 'telegram';
    userId: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export async function executeAgent(input: ExecuteAgentInput): Promise<string> {
    const response = await aiService.generateResponse(
        input.businessId,
        [{ role: 'user', content: input.message }],
        {}
    );

    return typeof response === 'string' ? response : String(response || '');
}

// Esta es la función principal que orquesta todo
export async function handleIncomingMessage(message: IncomingMessage) {
    try {
        console.log(`[Cerebro] 📩 Mensaje entrante de ${message.platform} (${message.contactId})`);

        if (!genAI) {
            console.warn('[Cerebro] GEMINI_API_KEY no configurada; se omite procesamiento automático.');
            return;
        }

        // 1. Buscar el negocio y su agente en la base de datos
        const business = await prisma.business.findUnique({
            where: { phone: message.businessId },
        });

        if (!business || !business.config) {
            console.warn(`[Cerebro] ⚠️ No se encontró configuración para el negocio: ${message.businessId}`);
            return; // Detenemos la ejecución si no hay a quién responderle
        }

        const config = business.config as any;
        const systemPrompt = config.systemPrompt || `Eres un asistente amable para ${config.name}.`;

        // 2. Llamar al LLM (Mejorado con la API moderna de Gemini)
        // 💡 Usamos gemini-1.5-flash: Es el estándar actual, mucho más rápido y barato que pro para bots
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt // 👈 Forma correcta y moderna de darle su "personalidad"
        });

        // 🧠 MODO CHAT: Iniciamos una sesión.
        // Aquí es donde en el futuro inyectarás los mensajes anteriores para que tenga memoria.
        const chatSession = model.startChat({
            history: [
                // TODO: Traer historial de la base de datos. Ejemplo de cómo se vería:
                // { role: "user", parts: [{ text: "Hola, me llamo David" }] },
                // { role: "model", parts: [{ text: "¡Hola David! ¿En qué te ayudo?" }] },
            ],
        });

        console.log(`[Cerebro] 🤖 Generando respuesta...`);
        const result = await chatSession.sendMessage(message.text);
        const aiResponse = result.response.text();

        // 3. Enviar la respuesta de vuelta a la plataforma correcta
        switch (message.platform) {
            case 'whatsapp':
                await sendWhatsAppMessage(message.contactId, aiResponse);
                console.log(`[Cerebro] ✅ Respuesta enviada por WhatsApp a ${message.contactId}`);
                break;
            // case 'instagram':
            //     await sendInstagramMessage(message.contactId, aiResponse);
            //     break;
            // case 'telegram':
            //     await sendTelegramMessage(message.contactId, aiResponse);
            //     break;
            default:
                console.warn(`[Cerebro] ❓ Plataforma desconocida: ${message.platform}`);
        }

    } catch (error) {
        // 🚨 CRÍTICO: Si la IA falla (ej. límite de cuota) o WhatsApp se cae, esto evita que todo el servidor explote.
        console.error(`[Cerebro] ❌ Error procesando mensaje de ${message.contactId}:`, error);

        // Opcional: Podrías enviar un mensaje de "Estoy teniendo problemas técnicos" al usuario aquí.
    }
}