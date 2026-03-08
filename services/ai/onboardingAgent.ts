import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { BusinessConfigSchema, BusinessConfig } from "../../types/ai";

export async function generateBusinessConfig(userInput: string): Promise<BusinessConfig> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `
    Eres el arquitecto de datos de 'Agenty', una plataforma de automatización para PyMEs.
    Tu objetivo es leer la descripción que hace el dueño sobre su negocio y extraer las reglas de agendamiento.
    
    REGLAS ESTRICTAS:
    - Asume que el negocio está en Colombia (zona horaria America/Bogota).
    - Si el dueño menciona un tono local (ej. Medellín, Bogotá), ajusta el 'agentTone' para que el bot futuro sea empático con esa región.
    - Si es un salón de belleza, taller o consultorio, 'maxCapacity' suele ser 1 (citas individuales).
    - Si es un centro de entrenamiento o gimnasio, 'maxCapacity' es mayor a 1 (clases grupales).
  `;

    try {
        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            response_format: zodResponseFormat(BusinessConfigSchema, "business_config"),
        });

        const config = response.choices[0].message.parsed;

        if (!config) {
            throw new Error("No parsed response from OpenAI");
        }

        return config;

    } catch (error) {
        console.error("Error generating business config with OpenAI:", error);
        throw new Error("Fallo al procesar el texto del negocio con Inteligencia Artificial.");
    }
}