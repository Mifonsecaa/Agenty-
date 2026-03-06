import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { BusinessConfigSchema, BusinessConfig } from "../../types/ai";

// MOCK: Comentado el cliente de OpenAI temporalmente para desarrollo visual
// const openai = new OpenAI();

export async function generateBusinessConfig(userInput: string): Promise<BusinessConfig> {
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
        // MOCK LOGIC: Generamos una configuración simulada (dummy data) basada levemente en el texto de entrada.
        // En un entorno de producción, esto sería reemplazado por la llamada real a openai.beta.chat.completions.parse

        const lowerInput = userInput.toLowerCase();
        let generatedName = "Asistente Virtual";

        // Smarter heuristic for generating a name on the fly without an LLM
        if (lowerInput.includes("pizza") || lowerInput.includes("restaurante")) {
            generatedName = "Agente de Restaurante";
        } else if (lowerInput.includes("clinic") || lowerInput.includes("dental") || lowerInput.includes("salud")) {
            generatedName = "Recepcionista Médica";
        } else if (lowerInput.includes("ferreter") || lowerInput.includes("repuesto") || lowerInput.includes("auto")) {
            generatedName = "Especialista Automotriz";
        } else if (lowerInput.includes("abogad") || lowerInput.includes("legal")) {
            generatedName = "Agente Legal AI";
        } else if (lowerInput.includes("ropa") || lowerInput.includes("zapatos") || lowerInput.includes("tienda")) {
            generatedName = "Asesor de Ventas";
        } else {
            // Attempt to extract capitalized words for a proper name
            const capitalizedWords = userInput.match(/[A-Z][a-z]+/g);
            if (capitalizedWords && capitalizedWords.length > 0) {
                generatedName = `Agente de ${capitalizedWords[0]}`;
            }
        }

        const mockConfig: any = {
            name: generatedName,
            businessType: "INDIVIDUAL_APPOINTMENTS",
            businessName: generatedName,
            schedules: [
                {
                    activityName: "Atención al Cliente",
                    daysOfWeek: [1, 2, 3, 4, 5, 6],
                    startTime: "08:00",
                    endTime: "20:00",
                    maxCapacity: 1
                }
            ],
            agentTone: "Amable, conversacional y muy servicial.",
            defaultDurationMinutes: 30,

            // Atributos extra para el Dashboard Visual
            systemPrompt: `Eres '${generatedName}'. Tu objetivo principal es ayudar a los clientes basados en la siguiente descripción del dueño: "${userInput.substring(0, 100)}...". Eres extremadamente amable y usas emojis acorde al contexto. Nunca hables de temas fuera del negocio.`,
            greeting: `¡Hola! Soy el asistente virtual de ${generatedName}. ¿En qué te ayudo hoy?`,

            // Lógica simple para simular recomendaciones de Tools
            recommendedTools: []
        };

        if (userInput.toLowerCase().includes("calend")) mockConfig.recommendedTools.push(1); // Calendar
        if (userInput.toLowerCase().includes("pago") || userInput.toLowerCase().includes("cobrar")) mockConfig.recommendedTools.push(2); // Pago
        if (userInput.toLowerCase().includes("gmail") || userInput.toLowerCase().includes("correo")) mockConfig.recommendedTools.push(4); // Correo
        if (userInput.toLowerCase().includes("inventario") || userInput.toLowerCase().includes("stock")) mockConfig.recommendedTools.push(3); // Shopify

        // Simulamos un pequeño retraso de red ("pensando...")
        await new Promise(resolve => setTimeout(resolve, 1500));

        return mockConfig;

    } catch (error) {
        console.error("Error en el Onboarding Agent Mock:", error);
        throw new Error("Fallo al procesar el texto del negocio (Mock).");
    }
}