import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { prisma } from "@/lib/prisma";
import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "@/lib/rag/queue";
import {
    applyCellUpdatesToWorkbookBuffer,
    appendRowsToWorkbookBuffer,
    extractSpreadsheetText,
    isSpreadsheetFileName,
    listWorkbookSheets,
    normalizeSpreadsheetCellAddress,
    readWorkbookCellValue,
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

type FileResolution =
    | { status: "resolved"; target: SpreadsheetFileRef }
    | { status: "missing_file_ref"; options: SpreadsheetFileRef[] }
    | { status: "ambiguous"; options: SpreadsheetFileRef[] }
    | { status: "not_found"; options: SpreadsheetFileRef[] };

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

function fileBaseName(fileNameOrUrl: string) {
    return fileNameOrUrl.split("/").pop() || fileNameOrUrl;
}

function normalizeRef(value: string) {
    return String(value || "").trim().toLowerCase();
}

function buildFileOptionsMessage(files: SpreadsheetFileRef[]) {
    const options = files.slice(0, 12);
    return [
        "Opciones disponibles:",
        ...options.map((f, idx) => `${idx + 1}. ${f.fileName} (${f.fileUrl})`),
        "Responde con fileRef usando: numero, nombre exacto o URL.",
    ].join("\n");
}

function resolveSpreadsheetFile(files: SpreadsheetFileRef[], fileRef?: string): FileResolution {
    if (!files.length) {
        return { status: "not_found", options: [] };
    }

    const ref = normalizeRef(fileRef || "");
    if (!ref) {
        if (files.length === 1) return { status: "resolved", target: files[0] };
        return { status: "missing_file_ref", options: files };
    }

    if (/^\d+$/.test(ref)) {
        const index = Number(ref) - 1;
        if (index >= 0 && index < files.length) {
            return { status: "resolved", target: files[index] };
        }
    }

    const exactMatches = files.filter((f) =>
        normalizeRef(f.fileUrl) === ref ||
        normalizeRef(f.fileName) === ref ||
        normalizeRef(fileBaseName(f.fileUrl)) === ref ||
        normalizeRef(fileBaseName(f.fileName)) === ref
    );

    if (exactMatches.length === 1) {
        return { status: "resolved", target: exactMatches[0] };
    }

    if (exactMatches.length > 1) {
        return { status: "ambiguous", options: exactMatches };
    }

    const scored = files
        .map((f) => {
            const fileName = normalizeRef(f.fileName);
            const fileUrl = normalizeRef(f.fileUrl);
            const baseName = normalizeRef(fileBaseName(f.fileName));

            let score = 0;
            if (fileName.startsWith(ref) || baseName.startsWith(ref)) score += 3;
            if (fileName.includes(ref) || baseName.includes(ref)) score += 2;
            if (fileUrl.includes(ref)) score += 1;

            return { file: f, score };
        })
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score);

    if (!scored.length) {
        return { status: "not_found", options: files };
    }

    const bestScore = scored[0].score;
    const topMatches = scored.filter((row) => row.score === bestScore).map((row) => row.file);

    if (topMatches.length === 1) {
        return { status: "resolved", target: topMatches[0] };
    }

    return { status: "ambiguous", options: topMatches };
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
            action: z.enum(["LIST", "LIST_SHEETS", "READ_CELL", "UPDATE_CELL", "APPEND_ROW"]).describe("LIST para archivos, LIST_SHEETS para hojas, READ_CELL para leer, UPDATE_CELL para editar y APPEND_ROW para agregar registros."),
            fileRef: z.string().optional().describe("Referencia de archivo (numero de lista, nombre o fileUrl). Si hay mas de un archivo, es obligatorio para editar."),
            sheet: z.string().optional().describe("Nombre de la hoja, por ejemplo 'Catalogo'."),
            cell: z.string().optional().describe("Celda en formato A1, por ejemplo B3."),
            value: z.string().optional().describe("Nuevo valor textual de la celda."),
            rowValues: z.array(z.string()).optional().describe("Valores de una nueva fila para APPEND_ROW."),
        }),
        func: async ({ action, fileRef, sheet, cell, value, rowValues }) => {
            try {
                const files = await listSpreadsheetFiles(businessId);

                if (action === "LIST") {
                    if (!files.length) {
                        return "No hay archivos Excel (.xlsm/.xlsx) disponibles en la base de conocimiento.";
                    }

                    return [
                        "Archivos Excel disponibles:",
                        ...files.slice(0, 20).map((f, idx) => `${idx + 1}. ${f.fileName} (${f.fileUrl})`),
                        "Usa ese numero como fileRef para seleccionar el archivo correcto.",
                    ].join("\n");
                }

                if (!files.length) {
                    return "No hay archivos Excel para editar. Sube primero un .xlsm o .xlsx a Knowledge.";
                }

                const resolution = resolveSpreadsheetFile(files, fileRef);
                if (resolution.status === "missing_file_ref") {
                    return [
                        "Hay mas de un archivo Excel en la base de conocimiento. Necesito que indiques cual editar.",
                        buildFileOptionsMessage(resolution.options),
                    ].join("\n\n");
                }

                if (resolution.status === "ambiguous") {
                    return [
                        `La referencia '${String(fileRef || "")}' es ambigua y coincide con varios archivos.`,
                        buildFileOptionsMessage(resolution.options),
                    ].join("\n\n");
                }

                if (resolution.status === "not_found") {
                    return [
                        `No se encontro archivo para '${String(fileRef || "")}'.`,
                        buildFileOptionsMessage(resolution.options),
                    ].join("\n\n");
                }

                const target = resolution.target;

                const loaded = await loadSpreadsheetBuffer(target.fileUrl);

                if (action === "LIST_SHEETS") {
                    const sheets = listWorkbookSheets(loaded.buffer);
                    if (!sheets.length) {
                        return `El archivo ${target.fileName} no contiene hojas legibles.`;
                    }

                    return [
                        `Hojas en ${target.fileName}:`,
                        ...sheets.map((s: { name: string; rowCount: number; colCount: number }) => `- ${s.name} (filas aprox: ${s.rowCount}, columnas aprox: ${s.colCount})`),
                    ].join("\n");
                }

                if (action === "READ_CELL") {
                    const sheetName = String(sheet || "").trim();
                    const cellAddress = normalizeSpreadsheetCellAddress(String(cell || ""));
                    if (!sheetName) {
                        return "Falta 'sheet'. Indica el nombre exacto de la hoja.";
                    }

                    const cellValue = readWorkbookCellValue(loaded.buffer, sheetName, cellAddress);
                    return [
                        `Archivo: ${target.fileName}`,
                        `Hoja: ${sheetName}`,
                        `Celda: ${cellAddress}`,
                        `Valor: ${cellValue || "(vacio)"}`,
                    ].join("\n");
                }

                const sheetName = String(sheet || "").trim();
                if (!sheetName) {
                    return "Falta 'sheet'. Indica el nombre exacto de la hoja.";
                }

                let updatedBuffer: Buffer;
                let updateSummary = "";
                let updatedCellsMeta: Array<{ sheet: string; cell: string }> = [];

                if (action === "UPDATE_CELL") {
                    const cellAddress = normalizeSpreadsheetCellAddress(String(cell || ""));
                    updatedBuffer = applyCellUpdatesToWorkbookBuffer(
                        loaded.buffer,
                        [{ sheet: sheetName, cell: cellAddress, value: String(value ?? "") }],
                        target.fileName
                    );
                    updateSummary = [`Hoja: ${sheetName}`, `Celda: ${cellAddress}`, `Valor aplicado: ${String(value ?? "")}`].join("\n");
                    updatedCellsMeta = [{ sheet: sheetName, cell: cellAddress }];
                } else {
                    const safeRowValues = Array.isArray(rowValues) ? rowValues.slice(0, 80) : [];
                    if (!safeRowValues.length) {
                        return "Falta 'rowValues'. Envia una lista de columnas para la nueva fila.";
                    }

                    updatedBuffer = appendRowsToWorkbookBuffer(
                        loaded.buffer,
                        [{ sheet: sheetName, values: safeRowValues }],
                        target.fileName
                    );
                    updateSummary = [`Hoja: ${sheetName}`, `Fila agregada: ${safeRowValues.join(" | ")}`].join("\n");
                    updatedCellsMeta = [{ sheet: sheetName, cell: "APPEND_ROW" }];
                }

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
                        updatedCells: updatedCellsMeta,
                    },
                });

                await processKnowledgeQueueBatch(1).catch(() => undefined);

                return [
                    `Archivo actualizado: ${target.fileName}`,
                    updateSummary,
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
