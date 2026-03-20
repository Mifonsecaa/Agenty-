import path from "path";

export type SpreadsheetPreviewSheet = {
  name: string;
  rowCount: number;
  headers: string[];
  rows: string[][];
};

export type SpreadsheetCellUpdate = {
  sheet: string;
  cell: string;
  value: string;
};

function loadXlsx() {
  // Keep dynamic require to avoid loading xlsx in routes that do not need it.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("xlsx");
}

export function isSpreadsheetFileName(fileName: string) {
  return /\.(xlsx|xlsm|xls)$/i.test(fileName || "");
}

export function fileTypeFromName(fileName: string) {
  return /\.xlsm$/i.test(fileName) ? "xlsm" : "xlsx";
}

export function normalizeSpreadsheetCellAddress(value: string) {
  const raw = String(value || "").trim().toUpperCase();
  if (!/^[A-Z]{1,4}[1-9][0-9]{0,6}$/.test(raw)) {
    throw new Error("INVALID_CELL_ADDRESS");
  }
  return raw;
}

export function readWorkbookFromBuffer(buffer: Buffer, opts?: { keepVba?: boolean }) {
  const XLSX = loadXlsx();
  return XLSX.read(buffer, {
    type: "buffer",
    cellDates: false,
    bookVBA: Boolean(opts?.keepVba),
  });
}

export function mapSheetPreview(sheet: any, maxRows = 100): Omit<SpreadsheetPreviewSheet, "name"> {
  const XLSX = loadXlsx();
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
    .slice(1, maxRows + 1)
    .map((row: any[]) => row.map((cell: any) => (cell ?? "").toString()));

  return {
    rowCount: rows.length,
    headers: header,
    rows: bodyRows,
  };
}

export function workbookToPreview(buffer: Buffer, opts?: { maxSheets?: number; maxRows?: number }) {
  const workbook = readWorkbookFromBuffer(buffer);
  const maxSheets = opts?.maxSheets ?? 8;
  const maxRows = opts?.maxRows ?? 100;

  return workbook.SheetNames.slice(0, maxSheets).map((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    return {
      name: sheetName,
      ...mapSheetPreview(sheet, maxRows),
    } as SpreadsheetPreviewSheet;
  });
}

export function extractSpreadsheetText(buffer: Buffer) {
  const workbook = readWorkbookFromBuffer(buffer);
  const selectedSheets = workbook.SheetNames.slice(0, 4);
  const blocks: string[] = [];
  const XLSX = loadXlsx();

  for (const sheetName of selectedSheets) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      blankrows: false,
    }) as unknown[][];

    const limitedRows = rows.slice(0, 220);
    const lines = limitedRows
      .map((row: unknown[]) => row.map((cell: unknown) => (cell ?? "").toString().trim()).join(" | ").trim())
      .filter(Boolean);

    if (lines.length > 0) {
      blocks.push(`[HOJA: ${sheetName}]\n${lines.join("\n")}`);
    }
  }

  return blocks.join("\n\n");
}

export function applyCellUpdatesToWorkbookBuffer(buffer: Buffer, updates: SpreadsheetCellUpdate[], fileName: string) {
  const XLSX = loadXlsx();
  const workbook = readWorkbookFromBuffer(buffer, { keepVba: true });

  for (const update of updates) {
    const sheetName = String(update.sheet || "").trim();
    const cellAddress = normalizeSpreadsheetCellAddress(update.cell);

    if (!sheetName || !workbook.Sheets[sheetName]) {
      throw new Error(`SHEET_NOT_FOUND:${sheetName}`);
    }

    const sheet = workbook.Sheets[sheetName];
    XLSX.utils.sheet_add_aoa(sheet, [[String(update.value ?? "")]], { origin: cellAddress });

    const currentRange = sheet["!ref"] || "A1:A1";
    const decoded = XLSX.utils.decode_range(currentRange);
    const point = XLSX.utils.decode_cell(cellAddress);
    decoded.s.r = Math.min(decoded.s.r, point.r);
    decoded.s.c = Math.min(decoded.s.c, point.c);
    decoded.e.r = Math.max(decoded.e.r, point.r);
    decoded.e.c = Math.max(decoded.e.c, point.c);
    sheet["!ref"] = XLSX.utils.encode_range(decoded);
  }

  const outputType = fileTypeFromName(path.basename(fileName));
  const out = XLSX.write(workbook, {
    type: "buffer",
    bookType: outputType,
    bookVBA: outputType === "xlsm",
  });

  return Buffer.from(out);
}

