// app/api/agents/create/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { enforceAgentCreationPolicy } from "@/lib/auth/access-control";
// Importa tus opciones de auth si las tienes en otro archivo, ej: import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
        // 1. Verificar que el usuario esté logueado
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // 2. Obtener lo que pidió el usuario desde el frontend
        const body = await req.json();
        const { userRequest } = body; // Ej: "Quiero un bot de finanzas gruñón"
        if (!userRequest || typeof userRequest !== "string" || userRequest.trim().length < 5) {
            return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
        }

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return NextResponse.json({ error: "OPENAI_API_KEY no configurada en este entorno." }, { status: 503 });
        }

        const openai = new OpenAI({ apiKey: openaiKey });

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

        if (!dbUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const access = await enforceAgentCreationPolicy(dbUser.id, session.user.email);
        if (!access.allowed) {
            return NextResponse.json(
                {
                    error: access.reason || "No tienes permiso para crear agentes.",
                    trialEndsAt: access.trialEndsAt,
                    remainingDays: access.remainingDays,
                },
                { status: access.status }
            );
        }

        // 6. Guardar el nuevo agente usando el modelo Business (el proyecto no tiene modelo Agent)
        const newAgent = await prisma.business.create({
            data: {
                name: generatedAgent.name || "Nuevo Agente",
                userId: dbUser.id,
                config: {
                    role: generatedAgent.role || "Asistente virtual",
                    systemPrompt: generatedAgent.systemPrompt || "Eres un asistente útil y amable.",
                    source: "agents/create",
                    requestedBy: userRequest,
                },
            }
        });

        return NextResponse.json({ success: true, agent: newAgent });

    } catch (error) {
        console.error("Error creando el agente:", error);
        return NextResponse.json({ error: "Hubo un error al crear el agente" }, { status: 500 });
    }
}