import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import path from "path";
import { readFile } from "fs/promises";
import { isSpreadsheetFileName, workbookToPreview } from "@/lib/knowledge/spreadsheet";

async function loadSpreadsheetBufferFromUrl(fileUrl: string) {
  const normalizedFileUrl = fileUrl.trim();

  if (normalizedFileUrl.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), "public", normalizedFileUrl.replace(/^\//, ""));
    return readFile(localPath);
  }

  if (/^https?:\/\//i.test(normalizedFileUrl)) {
    const response = await fetch(normalizedFileUrl);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const fileUrl = searchParams.get("fileUrl");

    if (!businessId || !fileUrl) {
      return NextResponse.json({ error: "businessId y fileUrl son requeridos" }, { status: 400 });
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

    const normalizedFileUrl = fileUrl.trim();
    const fileName = decodeURIComponent(normalizedFileUrl.split("/").pop() || "");
    if (!isSpreadsheetFileName(fileName)) {
      return NextResponse.json({ error: "Solo se pueden previsualizar archivos .xlsx y .xlsm" }, { status: 400 });
    }

    const buffer = await loadSpreadsheetBufferFromUrl(normalizedFileUrl);
    const sheets = workbookToPreview(buffer, { maxSheets: 8, maxRows: 100 });

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        fileUrl: normalizedFileUrl,
        sheets,
      },
    });
  } catch (error) {
    console.error("[Knowledge Preview] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
