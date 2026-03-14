import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Esquema para la respuesta estructurada del agente
const KnowledgeExtractionSchema = z.object({
    items: z.array(z.object({
        content: z.string().describe("El fragmento de conocimiento, hecho, regla o información extraída."),
        tags: z.array(z.string()).describe("Etiquetas clave para búsqueda (ej. 'precio', 'horario', 'menú')."),
        relevance: z.number().describe("Nivel de importancia del 1 al 10")
    })).describe("Lista de fragmentos de conocimiento extraídos del documento")
});

export type KnowledgeExtractionResult = z.infer<typeof KnowledgeExtractionSchema>;

export class KnowledgeAgent {
    private openai: OpenAI | null = null;
    private gemini: GoogleGenerativeAI | null = null;

    constructor() {
        // Inicializamos clientes según disponibilidad, priorizando GitHub/OpenAI
        if (process.env.GITHUB_TOKEN) {
            this.openai = new OpenAI({
                baseURL: "https://models.inference.ai.azure.com",
                apiKey: process.env.GITHUB_TOKEN
            });
        } else if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        
        if (process.env.GEMINI_API_KEY) {
            this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
    }

    async processDocument(text: string, sourceName: string): Promise<KnowledgeExtractionResult> {
        console.log(`[KnowledgeAgent] Procesando documento "${sourceName}" de forma agéntica...`);
        
        const systemPrompt = `
            Eres un Experto en Gestión del Conocimiento (Knowledge Manager) para Agentes de IA.
            Tu tarea es leer documentos de negocios (PDFs, TXTs, Menús, Reglas) y "atomizar" el conocimiento.
            
            En lugar de cortar el texto ciegamente, debes:
            1. Entender el significado semántico.
            2. Extraer reglas claras, listas de precios, horarios y descripciones como items independientes.
            3. Si hay un menú, crea un item por categoría o grupo de platos, no cortes un plato a la mitad.
            4. Ignora pies de página, numeración irrelevante o texto legal genérico sin valor operativo.
            
            Documento Fuente: "${sourceName}"
        `;

        // Versión OpenAI / GitHub
        if (this.openai) {
            try {
                const model = process.env.GITHUB_TOKEN ? "gpt-4o" : "gpt-4o-mini";
                console.log(`[KnowledgeAgent] Usando modelo ${model} (OpenAI/GitHub)`);

                const completion = await this.openai.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Analiza y extrae el conocimiento de este texto:\n\n${text.substring(0, 30000)}` } // Límite de seguridad
                    ],
                    response_format: zodResponseFormat(KnowledgeExtractionSchema, "knowledge_extraction"),
                    temperature: 0.3
                });

                const content = completion.choices[0].message.content;
                if (!content) throw new Error("Respuesta vacía del modelo");
                
                return JSON.parse(content);
            } catch (error) {
                console.error("[KnowledgeAgent] Error con OpenAI/GitHub:", error);
                // Fallback a lógica simple si falla el agente
            }
        }

        // Fallback Gemini (Más manual porque structured output es diferente en cada versión SDK)
        if (this.gemini) {
             try {
                console.log(`[KnowledgeAgent] Usando modelo Gemini 1.5 Flash`);
                const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
                
                const prompt = `${systemPrompt}\n\nExtrae los items en formato JSON compatible con este esquema: { items: [{ content: string, tags: string[], relevance: number }] }\n\nTexto:\n${text.substring(0, 30000)}`;
                
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                return JSON.parse(responseText);
             } catch (error) {
                 console.error("[KnowledgeAgent] Error con Gemini:", error);
             }
        }

        // Si todo falla, devolvemos un chunk gigante (fallback legacy)
        return {
            items: [{
                content: text,
                tags: ["raw", "fallback"],
                relevance: 5
            }]
        };
    }
}

export const knowledgeAgent = new KnowledgeAgent();

