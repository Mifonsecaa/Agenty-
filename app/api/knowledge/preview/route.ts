import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import path from "path";
import { readFile } from "fs/promises";

function isSpreadsheetFile(fileName: string) {
  return /\.(xlsx|xlsm)$/i.test(fileName);
}

function mapSheetPreview(sheet: any, XLSX: any) {
  // Utilizamos 'as any[][]' para blindar el código contra el compilador estricto de Vercel
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    blankrows: false,
  }) as any[][];

  const firstRow = rows[0] || [];
  const header = firstRow.map((cell: any, idx: number) => {
    const value = (cell ?? "").toString().trim();
    return value || `Col ${idx + 1}`;
  });

  const bodyRows = rows
      .slice(1, 101)
      .map((row: any[]) => row.map((cell: any) => (cell ?? "").toString()));

  return {
    rowCount: rows.length,
    headers: header,
    rows: bodyRows,
  };
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
    if (!normalizedFileUrl.startsWith("/uploads/")) {
      return NextResponse.json({ error: "Archivo no soportado para previsualizacion" }, { status: 400 });
    }

    const fileName = decodeURIComponent(normalizedFileUrl.split("/").pop() || "");
    if (!isSpreadsheetFile(fileName)) {
      return NextResponse.json({ error: "Solo se pueden previsualizar archivos .xlsx y .xlsm" }, { status: 400 });
    }

    const localPath = path.join(process.cwd(), "public", normalizedFileUrl.replace(/^\//, ""));
    const buffer = await readFile(localPath);

    // El require se mantiene dentro de la función para no afectar el renderizado inicial
    const XLSX = require("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheets = workbook.SheetNames.slice(0, 8).map((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      return {
        name: sheetName,
        ...mapSheetPreview(sheet, XLSX),
      };
    });

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
