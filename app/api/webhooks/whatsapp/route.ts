// app/api/webhooks/whatsapp/route.ts
// Webhook para recibir mensajes de WhatsApp desde Meta Cloud API

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { metricsService } from "@/lib/metrics";
import { extractMediaFromAgentReply } from "@/lib/media-parser";

/**
 * GET - Verificar el webhook (Meta lo llama en Setup)
 * Meta envía: ?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=tu_token
 */
export async function GET(req: NextRequest) {
    try {
        const mode = req.nextUrl.searchParams.get("hub.mode");
        const challenge = req.nextUrl.searchParams.get("hub.challenge");
        const verifyToken = req.nextUrl.searchParams.get("hub.verify_token");

        console.log(`[Webhook WhatsApp] GET verification - mode: ${mode}, challenge: ${challenge}, token: ${verifyToken ? "provided" : "missing"}`);

        if (mode !== "subscribe") {
            return NextResponse.json({ error: "Invalid mode" }, { status: 403 });
        }

        if (!verifyToken) {
            return NextResponse.json({ error: "No verify_token" }, { status: 403 });
        }

        // Buscar un Business con este token
        const business = await prisma.business.findFirst({
            where: { whatsappWebhookVerifyToken: verifyToken },
        });

        if (!business) {
            console.error(`[Webhook WhatsApp] Invalid verify_token: ${verifyToken}`);
            return NextResponse.json({ error: "Invalid verify_token" }, { status: 403 });
        }

        console.log(`[Webhook WhatsApp] ✅ Token verified for business: ${business.id}`);

        // Meta requires us to echo back the challenge
        return NextResponse.json(challenge, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    } catch (error) {
        console.error("[Webhook WhatsApp] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST - Recibir mensajes de usuarios
 * Meta envía: { entry: [{ changes: [{ value: { messages: [{...}] } }] }] }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(`[Webhook WhatsApp] POST - Received:`, JSON.stringify(body, null, 2));

        // Validar estructura de Meta
        if (!body.entry || !Array.isArray(body.entry)) {
            return NextResponse.json({ success: true }); // No-op pero no error
        }

        // Procesar cada entrada
        for (const entry of body.entry) {
            if (!entry.changes || !Array.isArray(entry.changes)) continue;

            for (const change of entry.changes) {
                const value = change.value;
                if (!value) continue;

                // Procesar mensajes
                if (value.messages && Array.isArray(value.messages)) {
                    for (const message of value.messages) {
                        await handleIncomingMessage(message, value);
                    }
                }

                // Procesar actualizaciones de estado
                if (value.statuses && Array.isArray(value.statuses)) {
                    for (const status of value.statuses) {
                        await handleMessageStatus(status);
                    }
                }
            }
        }

        // Meta requiere respuesta 200 OK rápidamente
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[Webhook WhatsApp] POST Error:", error);
        // No fallamos - devolvemos 200 igual para que Meta no reintente
        return NextResponse.json({ success: true }, { status: 200 });
    }
}

/**
 * Manejar mensaje entrante del usuario
 */
async function handleIncomingMessage(
    message: any,
    context: any
) {
    try {
        const from = message.from; // Número del usuario (ej: "34123456789")
        const messageId = message.id;
        const timestamp = message.timestamp;

        if (!from) {
            console.log("[WhatsApp Message] No 'from' field, skipping");
            return;
        }

        // Ignorar mensajes de test o sin contenido
        if (message.from === "1234567890") return; // Test message

        // Extraer texto del mensaje
        let messageText = "";
        let hasMedia = false;

        if (message.type === "text") {
            messageText = message.text?.body || "";
        } else if (message.type === "image") {
            messageText = `[IMAGEN ENVIADA: ${message.image?.caption || ""}]`;
            hasMedia = true;
        } else if (message.type === "document") {
            messageText = `[DOCUMENTO ENVIADO: ${message.document?.filename || message.document?.caption || ""}]`;
            hasMedia = true;
        } else if (message.type === "audio") {
            messageText = "[NOTA DE VOZ ENVIADA]";
            hasMedia = true;
        } else if (message.type === "video") {
            messageText = `[VIDEO ENVIADO: ${message.video?.caption || ""}]`;
            hasMedia = true;
        } else {
            messageText = `[Tipo de mensaje no soportado: ${message.type}]`;
        }

        if (!messageText) {
            console.log("[WhatsApp Message] Empty message, skipping");
            return;
        }

        console.log(`[WhatsApp Message] From: ${from}, Text: "${messageText}"`);

        // Buscar qué Business está asociado a este webhook
        // Nota: Meta NO nos dice cuál es el número, así que buscamos por último que recibió webhook
        // En una setup real, guardarías en redis o usarías una colección intermediaria
        
        // Para ahora, buscar al primer business con credenciales configuradas
        // TODO: Mejorar esto con mapeo de número → BusinessId
        const businesses = await prisma.business.findMany({
            where: {
                whatsappPhoneNumberId: { not: null },
                whatsappAccessToken: { not: null },
            },
            take: 1,
        });

        if (!businesses.length) {
            console.log("[WhatsApp Message] No business configured for WhatsApp");
            return;
        }

        const business = businesses[0];

        // Crear o recuperar customer por número de teléfono
        let customer = await prisma.customer.findUnique({
            where: { phone: from },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    phone: from,
                    name: `WhatsApp ${from}`, // Meta no nos da el nombre en webhook
                },
            });
            console.log(`[WhatsApp Message] Created new customer: ${customer.id}`);
        }

        // Crear o recuperar conversación
        let conversation = await prisma.conversation.findFirst({
            where: {
                businessId: business.id,
                customerId: customer.id,
                channel: "WHATSAPP",
                status: { not: "RESOLVED" },
            },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    businessId: business.id,
                    customerId: customer.id,
                    channel: "WHATSAPP",
                    status: "ACTIVE",
                },
            });
            console.log(`[WhatsApp Message] Created new conversation: ${conversation.id}`);
        }

        // Guardar mensaje del usuario
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: "user",
                content: messageText,
            },
        });

        // Actualizar timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });

        // Registrar métrica
        await metricsService.incrementMetric(business.id, "messagesReceived");

        // Generar respuesta del agente
        let aiResponse = "Lo siento, tuve un problema interno. Por favor, intenta de nuevo.";
        let mediaUrls: string[] = [];

        try {
            console.log(`[WhatsApp Message] Invoking agent for: "${messageText}"`);
            const { createAgentGraph } = await import("@/lib/agent/graph");
            const { HumanMessage } = await import("@langchain/core/messages");

            const agentExecutor = createAgentGraph(
                business.id,
                business.name,
                business.config || {},
                from // customerJid
            );

            const result = await agentExecutor.invoke({
                messages: [new HumanMessage(messageText)],
                businessId: business.id,
                businessName: business.name,
                config: business.config || {},
            });

            const lastMsg = result.messages[result.messages.length - 1];
            aiResponse = lastMsg.content as string;

            // Extraer media de la respuesta si existe
            const requestOrigin = new URL(request.url).origin;
            const parsedReply = extractMediaFromAgentReply(aiResponse, requestOrigin);
            aiResponse = parsedReply.cleanText;
            mediaUrls = parsedReply.mediaUrls;

            console.log(`[WhatsApp Message] Agent response: "${aiResponse}"`);
        } catch (agentErr: any) {
            console.error("[WhatsApp Message] Agent error:", agentErr);
            aiResponse = "Lo siento, algo salió mal. Por favor, intenta de nuevo más tarde.";
        }

        // Enviar respuesta a través de Meta API
        if (aiResponse && aiResponse.trim()) {
            const sent = await sendMessageViaMeta(
                business.whatsappPhoneNumberId!,
                business.whatsappAccessToken!,
                from,
                aiResponse
            );

            if (sent) {
                // Guardar respuesta del agente
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        role: "agent",
                        content: aiResponse,
                    },
                });

                await metricsService.incrementMetric(business.id, "messagesSent");
                await metricsService.incrementMetric(business.id, "aiResponses");
            }
        }

        // Enviar media si existe
        for (const mediaUrl of mediaUrls) {
            await sendMediaViaMeta(
                business.whatsappPhoneNumberId!,
                business.whatsappAccessToken!,
                from,
                mediaUrl
            );

            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: "agent",
                    content: `[ARCHIVO ENVIADO: ${mediaUrl}]`,
                },
            });
        }
    } catch (error) {
        console.error("[WhatsApp Message] Error handling message:", error);
    }
}

