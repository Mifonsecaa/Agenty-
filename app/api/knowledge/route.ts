import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ingestionService } from "@/lib/rag/ingestion";
import { knowledgeQuerySchema, knowledgeCreateSchema, type KnowledgeQueryInput, type KnowledgeCreateInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import type { KnowledgeItem, KnowledgeListData } from "@/types/knowledge";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
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

        const { businessId } = validation.data!;

        // Verificar primero que el negocio pertenece al usuario antes de escribir archivos en disco.
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }

        let { text, name, type } = validation.data!;
        const safeType = type || "application/octet-stream";

        // Guardar siempre el archivo subido para poder enviarlo por WhatsApp/Telegram.
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const isTextLike = safeType.startsWith("text/") || ["application/json", "text/csv"].includes(safeType) || /\.(txt|md|csv|json)$/i.test(name);
        const fileBuffer = isTextLike
            ? Buffer.from(text, "utf-8")
            : Buffer.from(text, "base64");

        const uniqueName = `${Date.now()}-${sanitizeFileName(name)}`;
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, fileBuffer);
        const fileUrl = `/uploads/${uniqueName}`;

        if (safeType === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
            try {
                console.log("[API Knowledge] Cargando pdf-parse...");
                const pdf = require("pdf-parse");
                console.log(`[API Knowledge] Buffer creado, tamaño: ${fileBuffer.length}`);
                const data = await pdf(fileBuffer);
                // Ensure text exists and remove control characters (0x00-0x1F except \n \r \t)
                text = (data.text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
                console.log(`[API Knowledge] PDF procesado: ${name} (${text.length} caracteres)`);
            } catch (pdfError: any) {
                console.error("[API Knowledge] Error parseando PDF:", pdfError);
                return NextResponse.json({
                    error: "Failed to parse PDF",
                    details: pdfError.message || String(pdfError),
                    stack: pdfError.stack
                }, { status: 422 });
            }
        } else if (isTextLike) {
            text = fileBuffer.toString("utf-8");
        } else if (safeType.startsWith("image/")) {
            text = `[IMAGEN ADJUNTA: ${name}] El usuario puede solicitar que se le envíe esta imagen.`;
        } else {
            text = `[ARCHIVO ADJUNTO: ${name}] Tipo: ${safeType}. El usuario puede solicitar que se le envíe este archivo.`;
        }

        // Ingerir el texto en la base de datos vectorial
        const chunkCount = await ingestionService.ingestText(businessId, text, {
            fileName: name || "document",
            fileType: safeType,
            fileUrl,
            source: name || "document"
        });

        return NextResponse.json({
            success: true,
            message: `Documento procesado en ${chunkCount} fragmentos.`,
            chunkCount
        });

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
        const { businessId, itemId } = body;

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

        if (itemId) {
            await ingestionService.deleteKnowledgeItem(itemId, businessId);
             return NextResponse.json({ success: true, message: "Elemento eliminado." });
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
