import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { enqueueKnowledgeIngestion, processKnowledgeQueueBatch } from "@/lib/rag/queue";
import {
  applyCellUpdatesToWorkbookBuffer,
  extractSpreadsheetText,
  isSpreadsheetFileName,
  type SpreadsheetCellUpdate,
} from "@/lib/knowledge/spreadsheet";
import { replaceKnowledgeFileByPublicUrl } from "@/lib/storage/knowledge-files";
import path from "path";
import { readFile, writeFile } from "fs/promises";

type SpreadsheetPatchPayload = {
  businessId: string;
  fileUrl: string;
  fileName?: string;
  updates: SpreadsheetCellUpdate[];
};

async function loadFileBuffer(fileUrl: string) {
  if (fileUrl.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
    const buffer = await readFile(localPath);
    return { buffer, localPath, source: "local" as const };
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    const res = await fetch(fileUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`REMOTE_FILE_FETCH_FAILED:${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, source: "remote" as const };
  }

  throw new Error("UNSUPPORTED_FILE_URL");
}

function sanitizeUpdates(updates: SpreadsheetCellUpdate[]) {
  return updates
    .filter((u) => u && typeof u.sheet === "string" && typeof u.cell === "string")
    .slice(0, 50)
    .map((u) => ({
      sheet: u.sheet,
      cell: u.cell,
      value: typeof u.value === "string" ? u.value : String(u.value ?? ""),
    }));
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SpreadsheetPatchPayload;
    const businessId = String(body?.businessId || "").trim();
    const fileUrl = String(body?.fileUrl || "").trim();
    const updates = sanitizeUpdates(Array.isArray(body?.updates) ? body.updates : []);

    if (!businessId || !fileUrl || updates.length === 0) {
      return NextResponse.json({ error: "businessId, fileUrl y updates son requeridos" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
    }

    const inferredName = decodeURIComponent(fileUrl.split("/").pop() || "archivo.xlsx");
    const fileName = String(body?.fileName || inferredName);
    if (!isSpreadsheetFileName(fileName)) {
      return NextResponse.json({ error: "Solo se permiten archivos .xlsx, .xlsm o .xls" }, { status: 400 });
    }

    const loaded = await loadFileBuffer(fileUrl);
    const updatedBuffer = applyCellUpdatesToWorkbookBuffer(loaded.buffer, updates, fileName);

    if (loaded.source === "local" && loaded.localPath) {
      await writeFile(loaded.localPath, updatedBuffer);
    } else {
      const replaceResult = await replaceKnowledgeFileByPublicUrl({
        publicUrl: fileUrl,
        buffer: updatedBuffer,
        contentType: /\.xlsm$/i.test(fileName)
          ? "application/vnd.ms-excel.sheet.macroEnabled.12"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (!replaceResult.success) {
        return NextResponse.json(
          { error: replaceResult.error || "No se pudo actualizar el archivo en storage" },
          { status: 422 }
        );
      }
    }

    const extractedText = extractSpreadsheetText(updatedBuffer);
    const text = extractedText
      ? `[EXCEL_ACTUALIZADO: ${fileName}]\n${extractedText}`
      : `[EXCEL_ACTUALIZADO: ${fileName}] Archivo actualizado sin celdas legibles.`;

    const enqueue = await enqueueKnowledgeIngestion({
      businessId,
      text,
      metadata: {
        fileName,
        fileType: /\.xlsm$/i.test(fileName)
          ? "application/vnd.ms-excel.sheet.macroEnabled.12"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileUrl,
        source: "spreadsheet_update",
        updatedCells: updates.map((u) => ({ sheet: u.sheet, cell: u.cell })),
        updatedAt: new Date().toISOString(),
      },
    });

    await processKnowledgeQueueBatch(1).catch((queueError) => {
      console.error("[Knowledge Spreadsheet PATCH] Queue kickoff error:", queueError);
    });

    const responseBody = {
      success: true,
      queued: true,
      deduplicated: enqueue.deduplicated,
      jobId: enqueue.job?.id || null,
      status: enqueue.job?.status || "PENDING",
      updatedAt: new Date().toISOString(),
      updatedCells: updates.map((u) => ({ sheet: u.sheet, cell: u.cell })),
      message: "Archivo Excel actualizado y reindexado en la base de conocimiento.",
    };

    return NextResponse.json(responseBody, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Knowledge Spreadsheet PATCH] Error:", error);
    return NextResponse.json({ error: "No se pudo actualizar el archivo Excel" }, { status: 500 });
  }
}

function isSpreadsheetByMeta(fileName?: string, fileType?: string) {
  if (isSpreadsheetFileName(fileName || "")) return true;
  return [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel",
  ].includes(fileType || "");
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = String(searchParams.get("businessId") || "").trim();
    if (!businessId) {
      return NextResponse.json({ error: "businessId es requerido" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
    }

    const rows = await prisma.knowledgeItem.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      select: { metadata: true, createdAt: true },
      take: 2000,
    });

    const seen = new Set<string>();
    const files: Array<{ fileUrl: string; fileName: string; fileType: string; lastUpdatedAt: string | null }> = [];
    const lastUpdatedByUrl = new Map<string, string>();
    let missingFileUrlCount = 0;

    for (const row of rows) {
      const md = row.metadata;
      if (!md || typeof md !== "object" || Array.isArray(md)) continue;

      const meta = md as Record<string, unknown>;
      const fileName = typeof meta.fileName === "string" ? meta.fileName : "archivo.xlsx";
      const fileType = typeof meta.fileType === "string" ? meta.fileType : "";
      const fileUrl = typeof meta.fileUrl === "string" ? meta.fileUrl : "";
      const metadataUpdatedAt = typeof meta.updatedAt === "string" ? meta.updatedAt : null;
      const createdAtIso = row.createdAt?.toISOString?.() || null;
      const effectiveUpdatedAt = metadataUpdatedAt || createdAtIso;

      if (fileUrl && effectiveUpdatedAt && !lastUpdatedByUrl.has(fileUrl)) {
        lastUpdatedByUrl.set(fileUrl, effectiveUpdatedAt);
      }

      if (!isSpreadsheetByMeta(fileName, fileType)) continue;
      if (!fileUrl) {
        missingFileUrlCount++;
        continue;
      }
      if (seen.has(fileUrl)) continue;

      seen.add(fileUrl);
      files.push({
        fileUrl,
        fileName,
        fileType,
        lastUpdatedAt: lastUpdatedByUrl.get(fileUrl) || null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        files,
        missingFileUrlCount,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Knowledge Spreadsheet GET] Error:", error);
    return NextResponse.json({ error: "No se pudo listar archivos Excel" }, { status: 500 });
  }
}

