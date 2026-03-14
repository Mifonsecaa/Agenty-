import { NextResponse } from "next/server";
import { evolutionService } from "@/services/whatsapp/evolution";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { metricsService } from "@/lib/metrics";

const ALLOWED_MEDIA_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp"];

function isValidMediaUrl(mediaUrl: string): boolean {
    try {
        const url = new URL(mediaUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return false;
        }
        const pathname = url.pathname.toLowerCase();
        return ALLOWED_MEDIA_EXTENSIONS.some((ext) => pathname.endsWith(ext));
    } catch {
        // Invalid URL
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event || "UNKNOWN";
        const instanceName = body.instance || "UNKNOWN";

        console.log(`[DEBUG Webhook] Incoming: event=${eventType}, instance=${instanceName}`);

        // Solo procesamos mensajes nuevos (upsert)
        const isUpsert = eventType === "messages.upsert" || eventType === "MESSAGES_UPSERT";

        if (!isUpsert) {
            return NextResponse.json({ success: true, message: `Ignoring ${eventType}` });
        }

        const messageData = body.data;
        if (!messageData || !messageData.key) {
            return NextResponse.json({ success: true });
        }

        let targetJid = messageData.key.remoteJid;
        const pushName = messageData.pushName || "Usuario";

        // Extraer texto
        const messageText = messageData.message?.conversation ||
            messageData.message?.extendedTextMessage?.text ||
            messageData.message?.imageMessage?.caption ||
            messageData.body ||
            "";

        // Evitar responder a mensajes propios o vacíos
        if (messageData.key.fromMe || !messageText || targetJid === body.sender) {
            return NextResponse.json({ success: true });
        }

        console.log(`[WhatsApp Webhook] Message from ${pushName} (${targetJid}) for instance ${instanceName}`);

        // 1. Buscar el agente vinculado a esta instancia
        const agent = await prisma.business.findUnique({
            where: { id: instanceName }
        });

        if (!agent) {
            console.log(`[WhatsApp Webhook] Instance ${instanceName} ignored (Agent not in DB)`);
            return NextResponse.json({ success: true, message: "Agent not found" });
        }

        // --- GESTIÓN DE CONTACTO Y CONVERSACIÓN ---
        const customerPhone = targetJid.split('@')[0];
        let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    phone: customerPhone,
                    name: pushName
                }
            });
        }

        // Buscar conversación activa o crear nueva
        let conversation = await prisma.conversation.findFirst({
            where: {
                businessId: agent.id,
                customerId: customer.id,
                status: { not: "RESOLVED" }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    businessId: agent.id,
                    customerId: customer.id,
                    channel: "WHATSAPP",
                    status: "ACTIVE"
                }
            });
        }

        // Guardar mensaje del USUARIO
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: "user",
                content: messageText
            }
        });
        
        // Actualizar timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });


        // --- REGISTRO DE MÉTRICA: Mensaje Recibido ---
        await metricsService.incrementMetric(agent.id, 'messagesReceived');

        // --- RESOLUCIÓN DE LID ---
        if (targetJid.includes("@lid")) {
            const alternateJid = messageData.remoteJidAlt || messageData.senderPn;
            if (alternateJid && !alternateJid.includes("@lid")) {
                targetJid = alternateJid.includes("@") ? alternateJid : `${alternateJid}@s.whatsapp.net`;
            } else {
                try {
                    const contactInfo = await evolutionService.fetchContact(instanceName, targetJid);
                    if (contactInfo && contactInfo.id && !contactInfo.id.includes("@lid")) {
                        targetJid = contactInfo.id;
                    } else if (contactInfo && (contactInfo.number || contactInfo.phoneNumber)) {
                        const num = contactInfo.number || contactInfo.phoneNumber;
                        targetJid = num.includes("@") ? num : `${num}@s.whatsapp.net`;
                    }
                } catch (err) {
                    console.error("[WhatsApp Webhook] Error resolving LID:", err);
                }
            }
        }

        // 2. Generar respuesta real con el Agente (LangGraph + RAG)
        let aiResponse = "Lo siento, tuve un problema interno.";
        let mediaUrl: string | null = null;
        
        try {
            console.log(`[WhatsApp Webhook] Ejecutando agente para: "${messageText}"`);
            const { createAgentGraph } = await import("@/lib/agent/graph");
            const { HumanMessage } = await import("@langchain/core/messages");

            const agentExecutor = createAgentGraph(agent.id, agent.name, agent.config);

            const result = await agentExecutor.invoke({
                messages: [new HumanMessage(messageText)],
                businessId: agent.id,
                businessName: agent.name,
                config: agent.config
            });

            console.log(`[WhatsApp Webhook] Resultado del agente obtenido.`);
            const lastMsg = result.messages[result.messages.length - 1];
            aiResponse = lastMsg.content as string;
            
            // DETECTAR ARCHIVO
            const mediaMatch = aiResponse.match(/\[MEDIA_URL:\s*(.*?)\]/);
            if (mediaMatch && mediaMatch[1]) {
                mediaUrl = mediaMatch[1].trim();
                aiResponse = aiResponse.replace(/\[MEDIA_URL:\s*.*?\]/, "").trim();
                
                // Resolver URL relativa
                if (mediaUrl.startsWith("/")) {
                    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
                    mediaUrl = new URL(mediaUrl, baseUrl).toString();
                }

                // Validar URL de media antes de usarla
                if (!isValidMediaUrl(mediaUrl)) {
                    console.warn(`[WhatsApp Webhook] mediaUrl inválida o no permitida: ${mediaUrl}`);
                    mediaUrl = undefined as any;
                }
            }
        } catch (aiErr: any) {
            console.error("[WhatsApp Webhook] Agent Error:", aiErr.message || aiErr);
        }

        // 3. Enviar respuesta vía Evolution API
        if (aiResponse && aiResponse.trim() !== "") {
            await evolutionService.sendMessage(instanceName, targetJid, aiResponse);
            console.log(`[WhatsApp Webhook] Responded with text to ${pushName}`);

            // Guardar respuesta del AGENTE (IA) en DB
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: "agent",
                    content: aiResponse
                }
            });
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: new Date() }
            });
        }
        
        // 4. Enviar archivo si existe
        if (mediaUrl) {
            console.log(`[Webhook] Enviando archivo: ${mediaUrl}`);
            const type = mediaUrl.endsWith(".pdf") ? "document" : "image";
            // Enviamos el medio
            await evolutionService.sendMedia(instanceName, targetJid, mediaUrl, type, "Aquí tienes el archivo.");
            
            // Opcional: Registrar que se envió un archivo en la conversación
             await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: "agent",
                    content: `[ARCHIVO ENVIADO: ${mediaUrl}]`
                }
            });
        }

        // --- REGISTRO DE MÉTRICA: Respuesta Enviada ---
        await metricsService.incrementMetric(instanceName, 'messagesSent');
        await metricsService.incrementMetric(instanceName, 'aiResponses');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WhatsApp Webhook] Critical Error:", error.message || error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
