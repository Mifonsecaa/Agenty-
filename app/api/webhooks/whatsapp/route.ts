// app/api/webhooks/whatsapp/route.ts
import { NextResponse } from "next/server";
import { handleIncomingMessage } from "@/services/agent-execution";

// 1. Endpoint de verificación (Intacto, está perfecto)
export async function GET(req: Request) {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    } else {
        return new NextResponse("Failed validation.", { status: 403 });
    }
}

// 2. Endpoint de recepción de mensajes MEJORADO
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 🚨 FILTRO 1: Ignorar notificaciones de "Entregado" o "Leído"
        // Meta envía 'statuses' en lugar de 'messages' para los doble check
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        if (!changes || !changes.messages || changes.messages.length === 0) {
            // Devolvemos 200 OK rápido para que Meta sepa que lo recibimos y no insista
            return NextResponse.json({ status: "ok", message: "Not a message or empty" });
        }

        const messageObj = changes.messages[0];
        const metadata = changes.metadata;

        const from = messageObj.from;
        const businessId = metadata.phone_number_id;

        // 🚨 FILTRO 2: Extraer el texto dependiendo del tipo de mensaje
        let messageText = "";

        if (messageObj.type === "text") {
            // Mensaje de texto normal
            messageText = messageObj.text.body;
        } else if (messageObj.type === "interactive") {
            // Cuando el usuario presiona un botón de WhatsApp
            messageText = messageObj.interactive?.button_reply?.title ||
                messageObj.interactive?.list_reply?.title;
        } else {
            // Si mandan un audio, imagen, sticker, etc.
            console.log(`[WhatsApp] Tipo de mensaje no soportado aún: ${messageObj.type}`);
            return NextResponse.json({ status: "ok", message: "Unsupported type" });
        }

        if (messageText && from && businessId) {
            // 3. Llamamos al cerebro
            // NOTA: Si usas Vercel y tu IA tarda más de 15 segundos en responder,
            // esto podría causar un timeout. Considera usar funciones Background si pasa eso.
            await handleIncomingMessage({
                platform: 'whatsapp',
                text: messageText,
                contactId: from,
                businessId: businessId,
            });
        }

        // 🚨 REGLA DE ORO DE META: Siempre devuelve 200 OK lo más rápido posible
        return NextResponse.json({ status: "ok" });

    } catch (error) {
        console.error("Error crítico en webhook de WhatsApp:", error);
        // Meta recomienda devolver 200 incluso si hay un error en tu lógica interna,
        // de lo contrario, intentarán reenviar el mismo mensaje problemático por 24 horas.
        return NextResponse.json({ status: "error_handled" }, { status: 200 });
    }
}