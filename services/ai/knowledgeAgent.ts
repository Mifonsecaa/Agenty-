import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const KnowledgeItemSchema = z.object({
    content: z.string().describe("El fragmento de conocimiento, hecho, regla o informacion extraida."),
    tags: z.array(z.string()).describe("Etiquetas clave para busqueda (ej. 'precio', 'horario', 'menu')."),
    relevance: z.number().describe("Nivel de importancia del 1 al 10"),
});

// Esquema para la respuesta estructurada del agente extractor
const KnowledgeExtractionSchema = z.object({
    items: z.array(KnowledgeItemSchema).describe("Lista de fragmentos de conocimiento extraidos del documento"),
});

const RoutePlanSchema = z.object({
    documentType: z.enum(["MENU", "PRICING", "HOURS", "POLICY", "GENERAL", "MIXED"]),
    extractionMode: z.enum(["granular", "sectional", "compact"]),
    priorityTags: z.array(z.string()),
    notes: z.string(),
});

export type KnowledgeExtractionResult = z.infer<typeof KnowledgeExtractionSchema>;
type RoutePlan = z.infer<typeof RoutePlanSchema>;

type NormalizedKnowledgeItem = {
    content: string;
    tags: string[];
    relevance: number;
};

const MAX_INPUT_CHARS = 30000;
const RETRY_SECTION_MAX_CHARS = 5000;
const MIN_ITEM_CONTENT_LENGTH = 24;
const MAX_ITEMS_FINAL = 60;
const MAX_ITEMS_PER_SECTION = 14;

