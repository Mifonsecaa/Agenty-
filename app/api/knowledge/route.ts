import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authorizeBusinessAccessSession } from '@/lib/auth';
import { ingestionService } from "@/lib/rag/ingestion";
import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "@/lib/rag/queue";
import { knowledgeQuerySchema, knowledgeCreateSchema, type KnowledgeQueryInput, type KnowledgeCreateInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import type { KnowledgeItem, KnowledgeListData } from "@/types/knowledge";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadKnowledgeFileToStorage } from "@/lib/storage/knowledge-files";
import { buildCanonicalMenuText, extractMenuEntries, hasMenuLikeSignals, intersectMenuEntries } from "@/lib/rag/menu-precision";
import { extractSpreadsheetText } from "@/lib/knowledge/spreadsheet";

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
            `Extrae texto de esta imagen para una base de conocimiento empresarial en ESPANOL.
PRIORIDAD MAXIMA: fidelidad literal de precios, productos y secciones.

Reglas:
1) Si es menu/carta/lista de precios, transcribe item + precio EXACTO sin inferir ni corregir.
2) No reemplaces ni homogenices precios.
3) Si un precio no se distingue, usa [PRECIO_NO_LEGIBLE].
4) Mantén secciones/categorías (ej. Panaderia, Pasteles, Bebidas).
5) No inventes productos ni valores.
6) Devuelve texto plano estructurado, una linea por item.

Formato sugerido:
[SECCION: <nombre>]
<producto> | <precio>
`,
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

async function verifyMenuImageTranscription(buffer: Buffer, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) {
        return "";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            `Transcribe SOLO menu con precision maxima.
Reglas estrictas:
1) Devuelve solo lineas con formato "producto | precio".
2) Si hay secciones, agrega antes una linea "[SECCION: nombre]".
3) No inventes, no completes, no normalices.
4) Si no se ve un precio, omite ese item.
`,
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType,
                },
            },
        ]);
        return result.response.text() || "";
    } catch (error) {
        console.error("[API Knowledge] Error en verificación de transcripción de menú:", error);
        return "";
    }
}


function stripHtmlToText(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function sanitizeUtf8Text(value: string) {
    return (value || "")
        .replace(/\r\n/g, "\n")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/\uFFFD/g, "")
        .trim();
}

function looksLikeBase64(value: string) {
    const sample = (value || "").trim();
    if (!sample || sample.length < 16 || sample.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/=\r\n]+$/.test(sample);
}

