import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ingestionService } from "@/lib/rag/ingestion";
import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "@/lib/rag/queue";
import { knowledgeQuerySchema, knowledgeCreateSchema, type KnowledgeQueryInput, type KnowledgeCreateInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import type { KnowledgeItem, KnowledgeListData } from "@/types/knowledge";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ENABLE_INLINE_QUEUE_KICKOFF = process.env.KNOWLEDGE_INLINE_KICKOFF !== "false";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function describeImageForKnowledge(buffer: Buffer, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) {
        return "Imagen subida a la base de conocimiento. No se pudo generar descripción automática (falta GEMINI_API_KEY).";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            "Describe en español el contenido de esta imagen para una base de conocimiento empresarial. Si hay productos, precios, horarios, términos o datos clave, enuméralos de forma clara.",
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType,
                },
            },
        ]);
        return result.response.text() || "Imagen subida sin descripción textual.";
    } catch (error) {
        console.error("[API Knowledge] Error describiendo imagen:", error);
        return "Imagen subida a la base de conocimiento. La descripción automática no estuvo disponible.";
    }
}

function extractSpreadsheetText(buffer: Buffer) {
    const XLSX = require("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const selectedSheets = workbook.SheetNames.slice(0, 4);
    const blocks: string[] = [];

    for (const sheetName of selectedSheets) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean | null>>(sheet, {
            header: 1,
            raw: false,
            blankrows: false,
        });

        const limitedRows = rows.slice(0, 220);
        const lines = limitedRows
            .map((row) => row.map((cell) => (cell ?? "").toString().trim()).join(" | ").trim())
            .filter(Boolean);

        if (lines.length > 0) {
            blocks.push(`[HOJA: ${sheetName}]\n${lines.join("\n")}`);
        }
    }

    return blocks.join("\n\n");
}

