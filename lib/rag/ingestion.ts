import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createHash } from "crypto";
import { invalidateAiCachesForBusiness } from "@/lib/ai";
import { invalidateRagRetrieverCacheForBusiness } from "@/lib/rag/retriever";
import { inferLayerFromMetadata } from "@/lib/rag/layers";

type IngestionMetadata = {
    source?: string;
    sourceId?: string;
    fileName?: string;
    fileType?: string;
    title?: string;
    url?: string | null;
    lang?: string;
    [key: string]: unknown;
};

function normalizeContent(value: string) {
    return value
        .replace(/\r\n/g, "\n")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/\uFFFD/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function sanitizeMetadata(value: unknown): unknown {
    if (typeof value === "string") {
        return normalizeContent(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeMetadata(item));
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeMetadata(v)]);
        return Object.fromEntries(entries);
    }
    return value;
}

function hashText(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

function estimateTokenCount(value: string) {
    return Math.max(1, Math.ceil(value.length / 4));
}

function detectLang(value: string) {
    return /[\u00C0-\u017F]|\b(el|la|los|las|de|para|con|sin|que|por)\b/i.test(value) ? "es" : "unknown";
}

function buildSourceId(businessId: string, metadata: IngestionMetadata) {
    if (typeof metadata.sourceId === "string" && metadata.sourceId.trim()) {
        return metadata.sourceId.trim();
    }

    const seed = [
        metadata.url || "",
        metadata.fileName || "",
        metadata.title || "",
        metadata.source || "manual_ingestion",
    ].join("|");

    if (!seed.replace(/\|/g, "").trim()) {
        return `manual:${businessId}`;
    }

    return `src:${hashText(seed).slice(0, 16)}`;
}

export class IngestionService {
    private splitter: RecursiveCharacterTextSplitter;
    private embeddings: OpenAIEmbeddings;

    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: Number(process.env.RAG_CHUNK_SIZE || 700),
            chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP || 120),
            separators: ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "],
        });
        this.embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        });
    }

    async ingestText(businessId: string, text: string, metadata: IngestionMetadata = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        console.log(`[Ingestion] Tamaño del texto: ${text.length} caracteres`);

        try {
            const normalizedText = normalizeContent(text || "");
            if (!normalizedText) {
                throw new Error("EMPTY_TEXT_AFTER_NORMALIZATION");
            }

            const minChunkChars = Number(process.env.RAG_MIN_CHUNK_CHARS || 60);
            const sourceId = buildSourceId(businessId, metadata);
            const inferredLayer = inferLayerFromMetadata(metadata as Record<string, unknown>);

            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([normalizedText]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);

            const candidateChunks = docs
                .map((doc) => normalizeContent(doc.pageContent || ""))
                .filter((chunk) => chunk.length >= minChunkChars);

            if (!candidateChunks.length) {
                throw new Error("NO_VALID_CHUNKS");
            }

            // Deduplicacion intra-documento por hash de contenido normalizado.
            const localDedup = new Set<string>();
            const dedupedChunks: Array<{ content: string; hash: string }> = [];
            for (const chunk of candidateChunks) {
                const contentHash = hashText(chunk);
                if (localDedup.has(contentHash)) continue;
                localDedup.add(contentHash);
                dedupedChunks.push({ content: chunk, hash: contentHash });
            }

            // Deduplicacion contra chunks ya ingestados para el mismo sourceId.
            const existing = await prisma.knowledgeItem.findMany({
                where: {
                    businessId,
                    metadata: {
                        path: ["sourceId"],
                        equals: sourceId,
                    },
                },
                select: { metadata: true },
                take: 3000,
                orderBy: { createdAt: "desc" },
            });

            const existingHashes = new Set<string>();
            for (const row of existing) {
                const meta = row.metadata;
                if (meta && typeof meta === "object" && !Array.isArray(meta)) {
                    const hash = (meta as Record<string, unknown>).contentHash;
                    if (typeof hash === "string" && hash) {
                        existingHashes.add(hash);
                    }
                }
            }

            const finalChunks = dedupedChunks.filter((chunk) => !existingHashes.has(chunk.hash));
            if (!finalChunks.length) {
                console.log("[Ingestion] Todos los chunks ya existian para sourceId. Se omite ingesta.");
                return 0;
            }

            console.log(`[Ingestion] Generando embeddings batch para ${finalChunks.length} chunks...`);
            const embeddings = await this.embeddings.embedDocuments(finalChunks.map((chunk) => chunk.content));
            if (embeddings.length !== finalChunks.length) {
                throw new Error("EMBEDDING_BATCH_SIZE_MISMATCH");
            }

            // 2. Procesar cada fragmento
            let processedItems = 0;
            for (const [index, chunk] of finalChunks.entries()) {
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${finalChunks.length}...`);
                const embedding = embeddings[index];
                const vectorString = `[${embedding.join(",")}]`;

                // 3. Guardar en la DB con el vector
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                // @ts-ignore - Prisma types might be out of sync
                const knowledgeItem = await prisma.knowledgeItem.create({
                    data: {
                        businessId,
                        content: chunk.content,
                        metadata: sanitizeMetadata({
                            ...metadata,
                            source: metadata.source || "manual_ingestion",
                            sourceId,
                            chunkIndex: processedItems,
                            contentHash: chunk.hash,
                            tokenCount: estimateTokenCount(chunk.content),
                            title: typeof metadata.title === "string" && metadata.title.trim()
                                ? metadata.title
                                : (typeof metadata.fileName === "string" ? metadata.fileName : "document"),
                            fileType: metadata.fileType || metadata.type || "txt",
                            layer: typeof metadata.layer === "string" && metadata.layer.trim()
                                ? metadata.layer.trim().toLowerCase()
                                : inferredLayer,
                            lang: typeof metadata.lang === "string" ? metadata.lang : detectLang(chunk.content),
                            ingestedAt: new Date().toISOString(),
                        }) as Prisma.InputJsonValue
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

            console.log(`[Ingestion] Ingesta completada con éxito: ${processedItems} items.`);
            invalidateAiCachesForBusiness(businessId);
            invalidateRagRetrieverCacheForBusiness(businessId);
            return processedItems;
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
            where: {
                id: itemId,
                businessId,
            }
        });
    }

    async deleteKnowledgeItems(itemIds: string[], businessId: string) {
        if (itemIds.length === 0) {
            return { count: 0 };
        }

        return await prisma.knowledgeItem.deleteMany({
            where: {
                businessId,
                id: { in: itemIds },
            }
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
                        layer: typeof metadata.layer === "string" && metadata.layer.trim()
                            ? metadata.layer.trim().toLowerCase()
                            : inferLayerFromMetadata({ ...metadata, tags: item.tags }),
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
