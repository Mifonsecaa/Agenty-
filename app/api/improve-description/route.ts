import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        // En este caso, permitimos que sea público para que el usuario pueda probarlo antes de loguearse
        const body = await req.json();
        const { text } = body;

        if (!text || text.trim().length < 5) {
            return NextResponse.json({ error: "Escribe un poco más para poder ayudarte." }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `
        Eres un experto en redactar descripciones de negocios para IAs.
        Toma este texto crudo del usuario y mejóralo para que sea claro, profesional y contenga toda la información necesaria para que un Agente de IA lo entienda perfectamente.
        
        INSTRUCCIONES:
        1. Mantén la esencia del negocio.
        2. Organiza la información (Productos, Precios, Horarios si los hay).
        3. Usa un lenguaje que sea fácil de procesar para un modelo de lenguaje (LLM).
        4. Hazlo sonar premium y moderno.
        
        TEXTO DEL USUARIO:
        "${text}"
        
        IMPORTANTE: Devuelve ÚNICAMENTE el texto mejorado. No agregues "Aquí tienes", no uses comillas extra, solo el texto resultante.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const improved = response.choices[0].message.content?.trim();

        return NextResponse.json({ success: true, improved });

    } catch (error) {
        console.error("Error improving description:", error);
        return NextResponse.json({ error: "Error interno al mejorar el texto." }, { status: 500 });
    }
}
