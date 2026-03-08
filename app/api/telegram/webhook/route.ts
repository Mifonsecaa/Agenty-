import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// 1. Inicializamos el cliente de Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const chatId = body.message?.chat?.id;
        const text = body.message?.text;
        if (!chatId || !text) {
            return NextResponse.json({ ok: true });
        }

        const business = await prisma.business.findFirst();

        let replyText = "Lo siento, el agente no está configurado aún.";

        if (business && business.config) {
            const config = business.config as any;

            // Extraemos el System Prompt (la personalidad y reglas)
            const systemPrompt = config.systemPrompt || `Eres ${config.name}, un asistente virtual. Sé amable y conciso.`;

            // 2. ¡LA MAGIA! Hablamos con Gemini (usando el modelo flash que es ultra rápido)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: text,
                config: {
                    systemInstruction: systemPrompt,
                }
            });

            // Capturamos la respuesta
            replyText = response.text || "Lo siento, me quedé sin palabras.";
        }

        // 3. Enviamos la respuesta a Telegram
        const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: replyText
            })
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Error en el webhook con Gemini:", error);
        return NextResponse.json({ ok: true });
    }
}