import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveRagContext } from "@/lib/rag/retriever";

const TOOL_RAG_MIN_SCORE = Number(process.env.RAG_TOOL_MIN_SCORE || 0.58);

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

                const retrieval = await retrieveRagContext({ businessId, query });
                const results = retrieval.selected.filter((item) => item.combinedScore >= TOOL_RAG_MIN_SCORE);

                if (!results.length) {
                     return "No hay información en la base de conocimientos.";
                }

                // 3. Formatear resultados para el agente
                const context = results
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
