import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { prisma } from "@/lib/prisma";
import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "@/lib/rag/queue";
import {
    applyCellUpdatesToWorkbookBuffer,
    extractSpreadsheetText,
    isSpreadsheetFileName,
    normalizeSpreadsheetCellAddress,
} from "@/lib/knowledge/spreadsheet";
import { replaceKnowledgeFileByPublicUrl } from "@/lib/storage/knowledge-files";
import path from "path";
import { readFile, writeFile } from "fs/promises";

const TOOL_RAG_MIN_SCORE = Number(process.env.RAG_TOOL_MIN_SCORE || 0.58);

type SpreadsheetFileRef = {
    fileUrl: string;
    fileName: string;
    fileType: string;
};

function isSpreadsheetMeta(fileName?: string, fileType?: string) {
    if (isSpreadsheetFileName(fileName || "")) return true;
    return [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "application/vnd.ms-excel",
    ].includes(fileType || "");
}

async function listSpreadsheetFiles(businessId: string): Promise<SpreadsheetFileRef[]> {
    const items = await prisma.knowledgeItem.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        select: { metadata: true },
        take: 250,
    });

    const seen = new Set<string>();
    const files: SpreadsheetFileRef[] = [];

    for (const item of items) {
        const md = item.metadata;
        if (!md || typeof md !== "object" || Array.isArray(md)) continue;

        const meta = md as Record<string, unknown>;
        const fileUrl = typeof meta.fileUrl === "string" ? meta.fileUrl : "";
        const fileName = typeof meta.fileName === "string" ? meta.fileName : "archivo.xlsx";
        const fileType = typeof meta.fileType === "string" ? meta.fileType : "";

        if (!fileUrl || seen.has(fileUrl)) continue;
        if (!isSpreadsheetMeta(fileName, fileType)) continue;

        seen.add(fileUrl);
        files.push({ fileUrl, fileName, fileType });
    }

    return files;
}

function resolveSpreadsheetFile(files: SpreadsheetFileRef[], fileRef?: string) {
    if (!files.length) return null;
    const ref = String(fileRef || "").trim().toLowerCase();
    if (!ref) return files[0];

    return (
        files.find((f) => f.fileUrl.toLowerCase() === ref) ||
        files.find((f) => f.fileName.toLowerCase() === ref) ||
        files.find((f) => f.fileUrl.toLowerCase().includes(ref)) ||
        files.find((f) => f.fileName.toLowerCase().includes(ref)) ||
        null
    );
}

async function loadSpreadsheetBuffer(fileUrl: string) {
    if (fileUrl.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
        const buffer = await readFile(localPath);
        return { buffer, localPath, source: "local" as const };
    }

    if (/^https?:\/\//i.test(fileUrl)) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`REMOTE_FILE_FETCH_FAILED:${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), source: "remote" as const };
    }

    throw new Error("UNSUPPORTED_FILE_URL");
}

export const createSpreadsheetUpdateTool = (businessId: string) => {
    return new DynamicStructuredTool({
        name: "knowledge_spreadsheet_editor",
        description: "Edita celdas en archivos Excel (.xlsm/.xlsx) de la base de conocimiento y reindexa los cambios para que el agente responda con datos actualizados.",
        schema: z.object({
            action: z.enum(["LIST", "UPDATE_CELL"]).describe("LIST para ver archivos Excel disponibles, UPDATE_CELL para modificar una celda."),
            fileRef: z.string().optional().describe("Nombre parcial del archivo o fileUrl. Si se omite, usa el archivo mas reciente."),
            sheet: z.string().optional().describe("Nombre de la hoja, por ejemplo 'Catalogo'."),
            cell: z.string().optional().describe("Celda en formato A1, por ejemplo B3."),
            value: z.string().optional().describe("Nuevo valor textual de la celda."),
        }),
        func: async ({ action, fileRef, sheet, cell, value }) => {
            try {
                const files = await listSpreadsheetFiles(businessId);

                if (action === "LIST") {
                    if (!files.length) {
                        return "No hay archivos Excel (.xlsm/.xlsx) disponibles en la base de conocimiento.";
                    }

                    return [
                        "Archivos Excel disponibles:",
                        ...files.slice(0, 20).map((f, idx) => `${idx + 1}. ${f.fileName} (${f.fileUrl})`),
                    ].join("\n");
                }

                if (!files.length) {
                    return "No hay archivos Excel para editar. Sube primero un .xlsm o .xlsx a Knowledge.";
                }

                const target = resolveSpreadsheetFile(files, fileRef);
                if (!target) {
                    return `No se encontro archivo para '${fileRef}'. Usa action='LIST' para ver opciones.`;
                }

                const sheetName = String(sheet || "").trim();
                const cellAddress = normalizeSpreadsheetCellAddress(String(cell || ""));
                if (!sheetName) {
                    return "Falta 'sheet'. Indica el nombre exacto de la hoja.";
                }

                const loaded = await loadSpreadsheetBuffer(target.fileUrl);
                const updatedBuffer = applyCellUpdatesToWorkbookBuffer(
                    loaded.buffer,
                    [{ sheet: sheetName, cell: cellAddress, value: String(value ?? "") }],
                    target.fileName
                );

                if (loaded.source === "local" && loaded.localPath) {
                    await writeFile(loaded.localPath, updatedBuffer);
                } else {
                    const replaceResult = await replaceKnowledgeFileByPublicUrl({
                        publicUrl: target.fileUrl,
                        buffer: updatedBuffer,
                        contentType: /\.xlsm$/i.test(target.fileName)
                            ? "application/vnd.ms-excel.sheet.macroEnabled.12"
                            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    });

                    if (!replaceResult.success) {
                        return `No se pudo guardar el archivo actualizado: ${replaceResult.error || "error desconocido"}`;
                    }
                }

                const extractedText = extractSpreadsheetText(updatedBuffer);
                const text = extractedText
                    ? `[EXCEL_ACTUALIZADO: ${target.fileName}]\n${extractedText}`
                    : `[EXCEL_ACTUALIZADO: ${target.fileName}] Archivo actualizado sin celdas legibles.`;

                const enqueue = await enqueueKnowledgeIngestion({
                    businessId,
                    text,
                    metadata: {
                        fileName: target.fileName,
                        fileType: target.fileType || (target.fileName.endsWith(".xlsm")
                            ? "application/vnd.ms-excel.sheet.macroEnabled.12"
                            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                        fileUrl: target.fileUrl,
                        source: "spreadsheet_update_by_agent",
                        updatedCells: [{ sheet: sheetName, cell: cellAddress }],
                    },
                });

                await processKnowledgeQueueBatch(1).catch(() => undefined);

                return [
                    `Archivo actualizado: ${target.fileName}`,
                    `Hoja: ${sheetName}`,
                    `Celda: ${cellAddress}`,
                    `Valor aplicado: ${String(value ?? "")}`,
                    `Job de reindexacion: ${enqueue.job.id}`,
                ].join("\n");
            } catch (error) {
                console.error("[SpreadsheetTool] Error:", error);
                return "No se pudo editar el archivo Excel. Verifica nombre de hoja, celda y permisos.";
            }
        },
    });
};

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
