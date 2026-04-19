"use client";
import { useState, useEffect, useMemo } from "react";
import { Calendar, CreditCard, ShoppingBag, Mail, Blocks, FileSpreadsheet } from "lucide-react";
import { useBrainia } from "@/context/BrainiaContext";
import { useRouter, useSearchParams } from "next/navigation";
import ActionConfirmationPanel from "@/components/dashboard/ActionConfirmationPanel";
import { getDashboardCopy } from "@/components/dashboard/dashboardCopy";

type ToolCard = {
    id: number;
    slug: "google-calendar" | "payments" | "shopify" | "email" | "knowledge-excel-viewer";
    name: string;
    description: string;
    icon: React.ReactNode;
    status: "connected" | "disconnected";
    category: string;
};

type ExcelKnowledgeFile = {
    fileUrl: string;
    fileName: string;
    fileType: string;
    lastUpdatedAt?: string | null;
};

const EXCEL_REFRESH_POLL_MS = 6000;

type SpreadsheetPreview = {
    success: boolean;
    data?: {
        fileName: string;
        fileUrl: string;
        sheets: Array<{
            name: string;
            rowCount: number;
            headers: string[];
            rows: string[][];
        }>;
    };
    error?: string;
};

function isSpreadsheetFile(fileName: string, fileType?: string) {
    if (/\.(xlsx|xlsm|xls)$/i.test(fileName)) return true;
    return [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "application/vnd.ms-excel",
    ].includes(fileType || "");
}

function columnIndexToLabel(index: number) {
    let value = index;
    let label = "";
    while (value >= 0) {
        label = String.fromCharCode((value % 26) + 65) + label;
        value = Math.floor(value / 26) - 1;
    }
    return label;
}

function spreadsheetCellAddress(rowIndexZeroBased: number, colIndexZeroBased: number) {
    // rowIndex 0 corresponde a la fila 2 de Excel porque la fila 1 son headers.
    return `${columnIndexToLabel(colIndexZeroBased)}${rowIndexZeroBased + 2}`;
}

function nextSpreadsheetRowNumber(rowCount: number) {
    // rowCount incluye headers; la primera fila editable es la 2.
    return Math.max(2, Number(rowCount || 0) + 1);
}

function parseRowNumberFromCellAddress(cell: string) {
    const match = String(cell || "").toUpperCase().match(/^[A-Z]+([1-9][0-9]*)$/);
    return match ? Number(match[1]) : null;
}

