// app/api/agents/create/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma"; // Ajusta la ruta a tu archivo prisma.ts
import { getServerSession } from "next-auth";
// Importa tus opciones de auth si las tienes en otro archivo, ej: import { authOptions } from "../auth/[...nextauth]/route"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        // 1. Verificar que el usuario esté logueado
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // 2. Obtener lo que pidió el usuario desde el frontend
        const body = await req.json();
        const { userRequest } = body; // Ej: "Quiero un bot de finanzas gruñón"

        // 3. Pedirle a OpenAI que diseñe el agente y devuelva un JSON
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // o gpt-3.5-turbo
            response_format: { type: "json_object" }, // Forzamos a que responda en JSON
            messages: [
                {
                    role: "system",
                    content: `Eres un experto Prompt Engineer. Tu trabajo es diseñar un Agente de IA basado en la solicitud del usuario. 
          Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
          {
            "name": "Un nombre creativo para el agente",
            "role": "El cargo o rol principal",
            "systemPrompt": "Las instrucciones detalladas de cómo debe comportarse este agente, su tono, y sus reglas."
          }`
                },
                {
                    role: "user",
                    content: `Diseña un agente para esta solicitud: "${userRequest}"`
                }
            ],
        });

        // 4. Extraer los datos generados
        const generatedAgent = JSON.parse(completion.choices[0].message.content || "{}");

        // 5. Buscar el ID del usuario actual en la base de datos
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        // 6. Guardar el nuevo agente en Prisma
        const newAgent = await prisma.agent.create({
            data: {
                name: generatedAgent.name,
                role: generatedAgent.role,
                systemPrompt: generatedAgent.systemPrompt,
                userId: dbUser!.id,
            }
        });

        return NextResponse.json({ success: true, agent: newAgent });

    } catch (error) {
        console.error("Error creando el agente:", error);
        return NextResponse.json({ error: "Hubo un error al crear el agente" }, { status: 500 });
    }
}