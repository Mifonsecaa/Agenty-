import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ingestionService } from "@/lib/rag/ingestion";
import { knowledgeQuerySchema, knowledgeCreateSchema, type KnowledgeQueryInput, type KnowledgeCreateInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import type { KnowledgeItem, KnowledgeListData } from "@/types/knowledge";


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

        let { businessId, text, name, type } = validation.data!;

        if (type === "application/pdf") {
            try {
                console.log("[API Knowledge] Cargando pdf-parse...");
                const pdf = require("pdf-parse");
                const buffer = Buffer.from(text, "base64");
                console.log(`[API Knowledge] Buffer creado, tamaño: ${buffer.length}`);
                const data = await pdf(buffer);
                text = data.text;
                console.log(`[API Knowledge] PDF procesado: ${name} (${text.length} caracteres)`);
            } catch (pdfError: any) {
                console.error("[API Knowledge] Error parseando PDF:", pdfError);
                return NextResponse.json({
                    error: "Failed to parse PDF",
                    details: pdfError.message || String(pdfError),
                    stack: pdfError.stack
                }, { status: 422 });
            }
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
        }        // Ingerir el texto en la base de datos vectorial
        const chunkCount = await ingestionService.ingestText(businessId, text, {
            fileName: name || "document",
            fileType: type || "txt"
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
                ? metadata as { fileName?: unknown }
                : undefined;

            return {
                id: item.id,
                content: item.content,
                metadata: {
                    fileName: typeof safeMetadata?.fileName === "string" ? safeMetadata.fileName : undefined,
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

        const { businessId } = await req.json();

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        await ingestionService.deleteAllKnowledge(businessId);

        return NextResponse.json({ success: true, message: "Conocimiento eliminado." });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
