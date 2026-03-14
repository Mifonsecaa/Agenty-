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
                const vectorString = `[${queryEmbedding.join(",")}]`;

                // 2. Búsqueda semántica en PGVector (Aislamiento por businessId garantizado)
                // Usamos <=> para distancia de coseno (menor es más similar)
                const results = await prisma.$queryRawUnsafe<any[]>(`
          SELECT content, metadata, (1 - (embedding <=> '${vectorString}'::vector)) as similarity
          FROM "KnowledgeItem"
          WHERE "businessId" = $1
          ORDER BY embedding <=> '${vectorString}'::vector
          LIMIT 4;
        `, businessId);

                if (!results || results.length === 0) {
                    return "No se encontró información relevante en la base de conocimientos. Por favor, intenta ser más específico o informa al usuario que no tienes ese dato exacto.";
                }

                // 3. Formatear resultados para el agente
                const context = results
                    .filter(r => r.similarity > 0.3) // Filtro de calidad mínimo
                    .map(r => {
                        let text = `- ${r.content}`;
                        const meta = r.metadata || {};
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