/**
 * Manejar actualizaciones de estado (entregado, leído, etc.)
 */
async function handleMessageStatus(status: any) {
    const messageId = status.id;
    const statusType = status.status; // "delivered", "read", "sent", "failed"

    console.log(`[WhatsApp Status] Message ${messageId} status: ${statusType}`);

    // TODO: Implementar tracking de estados si es necesario
    // Por ahora solo registramos en logs
}

/**
 * Enviar mensaje de texto a través de Meta WhatsApp API
 */
async function sendMessageViaMeta(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: "text",
                    text: {
                        body: text,
                        preview_url: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[WhatsApp Send] Failed to send to ${to}:`, errorData);
            return false;
        }

        const data = await response.json();
        console.log(`[WhatsApp Send] ✅ Message sent to ${to}:`, data.messages?.[0]?.id);
        return true;
    } catch (error) {
        console.error(`[WhatsApp Send] Error sending to ${to}:`, error);
        return false;
    }
}

/**
 * Enviar media a través de Meta WhatsApp API
 */
async function sendMediaViaMeta(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    mediaUrl: string
): Promise<boolean> {
    try {
        // Determinar tipo de media por extensión
        let type = "document";
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl)) {
            type = "image";
        } else if (/\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl)) {
            type = "video";
        }

        const response = await fetch(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: type,
                    [type]: {
                        link: mediaUrl,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[WhatsApp Send Media] Failed to send to ${to}:`, errorData);
            return false;
        }

        console.log(`[WhatsApp Send Media] ✅ Media sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`[WhatsApp Send Media] Error sending to ${to}:`, error);
        return false;
    }
}

