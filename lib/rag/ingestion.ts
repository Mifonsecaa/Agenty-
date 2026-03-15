import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { prisma } from "@/lib/prisma";

export class IngestionService {
    private splitter: RecursiveCharacterTextSplitter;
    private embeddings: OpenAIEmbeddings;

    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 600,
            chunkOverlap: 100,
        });
        this.embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        });
    }

    async ingestText(businessId: string, text: string, metadata: any = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        console.log(`[Ingestion] Tamaño del texto: ${text.length} caracteres`);

        try {
            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([text]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);

            // 2. Procesar cada fragmento
            let processedItems = 0;
            for (const doc of docs) {
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${docs.length}...`);
                const embedding = await this.embeddings.embedQuery(doc.pageContent);
                const vectorString = `[${embedding.join(",")}]`;

                // 3. Guardar en la DB con el vector
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                // @ts-ignore - Prisma types might be out of sync
                const knowledgeItem = await prisma.knowledgeItem.create({
                    data: {
                        businessId,
                        content: doc.pageContent,
                        metadata: {
                            ...metadata,
                            source: metadata.source || "manual_ingestion"
                        }
                    }
                });

                console.log(`[Ingestion] Actualizando embedding para item ID: ${knowledgeItem.id}`);
                try {
                    await prisma.$executeRawUnsafe(
                        `UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`,
                        vectorString,
                        knowledgeItem.id
                    );
                } catch (vectorError: any) {
                    console.warn(`[Ingestion] Warning: No se pudo guardar el vector para item ${knowledgeItem.id}. ¿pgvector instalado?`, vectorError.message);
                    // Intentamos fallback a JSON si la columna es JSON (por compatibilidad temporal)
                    try {
                         await prisma.$executeRawUnsafe(
                            `UPDATE "KnowledgeItem" SET embedding = $1::jsonb WHERE id = $2`,
                            vectorString,
                            knowledgeItem.id
                        );
                    } catch (jsonError) {
                        // Ignoramos si también falla
                    }
                }
                processedItems++;
            }

            console.log(`[Ingestion] Ingesta completada con éxito: ${docs.length} items.`);
            return docs.length;
        } catch (error: any) {
            console.error("[Ingestion] Error durante la ingesta:", error);
            throw error;
        }
    }

    async deleteAllKnowledge(businessId: string) {
        return await prisma.knowledgeItem.deleteMany({
            where: { businessId }
        });
    }

    async ingestStructuredKnowledge(businessId: string, item: { content: string, tags: string[], relevance: number }, metadata: any = {}) {
        console.log(`[Ingestion] Ingesting Structured Knowledge Chunk for business ${businessId} (Content size: ${item.content.length}, tags: ${item.tags.join(',')})`);

        try {
            // Generar embedding (que es obligatorio para vector store)
            const embedding = await this.embeddings.embedQuery(item.content);
            const vectorString = `[${embedding.join(",")}]`;

            // Guardar en DB con metadatos enriquecidos por el Agente
            const knowledgeItem = await prisma.knowledgeItem.create({
                data: {
                    businessId,
                    content: item.content,
                    metadata: {
                        ...metadata,
                        tags: item.tags,
                        relevance: item.relevance,
                        isAgentGenerated: true,
                        source: metadata.source || "agent_ingestion"
                    }
                }
            });

            // Actualizar vector
            await prisma.$executeRawUnsafe(
                `UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`,
                vectorString,
                knowledgeItem.id
            );
            
            return knowledgeItem;
        } catch (error) {
            console.error("[Ingestion] Error ingesting structured chunk:", error);
            throw error;
        }
    }
}

export const ingestionService = new IngestionService();