function ExcelViewerModal({
    businessId,
    files,
    missingFileUrlCount,
    loadingFiles,
    loadingPreview,
    preview,
    selectedFile,
    onClose,
    onSelectFile,
    onApplyUpdate,
}: {
    businessId: string;
    files: ExcelKnowledgeFile[];
    missingFileUrlCount: number;
    loadingFiles: boolean;
    loadingPreview: boolean;
    preview: SpreadsheetPreview["data"] | null;
    selectedFile: string | null;
    onClose: () => void;
    onSelectFile: (file: ExcelKnowledgeFile) => void;
    onApplyUpdate: (params: {
        businessId: string;
        file: ExcelKnowledgeFile;
        updates: Array<{ sheet: string; cell: string; value: string }>;
    }) => Promise<void>;
}) {
    const [activeSheetFilter, setActiveSheetFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [onlyMatchingRows, setOnlyMatchingRows] = useState(true);
    const [editTargetSheet, setEditTargetSheet] = useState("");
    const [selectedCell, setSelectedCell] = useState<{
        key: string;
        sheet: string;
        rowIndex: number;
        colIndex: number;
        cell: string;
        header: string;
        value: string;
    } | null>(null);
    const [draftUpdates, setDraftUpdates] = useState<Array<{ key: string; sheet: string; cell: string; value: string }>>([]);
    const [editValue, setEditValue] = useState("");
    const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
    const [localNotice, setLocalNotice] = useState<string | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!preview?.sheets?.length) return;
        setActiveSheetFilter((prev) => (prev === "all" ? preview.sheets[0].name : prev));
        setSearchTerm("");
        setOnlyMatchingRows(true);
        setEditTargetSheet(preview.sheets[0].name);
        setSelectedCell(null);
        setDraftUpdates([]);
        setEditValue("");
        setNewRowValues({});
        setLocalNotice(null);
    }, [preview?.fileUrl]);

    const selectedFileData = files.find((f) => f.fileUrl === selectedFile) || null;
    const draftMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const update of draftUpdates) {
            map.set(update.key, update.value);
        }
        return map;
    }, [draftUpdates]);

    const pendingRowsBySheet = useMemo(() => {
        const map = new Map<string, number[]>();
        for (const update of draftUpdates) {
            const row = parseRowNumberFromCellAddress(update.cell);
            if (!row) continue;
            const list = map.get(update.sheet) || [];
            list.push(row);
            map.set(update.sheet, list);
        }
        return map;
    }, [draftUpdates]);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const targetSheet = useMemo(() => {
        const sheets = preview?.sheets || [];
        return sheets.find((sheet) => sheet.name === editTargetSheet) || sheets[0] || null;
    }, [preview?.sheets, editTargetSheet]);

    const getNextRowForSheet = (sheetName: string, sheetRowCount: number) => {
        const pendingRows = pendingRowsBySheet.get(sheetName) || [];
        const baseNext = nextSpreadsheetRowNumber(sheetRowCount);
        if (!pendingRows.length) return baseNext;
        return Math.max(baseNext, Math.max(...pendingRows) + 1);
    };

    useEffect(() => {
        if (!targetSheet) {
            setNewRowValues({});
            return;
        }

        const initialValues: Record<string, string> = {};
        for (const header of targetSheet.headers.slice(0, 18)) {
            initialValues[header] = "";
        }
        setNewRowValues(initialValues);
    }, [targetSheet?.name]);

    const visibleSheets = useMemo(() => {
        const allSheets = preview?.sheets || [];
        const filteredBySheet = activeSheetFilter === "all"
            ? allSheets
            : allSheets.filter((sheet) => sheet.name === activeSheetFilter);

        return filteredBySheet.map((sheet) => {
            const indexedRows = sheet.rows.map((row, rowIndex) => ({ row, rowIndex }));
            const rows = !normalizedSearch || !onlyMatchingRows
                ? indexedRows
                : indexedRows.filter(({ row }) => {
                    const haystack = row.join(" ").toLowerCase();
                    return haystack.includes(normalizedSearch);
                });

            return {
                ...sheet,
                indexedRows: rows,
            };
        });
    }, [preview?.sheets, activeSheetFilter, normalizedSearch, onlyMatchingRows]);

    const handleCellClick = (params: {
        sheet: string;
        rowIndex: number;
        colIndex: number;
        header: string;
        rawValue: string;
    }) => {
        const cell = spreadsheetCellAddress(params.rowIndex, params.colIndex);
        const key = `${params.sheet}|${params.rowIndex}|${params.colIndex}`;
        const value = draftMap.get(key) ?? params.rawValue;
        setSelectedCell({
            key,
            sheet: params.sheet,
            rowIndex: params.rowIndex,
            colIndex: params.colIndex,
            cell,
            header: params.header,
            value,
        });
        setEditValue(value);
        setEditTargetSheet(params.sheet);
        setLocalNotice(null);
    };

    const handleStageUpdate = () => {
        if (!selectedCell) return;
        const next = {
            key: selectedCell.key,
            sheet: selectedCell.sheet,
            cell: selectedCell.cell,
            value: editValue,
        };

        setDraftUpdates((prev) => {
            const withoutCurrent = prev.filter((item) => item.key !== selectedCell.key);
            return [...withoutCurrent, next];
        });
        setSelectedCell((prev) => (prev ? { ...prev, value: editValue } : prev));
        setLocalNotice(`Cambio agregado al borrador: ${selectedCell.sheet}!${selectedCell.cell}`);
    };

    const handleStageNewRow = () => {
        if (!targetSheet) return;

        const nextRow = getNextRowForSheet(targetSheet.name, targetSheet.rowCount);
        const updates = targetSheet.headers
            .map((header, colIndex) => {
                const value = String(newRowValues[header] || "").trim();
                if (!value) return null;

                const cell = `${columnIndexToLabel(colIndex)}${nextRow}`;
                return {
                    key: `${targetSheet.name}|${nextRow - 2}|${colIndex}`,
                    sheet: targetSheet.name,
                    cell,
                    value,
                };
            })
            .filter((item): item is { key: string; sheet: string; cell: string; value: string } => Boolean(item));

        if (updates.length === 0) {
            setLocalNotice("Completa al menos una columna para agregar un registro nuevo.");
            return;
        }

        setDraftUpdates((prev) => {
            const map = new Map<string, { key: string; sheet: string; cell: string; value: string }>();
            for (const item of prev) map.set(item.key, item);
            for (const item of updates) map.set(item.key, item);
            return Array.from(map.values());
        });

        const initialValues: Record<string, string> = {};
        for (const header of targetSheet.headers) {
            initialValues[header] = "";
        }
        setNewRowValues(initialValues);
        setActiveSheetFilter(targetSheet.name);
        setLocalNotice(`Registro nuevo agregado al borrador en ${targetSheet.name}, fila ${nextRow}.`);
    };

    const handleAddAndSaveNewRowNow = async () => {
        if (!targetSheet || !selectedFileData) return;

        const nextRow = getNextRowForSheet(targetSheet.name, targetSheet.rowCount);
        const updates = targetSheet.headers
            .map((header, colIndex) => {
                const value = String(newRowValues[header] || "").trim();
                if (!value) return null;
                return {
                    sheet: targetSheet.name,
                    cell: `${columnIndexToLabel(colIndex)}${nextRow}`,
                    value,
                };
            })
            .filter((item): item is { sheet: string; cell: string; value: string } => Boolean(item));

        if (updates.length === 0) {
            setLocalNotice("Completa al menos una columna para guardar un registro nuevo.");
            return;
        }

        setSavingEdit(true);
        try {
            await onApplyUpdate({
                businessId,
                file: selectedFileData,
                updates,
            });

            const initialValues: Record<string, string> = {};
            for (const header of targetSheet.headers) {
                initialValues[header] = "";
            }
            setNewRowValues(initialValues);
            setDraftUpdates([]);
            setSelectedCell(null);
            setEditValue("");
            setLocalNotice(`Registro guardado y reindexado en ${targetSheet.name}, fila ${nextRow}.`);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDiscardDrafts = () => {
        setDraftUpdates([]);
        if (selectedCell) {
            setEditValue(selectedCell.value);
        }
        setLocalNotice("Borrador descartado.");
    };

    const handleApplyEdit = async () => {
        if (!selectedFileData || draftUpdates.length === 0) return;
        setSavingEdit(true);
        try {
            await onApplyUpdate({
                businessId,
                file: selectedFileData,
                updates: draftUpdates.map((item) => ({
                    sheet: item.sheet,
                    cell: item.cell,
                    value: item.value,
                })),
            });
            setSelectedCell(null);
            setDraftUpdates([]);
            setEditValue("");
            setLocalNotice("Cambios guardados y reindexados correctamente.");
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-[#090b12]">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                        Hojas de calculo (.xlsx / .xlsm / .xls)
                    </h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">Cerrar</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[65vh]">
                    <aside className="border-r border-white/10 p-4 overflow-y-auto">
                        <p className="text-xs text-white/50 mb-3">Archivos subidos por el usuario</p>
                        {loadingFiles ? (
                            <p className="text-sm text-white/60">Cargando archivos...</p>
                        ) : files.length === 0 ? (
                            <p className="text-sm text-white/60">
                                {missingFileUrlCount > 0
                                    ? "Hay archivos Excel en la base de conocimiento, pero no tienen URL persistente para abrirlos en el visor."
                                    : "No hay archivos Excel en tu base de conocimiento."}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file) => (
                                    <button
                                        key={file.fileUrl}
                                        onClick={() => onSelectFile(file)}
                                        className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${selectedFile === file.fileUrl ? "border-emerald-400/60 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                                    >
                                        <p className="text-sm text-white truncate">{file.fileName}</p>
                                        <p className="text-[11px] text-white/50 truncate">{file.fileType || "spreadsheet"}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </aside>

                    <section className="lg:col-span-2 p-4 overflow-y-auto space-y-4">
                        <div className="rounded-xl border border-white/10 bg-white/3 p-3">
                            <p className="text-xs text-white/60 mb-2">Filtros y edicion (clic en una celda para editarla)</p>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar en filas (ej: David, 10:30, reserva)"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white md:col-span-2"
                                    disabled={!preview || savingEdit}
                                />
                                <select
                                    value={activeSheetFilter}
                                    onChange={(e) => setActiveSheetFilter(e.target.value)}
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled={!preview || savingEdit}
                                >
                                    <option value="all">Todas las hojas</option>
                                    {(preview?.sheets || []).map((sheet) => (
                                        <option key={sheet.name} value={sheet.name}>{sheet.name}</option>
                                    ))}
                                </select>
                                <label className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={onlyMatchingRows}
                                        onChange={(e) => setOnlyMatchingRows(e.target.checked)}
                                        disabled={!preview || savingEdit}
                                    />
                                    Solo coincidencias
                                </label>
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setOnlyMatchingRows(true);
                                        setActiveSheetFilter(preview?.sheets?.[0]?.name || "all");
                                    }}
                                    className="rounded-lg bg-white/10 border border-white/15 px-2 py-2 text-xs text-white hover:bg-white/15"
                                    disabled={!preview || savingEdit}
                                >
                                    Limpiar filtros
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
                                <input
                                    value={selectedCell?.sheet || ""}
                                    placeholder="Hoja"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled
                                />
                                <input
                                    value={selectedCell?.cell || ""}
                                    placeholder="Celda"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled
                                />
                                <input
                                    value={selectedCell?.header || ""}
                                    placeholder="Columna"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled
                                />
                                <input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Nuevo valor para la celda seleccionada"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white md:col-span-2"
                                    disabled={savingEdit || !selectedCell}
                                />
                                <button
                                    onClick={handleStageUpdate}
                                    disabled={!selectedCell || savingEdit}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white disabled:opacity-40"
                                >
                                    Agregar cambio
                                </button>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    onClick={handleApplyEdit}
                                    disabled={!selectedFileData || draftUpdates.length === 0 || savingEdit}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-black disabled:opacity-40"
                                >
                                    {savingEdit ? "Guardando..." : `Guardar ${draftUpdates.length} cambio(s)`}
                                </button>
                                <button
                                    onClick={handleDiscardDrafts}
                                    disabled={draftUpdates.length === 0 || savingEdit}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white disabled:opacity-40"
                                >
                                    Descartar borrador
                                </button>
                                <p className="text-[11px] text-white/55">
                                    {selectedCell
                                        ? `Celda activa: ${selectedCell.sheet}!${selectedCell.cell}`
                                        : "Selecciona una celda en la grilla para editarla."}
                                </p>
                            </div>

                            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                                <p className="text-xs text-white/70">Agregar registro manual (nueva fila)</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <select
                                        value={editTargetSheet}
                                        onChange={(e) => setEditTargetSheet(e.target.value)}
                                        className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                        disabled={!preview || savingEdit}
                                    >
                                        {(preview?.sheets || []).map((sheet) => (
                                            <option key={`new-row-${sheet.name}`} value={sheet.name}>{sheet.name}</option>
                                        ))}
                                    </select>
                                    <p className="md:col-span-3 text-[11px] text-white/50 self-center">
                                        Se guardara en la siguiente fila disponible ({targetSheet ? getNextRowForSheet(targetSheet.name, targetSheet.rowCount) : "-"}).
                                    </p>
                                </div>

                                <div className="max-h-48 overflow-auto pr-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {(targetSheet?.headers || []).map((header, colIndex) => (
                                            <input
                                                key={`new-row-input-${header}-${colIndex}`}
                                                value={newRowValues[header] || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNewRowValues((prev) => ({ ...prev, [header]: value }));
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key !== "Enter") return;
                                                    e.preventDefault();
                                                    if (e.ctrlKey || e.metaKey) {
                                                        void handleAddAndSaveNewRowNow();
                                                        return;
                                                    }
                                                    handleStageNewRow();
                                                }}
                                                placeholder={header || `Col ${colIndex + 1}`}
                                                className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                                disabled={savingEdit || !targetSheet}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleStageNewRow}
                                        disabled={savingEdit || !targetSheet}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500 text-white disabled:opacity-40"
                                    >
                                        Agregar registro al borrador
                                    </button>
                                    <button
                                        onClick={() => {
                                            void handleAddAndSaveNewRowNow();
                                        }}
                                        disabled={savingEdit || !targetSheet || !selectedFileData}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-black disabled:opacity-40"
                                    >
                                        Agregar y guardar ahora
                                    </button>
                                    <p className="text-[11px] text-white/50">Enter: borrador. Ctrl+Enter: guardar inmediato.</p>
                                </div>
                            </div>

                            {localNotice && (
                                <p className="mt-2 text-[11px] text-emerald-300">{localNotice}</p>
                            )}
                        </div>

                        {loadingPreview ? (
                            <p className="text-sm text-white/60">Cargando previsualizacion...</p>
                        ) : !preview ? (
                            <p className="text-sm text-white/60">Selecciona un archivo para abrir el visor.</p>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm text-white/80">{preview.fileName}</h4>
                                {visibleSheets.map((sheet) => (
                                    <div key={sheet.name} className="border border-white/10 rounded-xl overflow-hidden">
                                        <div className="px-3 py-2 text-xs bg-white/5 text-white/70 flex justify-between">
                                            <span>Hoja: {sheet.name}</span>
                                            <span>{sheet.rowCount} filas</span>
                                        </div>
                                        <div className="overflow-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        <th className="px-2 py-1 text-left text-white/50 whitespace-nowrap border-b border-white/10">#</th>
                                                        {sheet.headers.slice(0, 18).map((header, idx) => (
                                                            <th key={`${sheet.name}-h-${idx}`} className="px-2 py-1 text-left text-white/70 whitespace-nowrap border-b border-white/10">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sheet.indexedRows.slice(0, 120).map(({ row, rowIndex }) => (
                                                        <tr key={`${sheet.name}-r-${rowIndex}`} className="border-b border-white/5">
                                                            <td className="px-2 py-1 text-white/40 whitespace-nowrap">{rowIndex + 2}</td>
                                                            {sheet.headers.slice(0, 18).map((header, colIdx) => {
                                                                const key = `${sheet.name}|${rowIndex}|${colIdx}`;
                                                                const isSelected = selectedCell?.key === key;
                                                                const hasDraft = draftMap.has(key);
                                                                const value = draftMap.get(key) ?? row[colIdx] ?? "";

                                                                return (
                                                                    <td key={`${sheet.name}-c-${rowIndex}-${colIdx}`} className="p-0 whitespace-nowrap">
                                                                        <button
                                                                            onClick={() => handleCellClick({
                                                                                sheet: sheet.name,
                                                                                rowIndex,
                                                                                colIndex: colIdx,
                                                                                header,
                                                                                rawValue: row[colIdx] || "",
                                                                            })}
                                                                            className={`w-full text-left px-2 py-1 transition-colors ${isSelected
                                                                                ? "bg-emerald-500/25 text-white"
                                                                                : hasDraft
                                                                                    ? "bg-blue-500/20 text-white"
                                                                                    : "text-white/80 hover:bg-white/10"
                                                                                }`}
                                                                        >
                                                                            {value}
                                                                        </button>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                    {sheet.indexedRows.length === 0 && (
                                                        <tr>
                                                            <td colSpan={Math.min(sheet.headers.length, 18) + 1} className="px-2 py-4 text-center text-white/50">
                                                                No hay filas que coincidan con los filtros actuales.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function ToolsStore() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const copy = getDashboardCopy(searchParams.get("lang") || undefined);
    const { activeAgent, saveAgent, updateActiveAgentConfig } = useBrainia();
    const [tools, setTools] = useState<ToolCard[]>([
        {
            id: 1,
            slug: "google-calendar",
            name: "Google Calendar",
            description: "Permite a tu agente revisar disponibilidad y agendar citas automáticamente.",
            icon: <Calendar className="w-6 h-6 text-blue-400" />,
            status: "connected",
            category: "Productividad"
        },
        {
            id: 2,
            slug: "payments",
            name: "MercadoPago / Wompi",
            description: "Genera links de pago y verifica si el cliente ya pagó la orden.",
            icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
            status: "disconnected",
            category: "Ventas"
        },
        {
            id: 3,
            slug: "shopify",
            name: "Shopify Inventory",
            description: "Conecta tu catálogo para que el agente vea el stock en tiempo real.",
            icon: <ShoppingBag className="w-6 h-6 text-purple-400" />,
            status: "disconnected",
            category: "E-Commerce"
        },
        {
            id: 4,
            slug: "email",
            name: "Gmail / Outlook",
            description: "Envía correos electrónicos con cotizaciones a petición del cliente.",
            icon: <Mail className="w-6 h-6 text-rose-400" />,
            status: "disconnected",
            category: "Productividad"
        },
        {
            id: 5,
            slug: "knowledge-excel-viewer",
            name: "Hojas de calculo",
            description: "Conecta Google y administra hojas de calculo de tu base de conocimiento (.xlsx / .xlsm) en una grilla editable.",
            icon: <FileSpreadsheet className="w-6 h-6 text-emerald-300" />,
            status: "disconnected",
            category: "Knowledge"
        }
    ]);
    const [savingToolId, setSavingToolId] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [pendingDeactivateToolId, setPendingDeactivateToolId] = useState<number | null>(null);
    const [excelViewerOpen, setExcelViewerOpen] = useState(false);
    const [excelFiles, setExcelFiles] = useState<ExcelKnowledgeFile[]>([]);
    const [excelMissingFileUrlCount, setExcelMissingFileUrlCount] = useState(0);
    const [loadingExcelFiles, setLoadingExcelFiles] = useState(false);
    const [selectedExcelFileUrl, setSelectedExcelFileUrl] = useState<string | null>(null);
    const [excelPreview, setExcelPreview] = useState<SpreadsheetPreview["data"] | null>(null);
    const [loadingExcelPreview, setLoadingExcelPreview] = useState(false);

    // Leer tools recomendadas desde el contexto
    useEffect(() => {
        if (!activeAgent) return;

        const config = activeAgent.config || activeAgent;
        if (config.recommendedTools && Array.isArray(config.recommendedTools)) {
            setTools(prevTools => prevTools.map(tool => ({
                ...tool,
                status: config.recommendedTools.includes(tool.id) ? "connected" : "disconnected"
            })));
            return;
        }

        setTools(prevTools => prevTools.map(tool => ({
            ...tool,
            status: tool.status,
        })));
    }, [activeAgent]);

    const handleToggleTool = async (toolId: number) => {
        if (!activeAgent || savingToolId !== null) return;

        setStatusMessage(null);
        setSavingToolId(toolId);

        const previousTools = tools;
        const nextTools: ToolCard[] = previousTools.map((tool) => {
            if (tool.id !== toolId) return tool;
            return {
                ...tool,
                status: tool.status === "connected" ? "disconnected" : "connected",
            };
        });

        // Optimistic update para respuesta inmediata en UI
        setTools(nextTools);

        const recommendedTools = nextTools
            .filter((tool) => tool.status === "connected")
            .map((tool) => tool.id);

        const currentConfig = activeAgent.config || {};
        const mergedConfig = {
            ...currentConfig,
            recommendedTools,
        };

        const saved = await saveAgent(activeAgent.id, activeAgent.name, mergedConfig);

        if (!saved) {
            // Rollback si falla persistencia
            setTools(previousTools);
            setStatusMessage({ type: "error", text: copy.tools.updateError });
            setSavingToolId(null);
            return;
        }

        updateActiveAgentConfig({
            config: mergedConfig,
        });

        setStatusMessage({ type: "success", text: copy.tools.updateSuccess });
        setSavingToolId(null);
    };

    const handlePrimaryAction = (tool: ToolCard) => {
        if (tool.slug === "knowledge-excel-viewer" && tool.status === "connected") {
            void openExcelViewer();
            return;
        }

        if (tool.status === "connected") {
            const configTargetBySlug: Record<ToolCard["slug"], string> = {
                "google-calendar": "/dashboard/settings?tab=integrations&tool=google-calendar",
                "payments": "/dashboard/settings?tab=integrations&tool=payments",
                "shopify": "/dashboard/knowledge",
                "email": "/dashboard/settings?tab=integrations&tool=email",
                "knowledge-excel-viewer": "/dashboard/tools",
            };

            const target = configTargetBySlug[tool.slug];
            setStatusMessage({ type: "success", text: copy.tools.openingConfig(tool.name) });
            router.push(target);
            return;
        }

        handleToggleTool(tool.id);
    };

    const getPrimaryLabel = (tool: ToolCard) => {
        if (savingToolId === tool.id) {
            return tool.status === "connected" ? "Guardando..." : "Conectando...";
        }

        if (tool.status === "connected") {
            if (tool.slug === "knowledge-excel-viewer") return "Abrir hojas";
            return "Configurar";
        }

        return "Conectar";
    };

    const fetchExcelFiles = async ({ silent = false }: { silent?: boolean } = {}) => {
        if (!activeAgent?.id) return [] as ExcelKnowledgeFile[];
        if (!silent) setLoadingExcelFiles(true);

        try {
            const res = await fetch(`/api/knowledge/spreadsheet?businessId=${activeAgent.id}`, { cache: "no-store" });
            const data = await res.json().catch(() => ({}));
            const files: ExcelKnowledgeFile[] = (data?.data?.files || []).filter((f: any) =>
                f?.fileUrl && isSpreadsheetFile(f?.fileName || "", f?.fileType || "")
            );
            const missingFileUrlCount = Number(data?.data?.missingFileUrlCount || 0);

            setExcelFiles(files);
            setExcelMissingFileUrlCount(missingFileUrlCount);

            if (!silent) {
                if (files.length === 0 && missingFileUrlCount > 0) {
                    setStatusMessage({
                        type: "error",
                        text: "Hay archivos Excel en la base de conocimiento sin URL de archivo persistente. Re-subelos para visualizarlos.",
                    });
                } else if (files.length > 0 && missingFileUrlCount > 0) {
                    setStatusMessage({
                        type: "success",
                        text: "Se encontraron archivos Excel visualizables. Algunos registros antiguos sin URL persistente fueron omitidos.",
                    });
                }
            }

            return files;
        } catch (error) {
            if (!silent) {
                console.error("[ToolsStore] Error loading excel files:", error);
                setStatusMessage({ type: "error", text: "No se pudieron cargar archivos Excel de la base de conocimiento." });
            }
            return [] as ExcelKnowledgeFile[];
        } finally {
            if (!silent) setLoadingExcelFiles(false);
        }
    };

    const openExcelViewer = async () => {
        if (!activeAgent?.id) return;

        setExcelViewerOpen(true);
        setLoadingExcelFiles(true);
        setExcelPreview(null);
        setSelectedExcelFileUrl(null);
        setExcelMissingFileUrlCount(0);

        const files = await fetchExcelFiles({ silent: false });
        if (files[0]) {
            void loadExcelPreview(files[0]);
        }
    };

    const loadExcelPreview = async (file: ExcelKnowledgeFile) => {
        if (!activeAgent?.id) return;

        setSelectedExcelFileUrl(file.fileUrl);
        setLoadingExcelPreview(true);

        try {
            const params = new URLSearchParams({
                businessId: activeAgent.id,
                fileUrl: file.fileUrl,
            });
            params.set("_ts", Date.now().toString());
            const res = await fetch(`/api/knowledge/preview?${params.toString()}`, { cache: "no-store" });
            const data: SpreadsheetPreview = await res.json();
            if (!res.ok || !data.success || !data.data) {
                setStatusMessage({ type: "error", text: data.error || "No se pudo abrir el archivo Excel." });
                setExcelPreview(null);
                return;
            }

            setExcelPreview(data.data);
        } catch (error: any) {
            console.error("[ToolsStore] Error loading excel preview:", error);
            setStatusMessage({ type: "error", text: error.message || "No se pudo abrir el archivo Excel." });
            setExcelPreview(null);
        } finally {
            setLoadingExcelPreview(false);
        }
    };

    const applyExcelUpdate = async ({
        businessId,
        file,
        updates,
    }: {
        businessId: string;
        file: ExcelKnowledgeFile;
        updates: Array<{ sheet: string; cell: string; value: string }>;
    }) => {
        const res = await fetch("/api/knowledge/spreadsheet", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessId,
                fileUrl: file.fileUrl,
                fileName: file.fileName,
                updates,
            }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "No se pudo actualizar el archivo Excel.");
        }

        setStatusMessage({ type: "success", text: "Archivo actualizado y reindexado correctamente." });
        await fetchExcelFiles({ silent: true });
        await loadExcelPreview(file);
    };

    useEffect(() => {
        if (!excelViewerOpen || !activeAgent?.id || !selectedExcelFileUrl) return;

        const interval = setInterval(() => {
            void (async () => {
                const latestFiles = await fetchExcelFiles({ silent: true });
                const latest = latestFiles.find((f) => f.fileUrl === selectedExcelFileUrl);
                const current = excelFiles.find((f) => f.fileUrl === selectedExcelFileUrl);
                const latestTs = latest?.lastUpdatedAt || "";
                const currentTs = current?.lastUpdatedAt || "";

                if (latest && latestTs && latestTs !== currentTs) {
                    setStatusMessage({ type: "success", text: "Se detectaron cambios recientes. Visor actualizado automáticamente." });
                    await loadExcelPreview(latest);
                }
            })();
        }, EXCEL_REFRESH_POLL_MS);

        return () => clearInterval(interval);
    }, [excelViewerOpen, activeAgent?.id, selectedExcelFileUrl, excelFiles]);

    const openDeactivateConfirm = (toolId: number) => {
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(toolId);
    };

    const closeDeactivateConfirm = () => {
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(null);
    };

    const confirmDeactivateTool = async () => {
        if (pendingDeactivateToolId === null) return;
        await handleToggleTool(pendingDeactivateToolId);
        setPendingDeactivateToolId(null);
    };

    const pendingDeactivateTool = tools.find((tool) => tool.id === pendingDeactivateToolId) || null;


    return (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    Tools Store <Blocks className="w-6 h-6 text-purple-400" />
                </h1>
                <p className="text-white/60">Instala "habilidades" (Function Calling) en tu agente con un solo clic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <div key={tool.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all">

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                {tool.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                {tool.category}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 relative z-10">{tool.name}</h3>
                        {usesGoogleConnection(tool.slug) && (
                            <p className="text-[11px] text-blue-300/90 mb-2 relative z-10">Integracion con Google</p>
                        )}
                        <p className="text-sm text-white/50 mb-6 min-h-10 relative z-10">
                            {tool.description}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                            {tool.status === "connected" ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {usesGoogleConnection(tool.slug) ? "Google conectado" : "Activado"}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-white/40 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                    Desactivado
                                </div>
                            )}

                            <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tool.status === 'connected'
                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                : 'bg-white text-black hover:bg-white/90'
                                } ${savingToolId === tool.id ? 'opacity-70 cursor-wait' : ''}`}
                                onClick={() => handlePrimaryAction(tool)}
                                disabled={savingToolId !== null}
                            >
                                {getPrimaryLabel(tool)}
                            </button>
                        </div>

                        {tool.status === "connected" && (
                            <button
                                onClick={() => openDeactivateConfirm(tool.id)}
                                disabled={savingToolId !== null}
                                className="mt-3 text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                                Desactivar
                            </button>
                        )}

                        {/* Glowing background effect */}
                        {tool.status === "connected" && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        )}
                    </div>
                ))}
            </div>

            {pendingDeactivateTool && (
                <ActionConfirmationPanel
                    message={copy.tools.deactivateConfirm(pendingDeactivateTool.name)}
                    details={copy.tools.deactivateDetails}
                    confirmLabel={copy.confirmation.labels.deactivate}
                    cancelLabel={copy.confirmation.cancel}
                    isLoading={savingToolId === pendingDeactivateTool.id}
                    onCancel={closeDeactivateConfirm}
                    onConfirm={() => {
                        void confirmDeactivateTool();
                    }}
                />
            )}

            {statusMessage && (
                <p className={`text-sm ${statusMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                    {statusMessage.text}
                </p>
            )}

            {excelViewerOpen && (
                <ExcelViewerModal
                    businessId={activeAgent?.id || ""}
                    files={excelFiles}
                    missingFileUrlCount={excelMissingFileUrlCount}
                    loadingFiles={loadingExcelFiles}
                    loadingPreview={loadingExcelPreview}
                    preview={excelPreview}
                    selectedFile={selectedExcelFileUrl}
                    onClose={() => setExcelViewerOpen(false)}
                    onSelectFile={(file) => {
                        void loadExcelPreview(file);
                    }}
                    onApplyUpdate={applyExcelUpdate}
                />
            )}
        </div>
    );
}