function decodeTextBuffer(buffer: Buffer) {
    if (!buffer?.length) return "";

    // UTF-16 LE BOM
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        return buffer.slice(2).toString("utf16le");
    }

    // UTF-16 BE BOM
    if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
        const body = buffer.slice(2);
        const swapped = Buffer.allocUnsafe(body.length);
        for (let i = 0; i < body.length - 1; i += 2) {
            swapped[i] = body[i + 1];
            swapped[i + 1] = body[i];
        }
        return swapped.toString("utf16le");
    }

    // Heurística: muchos null bytes suele ser UTF-16 LE sin BOM.
    const nullBytes = buffer.reduce((acc, b) => (b === 0 ? acc + 1 : acc), 0);
    if (buffer.length > 0 && nullBytes / buffer.length > 0.2) {
        return buffer.toString("utf16le");
    }

    return buffer.toString("utf8");
}


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = validateData<KnowledgeCreateInput>(body, knowledgeCreateSchema);

        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        let { businessId, text, encoding, name, type, url, layer } = validation.data!;

        // --- CAMBIOS APLICADOS AQUÍ PARA SOPORTAR ARCHIVOS DE SUPABASE ---
        let safeType = type || "application/octet-stream";
        let fileUrl: string | null = null;
        let uploadedBuffer: Buffer | null = null;

        if (url && !text) {
            try {
                const response = await fetch(url, { method: "GET" });
                if (!response.ok) {
                    return NextResponse.json({ error: "No se pudo leer la URL" }, { status: 422 });
                }

                // NUEVO: Detectar si la URL es un archivo de nuestra nube (Supabase) o un PDF
                const isSupabaseFile = url.includes("supabase.co/storage");
                const contentType = response.headers.get("content-type") || safeType;

                if (isSupabaseFile || contentType.includes("pdf") || contentType.includes("excel") || contentType.includes("spreadsheet") || contentType.includes("octet-stream") || contentType.includes("image/")) {
                    // En lugar de leerlo como texto HTML, lo descargamos como archivo a la memoria
                    const arrayBuffer = await response.arrayBuffer();
                    uploadedBuffer = Buffer.from(arrayBuffer);
                    safeType = contentType; // Actualizamos al tipo real (ej. application/pdf)
                    fileUrl = url; // Ya está guardado permanentemente en la nube
                } else {
                    // Comportamiento original para páginas web normales
                    const html = await response.text();
                    text = stripHtmlToText(html);
                    name = name || new URL(url).hostname;
                    type = type || "text/html";
                    safeType = "text/html";
                }
            } catch (urlError) {
                return NextResponse.json({ error: "No se pudo extraer contenido de la URL" }, { status: 422 });
            }
        }
        // --- FIN DE LOS CAMBIOS ---

        const isTextLike = safeType.startsWith("text/") || ["application/json", "text/csv"].includes(safeType) || /\.(txt|md|csv|json|xml)$/i.test(name || "");
        const isSpreadsheet =
            [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel.sheet.macroEnabled.12",
                "application/vnd.ms-excel",
            ].includes(safeType) ||
            /\.(xlsx|xlsm|xls)$/i.test(name || "");

        const hasFilePayload = !url && typeof text === "string" && typeof name === "string";
        const forceBase64 = encoding === "base64";
        const shouldDecodeBase64 = hasFilePayload && (forceBase64 || !isTextLike || looksLikeBase64(text || ""));

        if (!url && name) {
            if (shouldDecodeBase64) {
                uploadedBuffer = Buffer.from((text || "").trim(), "base64");
            } else {
                uploadedBuffer = Buffer.from(text || "", "utf-8");
            }

            if (uploadedBuffer.byteLength > 0) {
                const storageUpload = await uploadKnowledgeFileToStorage({
                    buffer: uploadedBuffer,
                    fileName: name,
                    contentType: safeType,
                    businessId,
                });
                if (storageUpload.publicUrl) {
                    fileUrl = storageUpload.publicUrl;
                } else if (storageUpload.provider === "supabase" && storageUpload.error) {
                    console.warn(`[API Knowledge] Supabase upload failed, fallback to local disk: ${storageUpload.error}`);
                }

                if (fileUrl) {
                    // Almacén persistente listo; no necesitamos escribir en disco local.
                    // Esto evita fallos en Vercel por filesystem read-only.
                    // Continuamos con el procesamiento del contenido.
                } else {
                    try {
                        const uploadDir = path.join(process.cwd(), "public", "uploads");
                        await mkdir(uploadDir, { recursive: true });
                        const uniqueName = `${Date.now()}-${sanitizeFileName(name)}`;
                        const outputPath = path.join(uploadDir, uniqueName);
                        await writeFile(outputPath, uploadedBuffer);
                        fileUrl = `/uploads/${uniqueName}`;
                    } catch (fileError: any) {
                        const isReadOnlyFs =
                            fileError?.code === "EROFS" ||
                            String(fileError?.message || "").toLowerCase().includes("read-only file system");

                        if (isReadOnlyFs) {
                            // En Vercel serverless el filesystem del deployment es read-only.
                            // Continuamos la ingesta sin URL persistente de archivo.
                            console.warn("[API Knowledge] Read-only filesystem detected; skipping local file persistence.");
                            fileUrl = null;
                        } else {
                            throw fileError;
                        }
                    }
                }
            }
        }

        if (isSpreadsheet && !fileUrl) {
            return NextResponse.json(
                {
                    error: "No se pudo guardar el archivo Excel para visualizacion. Configura storage persistente (Supabase Storage) y vuelve a subirlo.",
                },
                { status: 422 }
            );
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
                const parsedText = sanitizeUtf8Text(data.text || "");
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
            const menuEntriesPrimary = hasMenuLikeSignals(visualDescription) ? extractMenuEntries(visualDescription) : [];
            let menuEntriesFinal = menuEntriesPrimary;

            if (menuEntriesPrimary.length >= 3) {
                const verificationText = await verifyMenuImageTranscription(uploadedBuffer, safeType);
                const menuEntriesSecondary = hasMenuLikeSignals(verificationText) ? extractMenuEntries(verificationText) : [];
                const intersection = intersectMenuEntries(menuEntriesPrimary, menuEntriesSecondary);
                if (intersection.length >= 3) {
                    menuEntriesFinal = intersection;
                }
            }

            if (menuEntriesFinal.length >= 3) {
                const canonicalMenu = buildCanonicalMenuText(menuEntriesFinal);
                text = `[IMAGEN_MENU: ${name || "archivo"}]\n${canonicalMenu}`;
            } else {
                text = `\n${visualDescription}`;
            }
        } else if (isSpreadsheet) {
            if (!uploadedBuffer || uploadedBuffer.byteLength === 0) {
                return NextResponse.json({ error: "El archivo Excel no contiene datos para procesar" }, { status: 400 });
            }
            const extractedText = extractSpreadsheetText(uploadedBuffer);
            text = extractedText
                ? `[EXCEL: ${name || "archivo"}]\n${extractedText}`
                : `[EXCEL: ${name || "archivo"}] Archivo subido sin celdas legibles.`;
        } else if (isTextLike) {
            if (uploadedBuffer && uploadedBuffer.byteLength > 0) {
                text = decodeTextBuffer(uploadedBuffer);
            }
            text = sanitizeUtf8Text(text || "");
        } else {
            // Para archivos no textuales no-imagen guardamos un rastro recuperable.
            text = `[ARCHIVO ADJUNTO: ${name || "archivo"}] Tipo: ${safeType}.`;
        }

        // Verificar acceso al negocio (admin, owner, o trial limitado)
        try {
            await authorizeBusinessAccessSession(session, businessId);
        } catch (authErr: any) {
            return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
        }

        const safeText = sanitizeUtf8Text(text || "");
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
                layer,
            },
        });

        if (enqueue.missingQueueTable) {
            // Fallback temporal para no romper el flujo si la migración aún no está aplicada.
            const chunkCount = await ingestionService.ingestText(businessId, safeText, {
                fileName: name || "document",
                fileType: safeType,
                fileUrl,
                layer,
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
            await processKnowledgeQueueBatch(1).catch((queueError) => {
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
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const validation = validateData<KnowledgeQueryInput>({ businessId: searchParams.get("businessId") }, knowledgeQuerySchema);

        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        const { businessId } = validation.data!;

        // Verificar acceso al negocio (admin, owner, o trial limitado)
        try {
            await authorizeBusinessAccessSession(session, businessId);
        } catch (authErr: any) {
            return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
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
                ? metadata as {
                    fileName?: unknown;
                    fileUrl?: unknown;
                    fileType?: unknown;
                    source?: unknown;
                    sourceId?: unknown;
                    parentFolderId?: unknown;
                    driveFileId?: unknown;
                }
                : undefined;

            return {
                id: item.id,
                content: item.content,
                metadata: {
                    fileName: typeof safeMetadata?.fileName === "string" ? safeMetadata.fileName : undefined,
                    fileUrl: typeof safeMetadata?.fileUrl === "string" ? safeMetadata.fileUrl : undefined,
                    fileType: typeof safeMetadata?.fileType === "string" ? safeMetadata.fileType : undefined,
                    source: typeof safeMetadata?.source === "string" ? safeMetadata.source : undefined,
                    sourceId: typeof safeMetadata?.sourceId === "string" ? safeMetadata.sourceId : undefined,
                    parentFolderId: typeof safeMetadata?.parentFolderId === "string" ? safeMetadata.parentFolderId : undefined,
                    driveFileId: typeof safeMetadata?.driveFileId === "string" ? safeMetadata.driveFileId : undefined,
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
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { businessId, itemId, itemIds } = body;

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // Verificar acceso al negocio (admin, owner, o trial limitado)
        try {
            await authorizeBusinessAccessSession(session, businessId);
        } catch (authErr: any) {
            return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
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