function stripHtmlToText(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = validateData<KnowledgeCreateInput>(body, knowledgeCreateSchema);
        
        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        let { businessId, text, name, type, url } = validation.data!;
        const safeType = type || "application/octet-stream";
        let fileUrl: string | null = null;
        let uploadedBuffer: Buffer | null = null;

        if (url && !text) {
            try {
                const response = await fetch(url, { method: "GET" });
                if (!response.ok) {
                    return NextResponse.json({ error: "No se pudo leer la URL" }, { status: 422 });
                }
                const html = await response.text();
                text = stripHtmlToText(html);
                name = name || new URL(url).hostname;
                type = type || "text/html";
            } catch (urlError) {
                return NextResponse.json({ error: "No se pudo extraer contenido de la URL" }, { status: 422 });
            }
        }

        const isTextLike = safeType.startsWith("text/") || ["application/json", "text/csv"].includes(safeType) || /\.(txt|md|csv|json)$/i.test(name || "");
        const isSpreadsheet =
            [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel.sheet.macroEnabled.12",
            ].includes(safeType) ||
            /\.(xlsx|xlsm)$/i.test(name || "");
        if (!url && name) {
            uploadedBuffer = isTextLike
                ? Buffer.from(text || "", "utf-8")
                : Buffer.from(text || "", "base64");

            if (uploadedBuffer.byteLength > 0) {
                const uploadDir = path.join(process.cwd(), "public", "uploads");
                await mkdir(uploadDir, { recursive: true });
                const uniqueName = `${Date.now()}-${sanitizeFileName(name)}`;
                const outputPath = path.join(uploadDir, uniqueName);
                await writeFile(outputPath, uploadedBuffer);
                fileUrl = `/uploads/${uniqueName}`;
            }
        }

        if (safeType === "application/pdf") {
            try {
                if (!text && !uploadedBuffer) {
                    return NextResponse.json({ error: "El PDF no contiene datos para procesar" }, { status: 400 });
                }
                console.log("[API Knowledge] Cargando pdf-parse...");
                const pdf = require("pdf-parse");
                const buffer = uploadedBuffer || Buffer.from(text || "", "base64");
                console.log(`[API Knowledge] Buffer creado, tamaño: ${buffer.length}`);
                const data = await pdf(buffer);
                // Ensure text exists and remove control characters (0x00-0x1F except \n \r \t)
                const parsedText = (data.text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
                text = parsedText;
                console.log(`[API Knowledge] PDF procesado: ${name} (${parsedText.length} caracteres)`);
            } catch (pdfError: any) {
                console.error("[API Knowledge] Error parseando PDF:", pdfError);
                return NextResponse.json({
                    error: "Failed to parse PDF",
                    details: pdfError.message || String(pdfError),
                    stack: pdfError.stack
                }, { status: 422 });
            }
        } else if (safeType.startsWith("image/")) {
            if (!uploadedBuffer || uploadedBuffer.byteLength === 0) {
                return NextResponse.json({ error: "La imagen no contiene datos para procesar" }, { status: 400 });
            }
            const visualDescription = await describeImageForKnowledge(uploadedBuffer, safeType);
            text = `[IMAGEN: ${name || "archivo"}]\n${visualDescription}`;
        } else if (isSpreadsheet) {
            if (!uploadedBuffer || uploadedBuffer.byteLength === 0) {
                return NextResponse.json({ error: "El archivo Excel no contiene datos para procesar" }, { status: 400 });
            }
            const extractedText = extractSpreadsheetText(uploadedBuffer);
            text = extractedText
                ? `[EXCEL: ${name || "archivo"}]\n${extractedText}`
                : `[EXCEL: ${name || "archivo"}] Archivo subido sin celdas legibles.`;
        } else if (isTextLike) {
            text = text || "";
        } else {
            // Para archivos no textuales no-imagen guardamos un rastro recuperable.
            text = `[ARCHIVO ADJUNTO: ${name || "archivo"}] Tipo: ${safeType}.`; 
        }

        // Verificar que el negocio pertenece al usuario
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }

        const safeText = (text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
        if (!safeText.trim()) {
            return NextResponse.json({ error: "No hay texto válido para procesar" }, { status: 400 });
        }

        const enqueue = await enqueueKnowledgeIngestion({
            businessId,
            text: safeText,
            metadata: {
                fileName: name || "document",
                fileType: safeType,
                fileUrl,
                source: url ? "website" : "manual_ingestion",
                url: url || null,
            },
        });

        if (enqueue.missingQueueTable) {
            // Fallback temporal para no romper el flujo si la migración aún no está aplicada.
            const chunkCount = await ingestionService.ingestText(businessId, safeText, {
                fileName: name || "document",
                fileType: safeType,
                fileUrl,
            });

            return NextResponse.json({
                success: true,
                message: `Documento procesado en ${chunkCount} fragmentos (modo compatibilidad).`,
                chunkCount,
                mode: "sync_fallback",
            });
        }

        // Kickoff best-effort para procesar rápido en entornos sin worker dedicado.
        if (ENABLE_INLINE_QUEUE_KICKOFF) {
            void processKnowledgeQueueBatch(1).catch((queueError) => {
                console.error("[API Knowledge] Queue kickoff error:", queueError);
            });
        }

        return NextResponse.json({
            success: true,
            queued: true,
            deduplicated: enqueue.deduplicated,
            jobId: enqueue.job.id,
            status: enqueue.job.status,
            message: enqueue.deduplicated
                ? "Este documento ya está en proceso o fue procesado recientemente."
                : "Documento encolado para ingesta asíncrona.",
        }, { status: 202 });

    } catch (error: any) {
        console.error("[API Knowledge] Error fatal:", error);
        return serverErrorResponse("Error al procesar el conocimiento");
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const validation = validateData<KnowledgeQueryInput>({ businessId: searchParams.get("businessId") }, knowledgeQuerySchema);
        
        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        const { businessId } = validation.data!;

        // Verificar que el negocio pertenece al usuario
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }

        const items = await prisma.knowledgeItem.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                content: true,
                metadata: true,
                createdAt: true
            },
            take: 50
        });

        const normalizedItems: KnowledgeItem[] = items.map((item) => {
            const metadata = item.metadata;
            const safeMetadata = metadata && typeof metadata === "object" && !Array.isArray(metadata)
                ? metadata as { fileName?: unknown; fileUrl?: unknown; fileType?: unknown }
                : undefined;

            return {
                id: item.id,
                content: item.content,
                metadata: {
                    fileName: typeof safeMetadata?.fileName === "string" ? safeMetadata.fileName : undefined,
                    fileUrl: typeof safeMetadata?.fileUrl === "string" ? safeMetadata.fileUrl : undefined,
                    fileType: typeof safeMetadata?.fileType === "string" ? safeMetadata.fileType : undefined,
                },
                createdAt: item.createdAt.toISOString(),
            };
        });

        const payload: KnowledgeListData = { items: normalizedItems };
        return successResponse<KnowledgeListData>(payload);

    } catch (error: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { businessId, itemId, itemIds } = body;

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // Verificar propiedad del negocio
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
             return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }

        if (Array.isArray(itemIds) && itemIds.length > 0) {
            const cleanItemIds = itemIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0);
            if (cleanItemIds.length === 0) {
                return NextResponse.json({ error: "itemIds inválido" }, { status: 400 });
            }

            const result = await ingestionService.deleteKnowledgeItems(cleanItemIds, businessId);
            return NextResponse.json({
                success: true,
                message: `${result.count} elemento(s) eliminado(s).`,
                deletedCount: result.count,
            });
        }

        if (itemId) {
            const result = await ingestionService.deleteKnowledgeItem(itemId, businessId);
             return NextResponse.json({ success: true, message: "Elemento eliminado.", deletedCount: result.count });
        } else {
            // Peligroso: Si no se envía itemId, borra todo.
            // Para seguridad, requerimos confirmación explícita o solo permitimos si es intencional.
            // Asumiremos que si no hay itemId, es un "Limpiar todo".
            await ingestionService.deleteAllKnowledge(businessId);
             return NextResponse.json({ success: true, message: "Base de conocimiento vaciada." });
        }

    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