export class KnowledgeAgent {
    private openai: OpenAI | null = null;
    private gemini: GoogleGenerativeAI | null = null;
    private splitter: RecursiveCharacterTextSplitter;

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

        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: RETRY_SECTION_MAX_CHARS,
            chunkOverlap: 250,
            separators: ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "],
        });
    }

    private sanitizeText(text: string) {
        return String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
            .replace(/\uFFFD/g, "")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    private trimToModelWindow(text: string) {
        return this.sanitizeText(text).slice(0, MAX_INPUT_CHARS);
    }

    private parseJsonLoose<T>(value: string): T {
        const raw = String(value || "").trim();
        if (!raw) throw new Error("EMPTY_JSON_RESPONSE");
        const cleaned = raw
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();
        return JSON.parse(cleaned) as T;
    }

    private clampRelevance(value: number) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 5;
        return Math.max(1, Math.min(10, Math.round(num)));
    }

    private normalizeItems(items: NormalizedKnowledgeItem[]) {
        const dedup = new Map<string, NormalizedKnowledgeItem>();
        for (const item of items) {
            const content = this.sanitizeText(item.content || "");
            if (content.length < MIN_ITEM_CONTENT_LENGTH) continue;

            const tags = (item.tags || [])
                .map((tag) => this.sanitizeText(tag).toLowerCase())
                .filter((tag) => tag.length >= 2)
                .slice(0, 8);
            const normalizedTags = tags.length > 0 ? Array.from(new Set(tags)) : ["general"];

            const normalized: NormalizedKnowledgeItem = {
                content,
                tags: normalizedTags,
                relevance: this.clampRelevance(item.relevance),
            };

            const key = content.toLowerCase();
            const previous = dedup.get(key);
            if (!previous || normalized.relevance > previous.relevance) {
                dedup.set(key, normalized);
            }
        }

        return Array.from(dedup.values())
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, MAX_ITEMS_FINAL);
    }

    private buildHeuristicRoute(text: string, sourceName: string): RoutePlan {
        const sample = `${sourceName}\n${text.slice(0, 4000)}`.toLowerCase();
        const hasMenu = /(menu|carta|plato|desayuno|almuerzo|cena|bebida)/i.test(sample);
        const hasPricing = /(precio|coste|costo|tarifa|s\/|usd|\$|euros?)/i.test(sample);
        const hasHours = /(horario|lunes|martes|miercoles|jueves|viernes|sabado|domingo|am|pm)/i.test(sample);
        const hasPolicy = /(politica|terminos|condiciones|cancelacion|devolucion|reembolso)/i.test(sample);

        let documentType: RoutePlan["documentType"] = "GENERAL";
        let extractionMode: RoutePlan["extractionMode"] = "sectional";
        const tags = ["general"];

        const trueFlags = [hasMenu, hasPricing, hasHours, hasPolicy].filter(Boolean).length;
        if (trueFlags >= 2) {
            documentType = "MIXED";
            extractionMode = "sectional";
            tags.push("mixed");
        } else if (hasMenu) {
            documentType = "MENU";
            extractionMode = "granular";
            tags.push("menu", "producto");
        } else if (hasPricing) {
            documentType = "PRICING";
            extractionMode = "granular";
            tags.push("precios", "tarifas");
        } else if (hasHours) {
            documentType = "HOURS";
            extractionMode = "compact";
            tags.push("horario");
        } else if (hasPolicy) {
            documentType = "POLICY";
            extractionMode = "sectional";
            tags.push("politicas");
        }

        if (text.length < 1200) {
            extractionMode = "compact";
        }

        return {
            documentType,
            extractionMode,
            priorityTags: Array.from(new Set(tags)),
            notes: "heuristic_route",
        };
    }

    private async splitIntoSections(text: string, maxChars = RETRY_SECTION_MAX_CHARS) {
        const normalized = this.sanitizeText(text);
        if (!normalized) return [];

        const docs = await this.splitter.createDocuments([normalized]);
        return docs
            .map((doc) => this.sanitizeText(doc.pageContent || ""))
            .filter((section) => section.length >= 80)
            .map((section) => section.slice(0, maxChars));
    }

    private shouldRetryBySections(items: NormalizedKnowledgeItem[], originalText: string) {
        const textLen = originalText.length;
        if (items.length === 0) return true;
        if (textLen >= 7000 && items.length <= 2) return true;
        if (textLen >= 12000 && items.length <= 4) return true;
        return false;
    }

    private async decideRoutePlan(text: string, sourceName: string): Promise<RoutePlan> {
        const heuristic = this.buildHeuristicRoute(text, sourceName);
        const planningPrompt = `
Eres un agente planner para ingestion de conocimiento empresarial.
Debes escoger una ruta de extraccion para maximizar calidad y recuperar datos utiles.

Reglas:
1) documentType: MENU, PRICING, HOURS, POLICY, GENERAL o MIXED.
2) extractionMode:
   - granular: items pequenos y especificos.
   - sectional: por secciones coherentes.
   - compact: pocos items de alto valor.
3) priorityTags: entre 2 y 8 etiquetas utiles para retrieval.
4) notes: motivo breve de la eleccion.
`;

        if (this.openai) {
            try {
                const model = process.env.GITHUB_TOKEN ? "gpt-4o" : "gpt-4o-mini";
                const completion = await this.openai.chat.completions.create({
                    model,
                    messages: [
                        { role: "system", content: planningPrompt },
                        { role: "user", content: `Fuente: ${sourceName}\n\nContenido (resumen):\n${text.slice(0, 7000)}` },
                    ],
                    response_format: zodResponseFormat(RoutePlanSchema, "route_plan"),
                    temperature: 0.1,
                });

                const content = completion.choices[0].message.content;
                if (content) {
                    return this.parseJsonLoose<RoutePlan>(content);
                }
            } catch (error) {
                console.warn("[KnowledgeAgent] Planner OpenAI fallback a heuristico:", error);
            }
        }

        if (this.gemini) {
            try {
                const model = this.gemini.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    generationConfig: { responseMimeType: "application/json" },
                });
                const prompt = `${planningPrompt}\n\nDevuelve SOLO JSON valido.\n\nFuente: ${sourceName}\n\nContenido:\n${text.slice(0, 7000)}`;
                const result = await model.generateContent(prompt);
                const raw = result.response.text();
                return this.parseJsonLoose<RoutePlan>(raw);
            } catch (error) {
                console.warn("[KnowledgeAgent] Planner Gemini fallback a heuristico:", error);
            }
        }

        return heuristic;
    }

    private buildExtractionPrompt(sourceName: string, routePlan: RoutePlan) {
        return `
Eres un agente extractor de conocimiento para un sistema RAG.
Debes convertir documentos de negocio en items limpios y accionables.

Fuente: "${sourceName}"
Tipo detectado: ${routePlan.documentType}
Modo de extraccion: ${routePlan.extractionMode}
Etiquetas prioritarias: ${routePlan.priorityTags.join(", ")}
Notas del planner: ${routePlan.notes}

Reglas:
1) Extrae hechos verificables (precios, horarios, reglas, procesos, catalogo, politicas).
2) Evita ruido (relleno legal irrelevante, numeros de pagina, headers repetidos).
3) Cada item debe poder responder preguntas reales de clientes.
4) Etiquetas cortas y utiles para busqueda.
5) relevance de 1 a 10 (10 = dato critico operativo).
6) Si el texto es pobre, devuelve menos items, pero de mejor calidad.
`;
    }

    private async extractKnowledge(text: string, sourceName: string, routePlan: RoutePlan): Promise<KnowledgeExtractionResult> {
        const limitedText = this.trimToModelWindow(text);
        const systemPrompt = this.buildExtractionPrompt(sourceName, routePlan);

        if (this.openai) {
            const model = process.env.GITHUB_TOKEN ? "gpt-4o" : "gpt-4o-mini";
            console.log(`[KnowledgeAgent] Extractor usando modelo ${model}`);

            const completion = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Extrae conocimiento de este texto:\n\n${limitedText}` },
                ],
                response_format: zodResponseFormat(KnowledgeExtractionSchema, "knowledge_extraction"),
                temperature: 0.2,
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("EMPTY_EXTRACTION_RESPONSE");
            return this.parseJsonLoose<KnowledgeExtractionResult>(content);
        }

        if (this.gemini) {
            console.log("[KnowledgeAgent] Extractor usando Gemini 1.5 Flash");
            const model = this.gemini.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" },
            });
            const prompt = `${systemPrompt}\n\nDevuelve SOLO JSON con este esquema: { "items": [{ "content": "...", "tags": ["..."], "relevance": 1 }] }\n\nTexto:\n${limitedText}`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return this.parseJsonLoose<KnowledgeExtractionResult>(responseText);
        }

        return {
            items: [{ content: limitedText, tags: ["raw", "fallback"], relevance: 5 }],
        };
    }

    async processDocument(text: string, sourceName: string): Promise<KnowledgeExtractionResult> {
        const cleanText = this.trimToModelWindow(text);
        console.log(`[KnowledgeAgent] Procesando documento "${sourceName}" en modo agentico...`);

        if (!cleanText) {
            return { items: [{ content: "Documento vacio o no legible.", tags: ["error", "empty"], relevance: 1 }] };
        }

        try {
            const routePlan = await this.decideRoutePlan(cleanText, sourceName);
            console.log(`[KnowledgeAgent] Route plan => ${routePlan.documentType}/${routePlan.extractionMode}`);

            const initial = await this.extractKnowledge(cleanText, sourceName, routePlan);
            let normalized = this.normalizeItems(initial.items as NormalizedKnowledgeItem[]);

            if (this.shouldRetryBySections(normalized, cleanText)) {
                console.log("[KnowledgeAgent] Calidad baja en primera pasada, activando reintento por secciones...");
                const sections = await this.splitIntoSections(cleanText);
                const merged: NormalizedKnowledgeItem[] = [...normalized];

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    if (!section || section.length < 100) continue;
                    try {
                        const sectionPlan: RoutePlan = {
                            ...routePlan,
                            extractionMode: routePlan.extractionMode === "compact" ? "compact" : "sectional",
                            notes: `section_retry_${i + 1}`,
                        };
                        const partial = await this.extractKnowledge(section, `${sourceName} [seccion ${i + 1}]`, sectionPlan);
                        const partialItems = this.normalizeItems(partial.items as NormalizedKnowledgeItem[]).slice(0, MAX_ITEMS_PER_SECTION);
                        merged.push(...partialItems);
                    } catch (sectionError) {
                        console.warn(`[KnowledgeAgent] Fallo section_retry_${i + 1}:`, sectionError);
                    }
                }

                normalized = this.normalizeItems(merged);
            }

            if (normalized.length === 0) {
                return {
                    items: [{ content: cleanText, tags: ["raw", "fallback"], relevance: 5 }],
                };
            }

            return { items: normalized };
        } catch (error) {
            console.error("[KnowledgeAgent] Error en pipeline agentico:", error);
            return {
                items: [{ content: cleanText, tags: ["raw", "fallback"], relevance: 5 }],
            };
        }
    }
}

export const knowledgeAgent = new KnowledgeAgent();

