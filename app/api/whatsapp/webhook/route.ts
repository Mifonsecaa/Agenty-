import { NextResponse } from "next/server";
import { evolutionService } from "@/services/whatsapp/evolution";
import { enqueueAudioTranscription, processAudioTranscriptionInline } from "@/services/ai/transcription-queue";
import { prisma } from "@/lib/prisma";
import { metricsService } from "@/lib/metrics";
import { acquireConcurrencySlot, checkRateLimit } from "@/lib/security/traffic-control";
import { incrementOpsCounter, recordOpsDuration } from "@/lib/observability/ops-metrics";

export async function POST(req: Request) {
    const startedAt = Date.now();
    let releaseConcurrency: (() => void) | null = null;
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
        let messageText = messageData.message?.conversation ||
            messageData.message?.extendedTextMessage?.text ||
            messageData.message?.imageMessage?.caption ||
            messageData.body ||
            "";

        const isAudioMessage = Boolean(messageData.message?.audioMessage);

        // Evitar responder a mensajes propios o vacíos
        if (messageData.key.fromMe || (!messageText && !isAudioMessage) || targetJid === body.sender) {
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

        const rate = await checkRateLimit({
            scope: "whatsapp-webhook-sender",
            key: `${instanceName}:${customerPhone}`,
            maxRequests: Number(process.env.WHATSAPP_RATE_LIMIT_MAX || 25),
            windowMs: Number(process.env.WHATSAPP_RATE_LIMIT_WINDOW_MS || 60000),
        });

        if (!rate.allowed) {
            console.warn(`[WhatsApp Webhook] Rate limited sender=${customerPhone} instance=${instanceName}`);
            incrementOpsCounter("whatsapp.rate_limited");
            return NextResponse.json({ success: true, message: "Rate limited" });
        }

        const slot = await acquireConcurrencySlot({
            scope: "whatsapp-webhook-conversation",
            key: `${instanceName}:${customerPhone}`,
            maxConcurrent: Number(process.env.WHATSAPP_MAX_CONCURRENT_PER_CHAT || 1),
        });

        if (!slot) {
            console.warn(`[WhatsApp Webhook] Concurrency limit reached sender=${customerPhone} instance=${instanceName}`);
            incrementOpsCounter("whatsapp.concurrency_rejected");
            return NextResponse.json({ success: true, message: "Busy" });
        }
        releaseConcurrency = slot;

        const { conversation } = await getOrCreateConversation(agent.id, customerPhone, pushName);

        if (isAudioMessage) {
            const providerMessageId = String(messageData?.key?.id || "");
            if (!providerMessageId) {
                return NextResponse.json({ success: true, message: "Missing provider message id" });
            }

            const enqueue = await enqueueAudioTranscription({
                businessId: agent.id,
                conversationId: conversation.id,
                channel: "WHATSAPP",
                providerMessageId,
                targetJid,
                instanceName,
                captionText: messageText || "",
                messageData,
            });

            if (enqueue.missingQueueTable && process.env.TRANSCRIPTION_INLINE_FALLBACK !== "false") {
                await processAudioTranscriptionInline({
                    businessId: agent.id,
                    conversationId: conversation.id,
                    channel: "WHATSAPP",
                    providerMessageId,
                    targetJid,
                    instanceName,
                    captionText: messageText || "",
                    messageData,
                });

                incrementOpsCounter("whatsapp.audio_sync_fallback");
                recordOpsDuration("whatsapp.webhook_latency_ms", Date.now() - startedAt);
                return NextResponse.json({ success: true, queued: false, mode: "sync_fallback" });
            }

            if (enqueue.missingQueueTable) {
                await evolutionService.sendMessage(instanceName, targetJid, "Recibi tu audio, pero la cola de transcripcion no esta disponible temporalmente.");
                incrementOpsCounter("whatsapp.audio_queue_unavailable");
                return NextResponse.json({ success: true, queued: false, error: "queue_unavailable" });
            }

            await evolutionService.sendMessage(instanceName, targetJid, "Recibi tu audio. Lo estoy transcribiendo y te respondo enseguida.");

            incrementOpsCounter(enqueue.deduplicated ? "whatsapp.audio_queued_deduplicated" : "whatsapp.audio_queued");
            recordOpsDuration("whatsapp.webhook_latency_ms", Date.now() - startedAt);
            return NextResponse.json({ success: true, queued: true, deduplicated: enqueue.deduplicated });
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

            const agentExecutor = createAgentGraph(agent.id, agent.name, agent.config, targetJid);

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
            const mediaMatch = aiResponse.match(/\[MEDIA_URL:\s*(.*?)]/);
            if (mediaMatch && mediaMatch[1]) {
                mediaUrl = mediaMatch[1].trim();
                aiResponse = aiResponse.replace(/\[MEDIA_URL:\s*.*?]/, "").trim();
                
                // Resolver URL relativa
                if (mediaUrl.startsWith("/")) {
                    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
                    mediaUrl = new URL(mediaUrl, baseUrl).toString();
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

        incrementOpsCounter("whatsapp.success");
        recordOpsDuration("whatsapp.webhook_latency_ms", Date.now() - startedAt);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WhatsApp Webhook] Critical Error:", error.message || error);
        incrementOpsCounter("whatsapp.error");
        recordOpsDuration("whatsapp.error_latency_ms", Date.now() - startedAt);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    } finally {
        releaseConcurrency?.();
    }
}

async function getOrCreateConversation(businessId: string, customerPhone: string, pushName: string) {
    let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                phone: customerPhone,
                name: pushName,
            },
        });
    }

    let conversation = await prisma.conversation.findFirst({
        where: {
            businessId,
            customerId: customer.id,
            status: { not: "RESOLVED" },
        },
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                businessId,
                customerId: customer.id,
                channel: "WHATSAPP",
                status: "ACTIVE",
            },
        });
    }

    return { customer, conversation };
}

