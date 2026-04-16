import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorizeBusinessAccessSession } from '@/lib/auth';
import path from "path";
import { readFile } from "fs/promises";
import { isSpreadsheetFileName, workbookToPreview } from "@/lib/knowledge/spreadsheet";

async function loadSpreadsheetBufferFromUrl(fileUrl: string, cacheBuster?: string | null) {
  const normalizedFileUrl = fileUrl.trim();

  if (normalizedFileUrl.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), "public", normalizedFileUrl.replace(/^\//, ""));
    return readFile(localPath);
  }

  if (/^https?:\/\//i.test(normalizedFileUrl)) {
    let effectiveUrl = normalizedFileUrl;
    if (cacheBuster) {
      try {
        const parsed = new URL(normalizedFileUrl);
        parsed.searchParams.set("_ts", cacheBuster);
        effectiveUrl = parsed.toString();
      } catch {
        // Si no es URL parseable, usamos la original.
      }
    }

    const response = await fetch(effectiveUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`REMOTE_FILE_FETCH_FAILED:${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("UNSUPPORTED_FILE_URL");
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const fileUrl = searchParams.get("fileUrl");
    const cacheBuster = searchParams.get("_ts");

    if (!businessId || !fileUrl) {
      return NextResponse.json({ error: "businessId y fileUrl son requeridos" }, { status: 400 });
    }

    try {
      await authorizeBusinessAccessSession(session, businessId);
    } catch (authErr: any) {
      return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
    }

    const normalizedFileUrl = fileUrl.trim();
    const fileName = decodeURIComponent(normalizedFileUrl.split("/").pop() || "");
    if (!isSpreadsheetFileName(fileName)) {
      return NextResponse.json({ error: "Solo se pueden previsualizar archivos .xlsx, .xlsm o .xls" }, { status: 400 });
    }

    const buffer = await loadSpreadsheetBufferFromUrl(normalizedFileUrl, cacheBuster);
    const sheets = workbookToPreview(buffer, { maxSheets: 8, maxRows: 100 });

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        fileUrl: normalizedFileUrl,
        sheets,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Knowledge Preview] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
