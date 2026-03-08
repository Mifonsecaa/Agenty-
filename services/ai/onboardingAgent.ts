import { GoogleGenAI, Type } from "@google/genai";
import { BusinessConfig } from "../../types/ai";

export async function generateBusinessConfig(userInput: string): Promise<BusinessConfig> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nDescripción del dueño: ${userInput}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        businessType: {
                            type: Type.STRING,
                            description: "Tipo de negocio (GROUP_CLASSES o INDIVIDUAL_APPOINTMENTS)"
                        },
                        businessName: {
                            type: Type.STRING,
                            description: "El nombre del negocio inferido del texto"
                        },
                        schedules: {
                            type: Type.ARRAY,
                            description: "Lista de todos los horarios disponibles",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    activityName: { type: Type.STRING, description: "Nombre del servicio, ej: 'Crossfit'" },
                                    daysOfWeek: {
                                        type: Type.ARRAY,
                                        items: { type: Type.INTEGER },
                                        description: "Días de la semana, donde 1 es Lunes"
                                    },
                                    startTime: { type: Type.STRING, description: "Hora de inicio HH:mm" },
                                    endTime: { type: Type.STRING, description: "Hora de fin HH:mm" },
                                    maxCapacity: { type: Type.INTEGER, description: "Capacidad máxima del turno/clase" }
                                }
                            }
                        },
                        agentTone: {
                            type: Type.STRING,
                            description: "El tono que debe usar el bot"
                        },
                        defaultDurationMinutes: {
                            type: Type.INTEGER,
                            description: "Duración en minutos de un turno estándar"
                        }
                    },
                    required: ["businessType", "businessName", "schedules", "agentTone", "defaultDurationMinutes"]
                }
            }
        });

        if (!response.text) {
            throw new Error("No response from Gemini");
        }

        const config = JSON.parse(response.text) as BusinessConfig;
        return config;

    } catch (error) {
        console.error("Error generating business config with Gemini:", error);
        throw new Error("Fallo al procesar el texto del negocio con Inteligencia Artificial.");
    }
}