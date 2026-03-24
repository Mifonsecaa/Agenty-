import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Aquí recibiremos el nombre del agente (ej. "kitsune_sushi") desde el frontend
        // 1. Leemos todo el cuerpo de la petición
        const body = await req.json();

        // 2. Buscamos el agentId (que es lo que manda tu frontend). Si no viene, usamos un nombre por defecto.
        const rawName = body.agentId || "kitsune_sushi_bar";

        // 3. Evolution API odia los espacios y caracteres raros, así que limpiamos el nombre por seguridad:
        const safeInstanceName = rawName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

        const API_URL = process.env.EVOLUTION_API_URL;
        const API_KEY = process.env.EVOLUTION_API_KEY;

        // Le pedimos a Evolution API que cree la instancia y nos devuelva el QR
        const response = await fetch(`${API_URL}/instance/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: API_KEY as string,
            },
            body: JSON.stringify({
                instanceName: safeInstanceName, // Usamos el nombre limpio
                token: safeInstanceName,
                qrcode: true,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al crear la instancia");
        }

        // Evolution nos devuelve el QR en formato base64, listo para mostrar en una etiqueta <img>
        return NextResponse.json({
            success: true,
            qrBase64: data.qrcode.base64
        });

    } catch (error: any) {
        console.error("Error conectando a Evolution API:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}