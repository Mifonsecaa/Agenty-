import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { evolutionService } from "@/services/whatsapp/evolution";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
            return NextResponse.json(
                { error: "Falta configuración de WhatsApp (EVOLUTION_API_URL / EVOLUTION_API_KEY)" },
                { status: 500 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { agentId } = await req.json();
        if (!agentId) {
            return NextResponse.json({ error: "agentId es requerido" }, { status: 400 });
        }

        const agent = await prisma.business.findFirst({
            where: {
                id: agentId,
                user: { email: session.user.email }
            }
        });

        if (!agent) {
            return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
        }

        // El nombre de la instancia en Evolution API será el agentId
        const instanceName = agentId;

        // 1. Intentamos ver si la instancia ya existe
        const status = await evolutionService.getInstanceStatus(instanceName);
        console.log(`[API WhatsApp Connect] Current status for ${instanceName}:`, status.instance?.state);

        // 2. Si NO existe la instancia, la creamos
        if (!status.instance || status.status === 404 || status.error === "Not Found") {
            console.log(`[API WhatsApp Connect] Instance ${instanceName} not found. Creating...`);
            await evolutionService.createInstance(instanceName);
        }

        // Siempre intentamos configurar el webhook al conectar.
        // Prioridad: EVOLUTION_WEBHOOK_URL (manual) > URL pública actual.
        const requestOrigin = new URL(req.url).origin;
        const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL || `${requestOrigin}/api/whatsapp/webhook`;
        try {
            await evolutionService.setWebhook(instanceName, webhookUrl);
        } catch (webhookErr) {
            console.error(`[API WhatsApp Connect] Error setting webhook for ${instanceName}:`, webhookErr);
        }

        // 3. Si ya está conectada, retornamos éxito inmediatamente después de asegurar el Webhook
        if (status.instance?.state === "open") {
            return NextResponse.json({ success: true, state: "CONNECTED" });
        }

        // 3. Bucle de sondeo interno (máximo 30 segundos - 10 intentos x 3s)
        // Esto le da a Evolution API el tiempo necesario para inicializar Baileys
        let attempts = 0;
        let base64 = null;

        while (attempts < 10 && !base64) {
            console.log(`[API WhatsApp Connect] Polling for QR... attempt ${attempts + 1}/10 for ${instanceName}`);
            // Esperamos 3 segundos entre intentos
            await new Promise(resolve => setTimeout(resolve, 3000));

            const qrData = await evolutionService.getQR(instanceName);
            console.log(`[API WhatsApp Connect] QR Response attempt ${attempts + 1}:`, JSON.stringify(qrData));

            // En Evolution v2 el QR puede venir en varias rutas:
            // - qrData.base64 (v1/v2 early)
            // - qrData.qrcode.base64 (v2)
            // - qrData.code.base64 (v2 experimental)
            base64 = qrData.base64 || qrData.qrcode?.base64 || qrData.code?.base64;

            if (base64) break;
            attempts++;
        }

        if (base64) {
            console.log(`[API WhatsApp Connect] QR found!`);
            return NextResponse.json({
                success: true,
                state: "READY",
                qrcode: base64
            });
        }

        // Si después de 30s no hay QR, pedimos al frontend que reintente silenciosamente
        console.log(`[API WhatsApp Connect] QR not found after 30s. Returning INITIALIZING.`);
        return NextResponse.json({
            success: true,
            state: "INITIALIZING",
            message: "El QR está tardando en generarse. Reintentando..."
        });

    } catch (error) {
        console.error("[API WhatsApp Connect] Error:", error);
        const message = error instanceof Error ? error.message : "Error desconocido";

        if (message.includes("EVOLUTION_CONFIG_MISSING")) {
            return NextResponse.json(
                { error: "Configuración incompleta de WhatsApp en servidor" },
                { status: 500 }
            );
        }

        if (message.includes("EVOLUTION_HTTP_")) {
            return NextResponse.json(
                { error: "No se pudo conectar con el servicio de WhatsApp (Evolution API)" },
                { status: 502 }
            );
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get("agentId");

        if (!agentId) {
            return NextResponse.json({ error: "agentId es requerido" }, { status: 400 });
        }

        const agent = await prisma.business.findFirst({
            where: {
                id: agentId,
                user: { email: session.user.email }
            }
        });

        if (!agent) {
            return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
        }

        const status = await evolutionService.getInstanceStatus(agentId);
        return NextResponse.json({
            success: true,
            state: status.instance?.state === "open" ? "CONNECTED" : "DISCONNECTED"
        });

    } catch (error) {
        return NextResponse.json({ error: "Error al consultar estado" }, { status: 500 });
    }
}
