import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { businessName, agentTone, businessDescription, schedules, defaultDurationMinutes } = body;

        if (!businessName) {
            return NextResponse.json({ error: "Falta el nombre del negocio" }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const rawContext = `
        Nombre del negocio: ${businessName}
        Tono deseado: ${agentTone || 'Amable, servicial y humano'}
        Duración estándar: ${defaultDurationMinutes || 30} minutos
        Conocimiento y Reglas: ${businessDescription || 'Ninguna regla ingresada.'}
        Horarios Crudos: ${JSON.stringify(schedules || [])}
        `;

        const magicPrompt = `
        Eres un experto en Prompt Engineering conversacional.
        Toma este 'Contexto Crudo' de un negocio y conviértelo en un SYSTEM PROMPT de máxima calidad en español.
        
        INSTRUCCIONES PARA TI:
        1. Escribe el System Prompt desde la perspectiva de primera persona para que la IA lo asuma ("Eres el asistente de...").
        2. Mantén el 'Tono deseado' pero redáctalo como instrucciones de comportamiento precisas (ej. "Tus respuestas deben ser ultra cortas y usar al menos un emoji por mensaje").
        3. Traduce los 'Horarios Crudos' (que vienen en código feo) a una narrativa humana y clara sobre cuándo la persona puede agendar.
        4. Transforma las 'Reglas' en políticas inquebrantables de servicio al cliente.
        
        IMPORTANTE: Devuelve ÚNICAMENTE el texto resultante del System Prompt. NO agregues comillas markdown (\`\`\`), no digas "Aquí tienes", solo el puro y duro texto de instrucciones.
        
        CONTEXTO CRUDO DEL NEGOCIO:
        ${rawContext}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Very capable for prompt writing, cheaper/faster
            messages: [{ role: "user", content: magicPrompt }],
            temperature: 0.7,
        });

        const generatedPrompt = response.choices[0].message.content?.trim();

        if (!generatedPrompt) {
            throw new Error("No prompt was generated");
        }

        return NextResponse.json({ success: true, prompt: generatedPrompt });

    } catch (error) {
        console.error("Error generating advanced prompt:", error);
        return NextResponse.json({ error: "Error interno generado el Prompt Mágico" }, { status: 500 });
    }
}
