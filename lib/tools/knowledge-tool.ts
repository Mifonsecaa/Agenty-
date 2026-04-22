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
import { replaceKnowledgeFileByPublicUrl, uploadKnowledgeFileToStorage } from "@/lib/storage/knowledge-files";
import path from "path";
import { readFile, writeFile } from "fs/promises";

const TOOL_RAG_MIN_SCORE = Number(process.env.RAG_TOOL_MIN_SCORE || 0.58);

type SpreadsheetFileRef = {
    fileUrl: string;
    fileName: string;
    fileType: string;
    sourceId?: string;
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

export async function listSpreadsheetFilesForBusiness(businessId: string): Promise<SpreadsheetFileRef[]> {
    const items = await prisma.knowledgeItem.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        select: { metadata: true },
        // Aumentamos ventana para no perder archivos antiguos cuando hay muchos chunks recientes.
        take: 2000,
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
        const sourceId = typeof meta.sourceId === "string" ? meta.sourceId : "";

        if (!fileUrl || seen.has(fileUrl)) continue;
        if (!isSpreadsheetMeta(fileName, fileType)) continue;

        seen.add(fileUrl);
        files.push({ fileUrl, fileName, fileType, sourceId: sourceId || undefined });
    }

    return files;
}

function buildExcelBuffer(params: { fileName: string; sheetName?: string; headers?: string[] }) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();
    const safeSheetName = String(params.sheetName || "Datos").trim() || "Datos";
    const normalizedHeaders = Array.isArray(params.headers)
        ? params.headers.map((h) => String(h || "").trim()).filter(Boolean).slice(0, 40)
        : [];

    const sheetData = normalizedHeaders.length ? [normalizedHeaders] : [[]];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

    const outType = /\.xlsm$/i.test(params.fileName) ? "xlsm" : "xlsx";
    const out = XLSX.write(workbook, {
        type: "buffer",
        bookType: outType,
        bookVBA: outType === "xlsm",
    });

    return Buffer.from(out);
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

