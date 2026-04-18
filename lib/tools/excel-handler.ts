import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "../rag/queue";
import { applyCellUpdatesToWorkbookBuffer, appendRowsToWorkbookBuffer, extractSpreadsheetText, listWorkbookSheets } from "../knowledge/spreadsheet";
import { listSpreadsheetFilesForBusiness } from "./knowledge-tool";
import { replaceKnowledgeFileByPublicUrl, uploadKnowledgeFileToStorage } from "../storage/knowledge-files";
import path from "path";
import { readFile, writeFile } from "fs/promises";

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

export async function processExcelWorkOrder(
    businessId: string,
    workOrder: any
) {
    let finalFileUrl = "";

    try {
        const files = await listSpreadsheetFilesForBusiness(businessId);
        const targetFileName = workOrder.targetFileName || "datos.xlsx";
        const targetFile = files.find(f => f.fileName === targetFileName);

        let createdBuffer;
        let updatedBuffer;

        if (workOrder.actionType === "CREATE_FILE" && !targetFile) {
            const safeFileName = targetFileName.endsWith(".xlsx") || targetFileName.endsWith(".xlsm") ? targetFileName : `${targetFileName}.xlsx`;
            createdBuffer = buildExcelBuffer({ fileName: safeFileName, headers: Object.keys(workOrder.extractedData || {}) });
            const upload = await uploadKnowledgeFileToStorage({
                buffer: createdBuffer,
                fileName: safeFileName,
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                businessId,
            });
            if (upload.publicUrl) {
                finalFileUrl = upload.publicUrl;
            }
        } else if (workOrder.actionType === "APPEND_ROW" || workOrder.actionType === "UPDATE_CELL") {
            if (!targetFile) {
                throw new Error("Archivo no encontrado.");
            }
            const loaded = await loadSpreadsheetBuffer(targetFile.fileUrl);
            const workbookSheets = listWorkbookSheets(loaded.buffer);
            const fallbackSheet = workbookSheets[0]?.name || "Datos";

            if (workOrder.actionType === "APPEND_ROW") {
               const rowValues = Object.values(workOrder.extractedData || {}).map(v => String(v));
               updatedBuffer = appendRowsToWorkbookBuffer(loaded.buffer, [{ sheet: fallbackSheet, values: rowValues }], targetFileName);
            } else {
               updatedBuffer = applyCellUpdatesToWorkbookBuffer(loaded.buffer, [{ sheet: fallbackSheet, cell: "A1", value: JSON.stringify(workOrder.extractedData) }], targetFileName);
            }

             if (loaded.source === "local" && loaded.localPath) {
                   await writeFile(loaded.localPath, updatedBuffer);
                   finalFileUrl = targetFile.fileUrl;
             } else {
                   const replaceResult = await replaceKnowledgeFileByPublicUrl({
                       publicUrl: targetFile.fileUrl,
                       buffer: updatedBuffer,
                       contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                   });
                   if (replaceResult.success) {
                       finalFileUrl = targetFile.fileUrl;
                   }
             }
        }

        // 2. CRÍTICO: Disparar el RAG para actualizar la BD y el Visor
        if (finalFileUrl) {
            const bufferForText = workOrder.actionType === "CREATE_FILE" && !targetFile ? createdBuffer : updatedBuffer;
            const extractedText = bufferForText ? extractSpreadsheetText(bufferForText) : "";
            const textToIngest = extractedText ? `[EXCEL_ACTUALIZADO: ${targetFileName}]\n${extractedText}` : `[EXCEL_ACTUALIZADO: ${targetFileName}] Archivo actualizado sin celdas legibles.`;

            await enqueueKnowledgeIngestion({
                businessId: businessId,
                text: textToIngest,
                metadata: {
                    fileUrl: finalFileUrl,
                    fileName: targetFileName,
                    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    isManualUpdate: true,
                    updatedAt: new Date().toISOString()
                }
            });

            await processKnowledgeQueueBatch(1).catch((queueError) => {
                console.error("[ExcelHandler] Queue kickoff error:", queueError);
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error en processExcelWorkOrder:", error);
        throw new Error("Fallo en la ejecución física del archivo.");
    }
}
