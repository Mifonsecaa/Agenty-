import { NextResponse } from "next/server";
import OpenAI from "openai";
import { improveDescriptionSchema, type ImproveDescriptionInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";

export async function POST(req: Request) {
    try {
        // En este caso, permitimos que sea público para que el usuario pueda probarlo antes de loguearse
        const body = await req.json();
        const validation = validateData<ImproveDescriptionInput>(body, improveDescriptionSchema);
        
        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        const { text } = validation.data!;

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

        return successResponse({ improved });

    } catch (error) {
        console.error("Error improving description:", error);
        return serverErrorResponse("Error al mejorar el texto");
    }
}
