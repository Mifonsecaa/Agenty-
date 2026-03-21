import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { BusinessConfigSchema, BusinessConfig } from "../../types/ai";

export async function generateBusinessConfig(userInput: string): Promise<BusinessConfig> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `
    Eres el arquitecto de datos de 'brainia', una plataforma de automatización para PyMEs.
    Tu objetivo es leer la descripción que hace el dueño sobre su negocio y extraer absolutamente todas las reglas, horarios y precios.
    
    REGLAS ESTRICTAS DE EXTRACCIÓN:
    1. EXTRACCIÓN DE PRECIOS Y PRODUCTOS: Todo lo relacionado a productos, precios (ej. 'cortes a 5k'), reglas de domicilio o requerimientos especiales DEBE extraerse y guardarse en el campo 'businessDescription'. ¡No omitas ningún precio o servicio!
    2. HORARIOS: Si el cliente dice 'Lunes a Domingo', debes incluir los días [1, 2, 3, 4, 5, 6, 7] en 'daysOfWeek'. Extrae correctamente las horas en formato HH:mm (ej. 7am es 07:00, 7pm es 19:00). Crea los bloques de 'schedules' que sean necesarios.
    3. CAPACIDAD: Si es un salón de belleza, taller o consultorio, 'maxCapacity' es 1 (citas individuales). Si es un gimnasio, 'maxCapacity' > 1.
    4. TONO: Infiere el 'agentTone' para que el bot futuro sea empático.
  `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            response_format: zodResponseFormat(BusinessConfigSchema, "business_config"),
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No parsed response from OpenAI");
        }

        const config = JSON.parse(content) as BusinessConfig;
        return config;

    } catch (error) {
        console.error("Error generating business config with OpenAI:", error);
        throw new Error("Fallo al procesar el texto del negocio con Inteligencia Artificial.");
    }
}