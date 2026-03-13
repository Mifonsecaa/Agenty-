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


    // Utility to clean strings for PostgreSQL
    private cleanString(str: string): string {
        if (!str) return "";
        // Remove null bytes and other non-printable control characters (except newline \n, return \r, tab \t)
        // \x00-\x08 (null to backspace)
        // \x0B-\x0C (vertical tab, form feed)
        // \x0E-\x1F (shift out, etc)
        // \x7F (delete) - Optional, but 0x00 is the critical one for Postgres
        return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
    }

    async ingestText(businessId: string, text: string, metadata: any = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        // Ensure initial text is clean
        const cleanText = this.cleanString(text);
        console.log(`[Ingestion] Tamaño del texto limpio: ${cleanText.length} caracteres`);

        try {
            // 0. Eliminar versiones anteriores del mismo documento (Update Logic)
            if (metadata.fileName) {
                console.log(`[Ingestion] Eliminando versiones anteriores de: ${metadata.fileName}`);
                await prisma.knowledgeItem.deleteMany({
                    where: {
                        businessId,
                        metadata: {
                            path: ['fileName'],
                            equals: metadata.fileName
                        }
                    }
                });
            }

            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([cleanText]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);

            // 2. Procesar cada fragmento
            let processedItems = 0;
            
            // Clean metadata values
            const cleanMetadata = Object.entries(metadata).reduce((acc: any, [key, val]) => {
                acc[key] = typeof val === 'string' ? this.cleanString(val) : val;
                return acc;
            }, {});

            for (const doc of docs) {
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${docs.length}...`);
                const embedding = await this.embeddings.embedQuery(doc.pageContent);
                
                // 3. Guardar en la DB con el vector
                const cleanContent = this.cleanString(doc.pageContent);
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                
                await prisma.knowledgeItem.create({
                    data: {
                        businessId,
                        content: cleanContent,
                        embedding: embedding, // Saving as JSON array directly
                        metadata: {
                            ...cleanMetadata,
                            fileName: cleanMetadata.fileName || "unknown", // Assert fileName is in metadata
                            source: cleanMetadata.source || "manual_ingestion"
                        }
                    }
                });


                console.log(`[Ingestion] Chunk ${processedItems + 1} guardado correctamente.`);
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

    async deleteKnowledgeItem(itemId: string, businessId: string) {
        return await prisma.knowledgeItem.deleteMany({
            where: { id: itemId, businessId }
        });
    }
}

export const ingestionService = new IngestionService();
