import { NextResponse } from "next/server";
import { evolutionService } from "@/services/whatsapp/evolution";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event || "UNKNOWN";
        const instanceName = body.instance || "UNKNOWN";

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

        // 2. Generar respuesta real con la IA
        let aiResponse = "Lo siento, tuve un problema interno.";
        try {
            const result = await aiService.generateResponse(instanceName, [
                { role: 'user', content: messageText }
            ]);
            if (result) aiResponse = result;
        } catch (aiErr: any) {
            console.error("[WhatsApp Webhook] AI Error:", aiErr.message || aiErr);
        }

        // 3. Enviar respuesta vía Evolution API
        await evolutionService.sendMessage(instanceName, targetJid, aiResponse);
        console.log(`[WhatsApp Webhook] Responded to ${pushName}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WhatsApp Webhook] Critical Error:", error.message || error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