async function tryResolveBySheetName(files: SpreadsheetFileRef[], sheetName?: string) {
    const targetSheet = String(sheetName || "").trim();
    if (!targetSheet || files.length <= 1) return null;

    const matches: SpreadsheetFileRef[] = [];
    for (const file of files.slice(0, 12)) {
        try {
            const loaded = await loadSpreadsheetBuffer(file.fileUrl);
            const sheets = listWorkbookSheets(loaded.buffer);
            if (sheets.some((s: { name: string }) => s.name.trim().toLowerCase() === targetSheet.toLowerCase())) {
                matches.push(file);
            }
        } catch {
            // Ignoramos archivos no legibles para esta heuristica.
        }
    }

    if (matches.length === 1) return matches[0];
    return null;
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
        description: "Edita o crea archivos Excel (.xlsm/.xlsx) de la base de conocimiento y reindexa los cambios para que el agente responda con datos actualizados.",
        schema: z.object({
            action: z.enum(["LIST", "LIST_SHEETS", "READ_CELL", "UPDATE_CELL", "APPEND_ROW", "CREATE_FILE"]).describe("LIST para archivos, LIST_SHEETS para hojas, READ_CELL para leer, UPDATE_CELL para editar, APPEND_ROW para agregar registros y CREATE_FILE para crear un archivo Excel nuevo."),
            targetFileName: z.string().optional().describe("Nombre de archivo objetivo, por ejemplo 'reservas.xlsx'."),
            sourceId: z.string().optional().describe("sourceId del archivo en knowledge metadata."),
            fileRef: z.string().optional().describe("Referencia de archivo (numero de lista, nombre o fileUrl). Si hay mas de un archivo, es obligatorio para editar."),
            allowedSourceIds: z.array(z.string()).optional().describe("Lista de sourceId permitidos por contexto previo (lock de procedencia)."),
            allowedFileUrls: z.array(z.string()).optional().describe("Lista de URLs de archivo permitidas por contexto previo (lock de procedencia)."),
            sheet: z.string().optional().describe("Nombre de la hoja, por ejemplo 'Catalogo'."),
            sheetName: z.string().optional().describe("Alias de sheet para compatibilidad con prompts/tool-calling."),
            cell: z.string().optional().describe("Celda en formato A1, por ejemplo B3."),
            value: z.string().optional().describe("Nuevo valor textual de la celda."),
            rowValues: z.array(z.string()).optional().describe("Valores de una nueva fila para APPEND_ROW."),
            data: z.any().optional().describe("Datos libres para crear/editar (ej: { headers: [...], rowValues: [...] })."),
        }).superRefine((payload, ctx) => {
            if (payload.action !== "LIST" && !payload.targetFileName && !payload.sourceId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Debes indicar targetFileName o sourceId para esta operacion.",
                    path: ["targetFileName"],
                });
            }
        }),
        func: async ({ action, targetFileName, sourceId, fileRef, allowedSourceIds, allowedFileUrls, sheet, sheetName, cell, value, rowValues, data }) => {
            try {
                const files = await listSpreadsheetFilesForBusiness(businessId);
                const lockedSourceIds = Array.isArray(allowedSourceIds)
                    ? allowedSourceIds.map((s) => normalizeRef(s)).filter(Boolean)
                    : [];
                const lockedFileUrls = Array.isArray(allowedFileUrls)
                    ? allowedFileUrls.map((u) => normalizeRef(u)).filter(Boolean)
                    : [];
                const hasLock = lockedSourceIds.length > 0 || lockedFileUrls.length > 0;

                const effectiveFiles = hasLock
                    ? files.filter((f) => {
                        const bySource = lockedSourceIds.length > 0 && normalizeRef(f.sourceId || "") && lockedSourceIds.includes(normalizeRef(f.sourceId || ""));
                        const byUrl = lockedFileUrls.length > 0 && lockedFileUrls.includes(normalizeRef(f.fileUrl));
                        return bySource || byUrl;
                    })
                    : files;

                const effectiveSheet = String(sheetName || sheet || "").trim();

                if (action === "CREATE_FILE") {
                    const rawTargetFileName = String(targetFileName || "").trim();
                    if (!rawTargetFileName) {
                        return "Falta 'targetFileName'. Indica un nombre de archivo, por ejemplo 'reservas.xlsx'.";
                    }

                    const safeFileName = /\.(xlsx|xlsm)$/i.test(rawTargetFileName)
                        ? rawTargetFileName
                        : `${rawTargetFileName}.xlsx`;

                    const existingSameName = files.find((f) => normalizeRef(f.fileName) === normalizeRef(safeFileName));
                    if (existingSameName) {
                        return [
                            `El archivo ya existe: ${existingSameName.fileName}`,
                            `URL: ${existingSameName.fileUrl}`,
                            "Usa APPEND_ROW o UPDATE_CELL para guardar datos.",
                        ].join("\n");
                    }

                    const headers = Array.isArray((data as any)?.headers)
                        ? (data as any).headers.map((h: unknown) => String(h || "")).filter(Boolean)
                        : [];

                    const createdBuffer = buildExcelBuffer({
                        fileName: safeFileName,
                        sheetName: effectiveSheet || "Datos",
                        headers,
                    });

                    const upload = await uploadKnowledgeFileToStorage({
                        buffer: createdBuffer,
                        fileName: safeFileName,
                        contentType: /\.xlsm$/i.test(safeFileName)
                            ? "application/vnd.ms-excel.sheet.macroEnabled.12"
                            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        businessId,
                    });

                    if (!upload.publicUrl) {
                        return `No se pudo crear el archivo en storage: ${upload.error || "error desconocido"}`;
                    }

                    const extractedText = extractSpreadsheetText(createdBuffer);
                    const text = extractedText
                        ? `[EXCEL_ACTUALIZADO: ${safeFileName}]\n${extractedText}`
                        : `[EXCEL_ACTUALIZADO: ${safeFileName}] Archivo creado sin celdas legibles.`;

                    const enqueue = await enqueueKnowledgeIngestion({
                        businessId,
                        text,
                        metadata: {
                            fileName: safeFileName,
                            fileType: /\.xlsm$/i.test(safeFileName)
                                ? "application/vnd.ms-excel.sheet.macroEnabled.12"
                                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            fileUrl: upload.publicUrl,
                            source: "spreadsheet_create_by_agent",
                            updatedCells: true,
                            updatedAt: new Date().toISOString(),
                        },
                    });

                    await processKnowledgeQueueBatch(1).catch(() => undefined);

                    return [
                        `Archivo creado: ${safeFileName}`,
                        `URL: ${upload.publicUrl}`,
                        enqueue?.job?.id ? `Job de reindexacion: ${enqueue.job.id}` : "Job de reindexacion: en cola",
                    ].join("\n");
                }

                if (action === "LIST") {
                    if (!effectiveFiles.length) {
                        return "No hay archivos Excel (.xlsm/.xlsx) disponibles en la base de conocimiento.";
                    }

                    return [
                        "Archivos Excel disponibles:",
                        ...effectiveFiles.slice(0, 20).map((f, idx) => `${idx + 1}. ${f.fileName} (${f.fileUrl})${f.sourceId ? ` [sourceId: ${f.sourceId}]` : ""}`),
                        "Usa fileRef, sourceId o targetFileName para seleccionar el archivo correcto.",
                    ].join("\n");
                }

                if (!effectiveFiles.length) {
                    if (hasLock) {
                        return "No encontre el archivo dentro del contexto actual. Para evitar inconsistencias, debo editar el mismo archivo de referencia. Indica ese archivo o vuelve a consultarlo primero.";
                    }
                    return "No hay archivos Excel para editar. Sube primero un .xlsm o .xlsx a Knowledge.";
                }

                let resolvedBySourceId: SpreadsheetFileRef | null = null;
                if (sourceId) {
                    resolvedBySourceId = effectiveFiles.find((f) => normalizeRef(f.sourceId || "") === normalizeRef(sourceId)) || null;
                }

                const inferredBySheet = await tryResolveBySheetName(effectiveFiles, effectiveSheet);
                const effectiveRef = resolvedBySourceId?.fileUrl || targetFileName || inferredBySheet?.fileUrl || fileRef;
                const resolution = resolveSpreadsheetFile(effectiveFiles, effectiveRef);
                if (resolution.status === "missing_file_ref") {
                    return [
                        "Hay mas de un archivo Excel en la base de conocimiento. Necesito que indiques cual editar.",
                        effectiveSheet ? `Nota: busque la hoja '${effectiveSheet}' en varios archivos y no fue suficiente para resolver uno unico.` : "",
                        buildFileOptionsMessage(resolution.options),
                    ].filter(Boolean).join("\n\n");
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
                    const sheetNameResolved = effectiveSheet;
                    const cellAddress = normalizeSpreadsheetCellAddress(String(cell || ""));
                    if (!sheetNameResolved) {
                        return "Falta 'sheet'. Indica el nombre exacto de la hoja.";
                    }

                    const cellValue = readWorkbookCellValue(loaded.buffer, sheetNameResolved, cellAddress);
                    return [
                        `Archivo: ${target.fileName}`,
                        `Hoja: ${sheetNameResolved}`,
                        `Celda: ${cellAddress}`,
                        `Valor: ${cellValue || "(vacio)"}`,
                    ].join("\n");
                }

                const sheetNameResolved = effectiveSheet;
                if (!sheetNameResolved) {
                    return "Falta 'sheet'. Indica el nombre exacto de la hoja.";
                }

                let updatedBuffer: Buffer;
                let updateSummary = "";
                let updatedCellsMeta: Array<{ sheet: string; cell: string }> = [];

                if (action === "UPDATE_CELL") {
                    const cellAddress = String(cell || "").trim();
                    if (!cellAddress) {
                        return "Falta 'cell'. Indica una celda en formato A1 (ejemplo: B3).";
                    }
                    if (typeof value !== "string") {
                        return "Falta 'value'. Indica el nuevo valor textual para la celda.";
                    }

                    const normalizedCell = normalizeSpreadsheetCellAddress(cellAddress);
                    updatedBuffer = applyCellUpdatesToWorkbookBuffer(
                        loaded.buffer,
                        [{ sheet: sheetNameResolved, cell: normalizedCell, value: String(value ?? "") }],
                        target.fileName
                    );
                    updateSummary = [`Hoja: ${sheetNameResolved}`, `Celda: ${normalizedCell}`, `Valor aplicado: ${String(value ?? "")}`].join("\n");
                    updatedCellsMeta = [{ sheet: sheetNameResolved, cell: normalizedCell }];
                } else {
                    const dataRowValues = Array.isArray((data as any)?.rowValues)
                        ? (data as any).rowValues.map((v: unknown) => String(v ?? ""))
                        : [];
                    const safeRowValues = Array.isArray(rowValues) && rowValues.length > 0
                        ? rowValues.slice(0, 80)
                        : dataRowValues.slice(0, 80);
                    if (!safeRowValues.length) {
                        return "Falta 'rowValues'. Envia una lista de columnas para la nueva fila.";
                    }

                    updatedBuffer = appendRowsToWorkbookBuffer(
                        loaded.buffer,
                        [{ sheet: sheetNameResolved, values: safeRowValues }],
                        target.fileName
                    );
                    updateSummary = [`Hoja: ${sheetNameResolved}`, `Fila agregada: ${safeRowValues.join(" | ")}`].join("\n");
                    updatedCellsMeta = [{ sheet: sheetNameResolved, cell: "APPEND_ROW" }];
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
                        updatedAt: new Date().toISOString(),
                    },
                });

                await processKnowledgeQueueBatch(1).catch(() => undefined);

                const jobLine = enqueue?.job?.id
                    ? `Job de reindexacion: ${enqueue.job.id}`
                    : "Job de reindexacion: en cola (sin id disponible en esta instancia)";

                return [
                    `Archivo actualizado: ${target.fileName}`,
                    updateSummary,
                    jobLine,
                ].join("\n");
            } catch (error) {
                console.error("[SpreadsheetTool] Error:", error);
                const message = error instanceof Error ? error.message : String(error);
                if (message.startsWith("SHEET_NOT_FOUND:")) {
                    const sheetName = message.split(":")[1] || "";
                    return `Error al guardar en el Excel: no existe la hoja '${sheetName}'. Dile al usuario que hubo un problema tecnico y que confirme el nombre de la hoja (puedes usar LIST_SHEETS).`;
                }
                if (message.includes("INVALID_CELL_ADDRESS")) {
                    return "Error al guardar en el Excel: la celda no es valida. Dile al usuario que hubo un problema tecnico y que indique formato A1 (ejemplo B3).";
                }
                if (message.startsWith("REMOTE_FILE_FETCH_FAILED:")) {
                    return "Error al guardar en el Excel: no pude descargar el archivo desde storage. Dile al usuario que hubo un problema tecnico temporal.";
                }
                return `Error al guardar en el Excel: ${message}. Dile al usuario que hubo un problema tecnico.`;
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
