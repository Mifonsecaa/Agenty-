import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { prisma } from "@/lib/prisma";

const TOOL_RAG_CANDIDATES = Number(process.env.RAG_TOOL_RETRIEVAL_CANDIDATES || 12);
const TOOL_RAG_TOP_K = Number(process.env.RAG_TOOL_TOP_K || 4);
const TOOL_RAG_MIN_SCORE = Number(process.env.RAG_TOOL_MIN_SCORE || 0.58);

function normalizeForMatch(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u017F\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractTerms(value: string) {
    return normalizeForMatch(value)
        .split(" ")
        .filter((term) => term.length >= 3)
        .slice(0, 20);
}

function lexicalOverlapScore(queryTerms: string[], content: string) {
    if (!queryTerms.length || !content) return 0;
    const normalized = normalizeForMatch(content);
    let hits = 0;
    for (const term of queryTerms) {
        if (normalized.includes(term)) hits += 1;
    }
    return hits / queryTerms.length;
}

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

                const vectorStr = `[${queryEmbedding.join(",")}]`;
                const queryTerms = extractTerms(query);
                const limitCandidates = Math.max(4, Math.min(20, TOOL_RAG_CANDIDATES));
                const topK = Math.max(1, Math.min(8, TOOL_RAG_TOP_K));

                // 2. Búsqueda semántica primaria con pgvector.
                const candidates = await prisma.$queryRaw<Array<{
                    content: string;
                    metadata: unknown;
                    distance: number;
                }>>`
                    SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
                    FROM "KnowledgeItem"
                    WHERE "businessId" = ${businessId}
                      AND embedding IS NOT NULL
                    ORDER BY embedding <-> ${vectorStr}::vector
                    LIMIT ${limitCandidates}
                `;

                if (!candidates || candidates.length === 0) {
                     return "No hay información en la base de conocimientos.";
                }

                const results = candidates
                    .map(item => {
                        const vectorScore = Math.max(0, 1 - Number(item.distance || 2));
                        const lexicalScore = lexicalOverlapScore(queryTerms, item.content || "");
                        return {
                            ...item,
                            similarity: vectorScore * 0.72 + lexicalScore * 0.28,
                        };
                    })
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, topK);

                if (!results || results.length === 0) {
                    return "No se encontró información relevante en la base de conocimientos. Por favor, intenta ser más específico o informa al usuario que no tienes ese dato exacto.";
                }

                // 3. Formatear resultados para el agente
                const context = results
                    .filter(r => r.similarity >= TOOL_RAG_MIN_SCORE)
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
