import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { prisma } from "@/lib/prisma";

export const createKnowledgeTool = (businessId: string) => {
    return new DynamicStructuredTool({
        name: "knowledge_search",
        description: "Search in the business knowledge base for specific information about products, prices, policies, or general business rules. Use this whenever you are unsure about an answer or need official data.",
        schema: z.object({
            query: z.string().describe("The search query to find relevant information in the knowledge base."),
        }),
        func: async ({ query }) => {
            try {
                console.log(`[KnowledgeTool] Searching for: "${query}" (Business: ${businessId})`);

                const embeddings = new OpenAIEmbeddings({
                    modelName: "text-embedding-3-small",
                });

                // 1. Generar embedding para la consulta
                const queryEmbedding = await embeddings.embedQuery(query);

                const parseVectorText = (value: string | null): number[] | null => {
                    if (!value) return null;
                    const trimmed = value.trim();
                    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
                    const nums = trimmed
                        .slice(1, -1)
                        .split(",")
                        .map((n) => Number(n.trim()))
                        .filter((n) => Number.isFinite(n));
                    return nums.length ? nums : null;
                };

                // 2. Búsqueda semántica en JS vanilla (Fallback sin PGVector)
                console.log("[KnowledgeTool] Fetching all items for JS cosine similarity...");

                const allItems = await prisma.$queryRaw<Array<{
                    content: string;
                    metadata: unknown;
                    embedding: string | null;
                }>>`
                    SELECT content, metadata, embedding::text AS embedding
                    FROM "KnowledgeItem"
                    WHERE "businessId" = ${businessId}
                    LIMIT 500
                `;

                if (!allItems || allItems.length === 0) {
                     return "No hay información en la base de conocimientos.";
                }

                // Función simple de similitud coseno
                const cosineSimilarity = (a: number[], b: number[]) => {
                    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
                    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
                    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
                    return dotProduct / (magnitudeA * magnitudeB);
                };

                const results = allItems
                    .map(item => {
                        const embedding = parseVectorText(item.embedding);
                        if (!embedding || !Array.isArray(embedding)) return { ...item, similarity: 0 };
                        return {
                            ...item,
                            similarity: cosineSimilarity(queryEmbedding, embedding)
                        };
                    })
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, 4);

                if (!results || results.length === 0) {
                    return "No se encontró información relevante en la base de conocimientos. Por favor, intenta ser más específico o informa al usuario que no tienes ese dato exacto.";
                }

                // 3. Formatear resultados para el agente
                const context = results
                    .filter(r => r.similarity > 0.3) // Filtro de calidad mínimo
                    .map(r => {
                        let text = `- ${r.content}`;
                        const meta = (r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata))
                            ? (r.metadata as Record<string, unknown>)
                            : {};
                        if (meta.fileUrl) {
                            text += `\n\n[FILE AVAILABLE]: This content is associated with a file. If the user asks for the document, image, or file related to this, you MUST include this tag at the end of your response: [MEDIA_URL: ${meta.fileUrl}]`;
                        }
                        return text;
                    })
                    .join("\n\n");

                return context || "La búsqueda no devolvió resultados lo suficientemente similares.";
            } catch (error) {
                console.error("[KnowledgeTool] Error:", error);
                return "Hubo un error al acceder a la base de conocimientos.";
            }
        },
    });
};
