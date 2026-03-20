"use client";
import { useState, useEffect } from "react";
import { Calendar, CreditCard, ShoppingBag, Mail, Blocks, FileSpreadsheet } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";
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
};

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
    if (/\.(xlsx|xlsm)$/i.test(fileName)) return true;
    return [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
    ].includes(fileType || "");
}

function ExcelViewerModal({
    businessId,
    files,
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
    loadingFiles: boolean;
    loadingPreview: boolean;
    preview: SpreadsheetPreview["data"] | null;
    selectedFile: string | null;
    onClose: () => void;
    onSelectFile: (file: ExcelKnowledgeFile) => void;
    onApplyUpdate: (params: {
        businessId: string;
        file: ExcelKnowledgeFile;
        sheet: string;
        cell: string;
        value: string;
    }) => Promise<void>;
}) {
    const [editSheet, setEditSheet] = useState("");
    const [editCell, setEditCell] = useState("A1");
    const [editValue, setEditValue] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!preview?.sheets?.length) return;
        setEditSheet((prev) => prev || preview.sheets[0].name);
    }, [preview]);

    const selectedFileData = files.find((f) => f.fileUrl === selectedFile) || null;

    const handleApplyEdit = async () => {
        if (!selectedFileData || !editSheet.trim() || !editCell.trim()) return;
        setSavingEdit(true);
        try {
            await onApplyUpdate({
                businessId,
                file: selectedFileData,
                sheet: editSheet,
                cell: editCell,
                value: editValue,
            });
            setEditValue("");
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
                        Visor Excel (.xlsx / .xlsm)
                    </h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">Cerrar</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[65vh]">
                    <aside className="border-r border-white/10 p-4 overflow-y-auto">
                        <p className="text-xs text-white/50 mb-3">Archivos subidos por el usuario</p>
                        {loadingFiles ? (
                            <p className="text-sm text-white/60">Cargando archivos...</p>
                        ) : files.length === 0 ? (
                            <p className="text-sm text-white/60">No hay archivos Excel en tu base de conocimiento.</p>
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
                            <p className="text-xs text-white/60 mb-2">Editor rapido (actualiza una celda y reindexa la base de conocimiento)</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <select
                                    value={editSheet}
                                    onChange={(e) => setEditSheet(e.target.value)}
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled={!preview || savingEdit}
                                >
                                    <option value="">Selecciona hoja</option>
                                    {(preview?.sheets || []).map((sheet) => (
                                        <option key={sheet.name} value={sheet.name}>{sheet.name}</option>
                                    ))}
                                </select>
                                <input
                                    value={editCell}
                                    onChange={(e) => setEditCell(e.target.value.toUpperCase())}
                                    placeholder="Celda (ej. B3)"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white"
                                    disabled={savingEdit}
                                />
                                <input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="Nuevo valor"
                                    className="rounded-lg bg-black/30 border border-white/15 px-2 py-2 text-xs text-white md:col-span-2"
                                    disabled={savingEdit}
                                />
                            </div>
                            <div className="mt-2">
                                <button
                                    onClick={handleApplyEdit}
                                    disabled={!selectedFileData || !editSheet.trim() || !editCell.trim() || savingEdit}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-black disabled:opacity-40"
                                >
                                    {savingEdit ? "Guardando..." : "Guardar cambio"}
                                </button>
                            </div>
                        </div>

                        {loadingPreview ? (
                            <p className="text-sm text-white/60">Cargando previsualizacion...</p>
                        ) : !preview ? (
                            <p className="text-sm text-white/60">Selecciona un archivo para abrir el visor.</p>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm text-white/80">{preview.fileName}</h4>
                                {preview.sheets.map((sheet) => (
                                    <div key={sheet.name} className="border border-white/10 rounded-xl overflow-hidden">
                                        <div className="px-3 py-2 text-xs bg-white/5 text-white/70 flex justify-between">
                                            <span>Hoja: {sheet.name}</span>
                                            <span>{sheet.rowCount} filas</span>
                                        </div>
                                        <div className="overflow-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        {sheet.headers.slice(0, 18).map((header, idx) => (
                                                            <th key={`${sheet.name}-h-${idx}`} className="px-2 py-1 text-left text-white/70 whitespace-nowrap border-b border-white/10">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sheet.rows.slice(0, 80).map((row, rowIdx) => (
                                                        <tr key={`${sheet.name}-r-${rowIdx}`} className="border-b border-white/5">
                                                            {sheet.headers.slice(0, 18).map((_, colIdx) => (
                                                                <td key={`${sheet.name}-c-${rowIdx}-${colIdx}`} className="px-2 py-1 text-white/80 whitespace-nowrap">
                                                                    {row[colIdx] || ""}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
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
    const { activeAgent, saveAgent, updateActiveAgentConfig } = useAgenty();
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
            name: "Visor Excel KB",
            description: "Visualiza en modo lectura archivos .xlsx y .xlsm que tu usuario sube a la base de conocimiento.",
            icon: <FileSpreadsheet className="w-6 h-6 text-emerald-300" />,
            status: "connected",
            category: "Knowledge"
        }
    ]);
    const [savingToolId, setSavingToolId] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [pendingDeactivateToolId, setPendingDeactivateToolId] = useState<number | null>(null);
    const [excelViewerOpen, setExcelViewerOpen] = useState(false);
    const [excelFiles, setExcelFiles] = useState<ExcelKnowledgeFile[]>([]);
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
                status: tool.slug === "knowledge-excel-viewer"
                    ? "connected"
                    : (config.recommendedTools.includes(tool.id) ? "connected" : "disconnected")
            })));
        }
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
        if (tool.slug === "knowledge-excel-viewer") {
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

    const openExcelViewer = async () => {
        if (!activeAgent?.id) return;

        setExcelViewerOpen(true);
        setLoadingExcelFiles(true);
        setExcelPreview(null);
        setSelectedExcelFileUrl(null);

        try {
            const res = await fetch(`/api/knowledge/spreadsheet?businessId=${activeAgent.id}`);
            const data = await res.json().catch(() => ({}));
            const files: ExcelKnowledgeFile[] = (data?.data?.files || []).filter((f: any) =>
                f?.fileUrl && isSpreadsheetFile(f?.fileName || "", f?.fileType || "")
            );
            const missingFileUrlCount = Number(data?.data?.missingFileUrlCount || 0);

            setExcelFiles(files);

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

            if (files[0]) {
                void loadExcelPreview(files[0]);
            }
        } catch (error) {
            console.error("[ToolsStore] Error loading excel files:", error);
            setStatusMessage({ type: "error", text: "No se pudieron cargar archivos Excel de la base de conocimiento." });
        } finally {
            setLoadingExcelFiles(false);
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
            const res = await fetch(`/api/knowledge/preview?${params.toString()}`);
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
        sheet,
        cell,
        value,
    }: {
        businessId: string;
        file: ExcelKnowledgeFile;
        sheet: string;
        cell: string;
        value: string;
    }) => {
        const res = await fetch("/api/knowledge/spreadsheet", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessId,
                fileUrl: file.fileUrl,
                fileName: file.fileName,
                updates: [{ sheet, cell, value }],
            }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "No se pudo actualizar el archivo Excel.");
        }

        setStatusMessage({ type: "success", text: "Archivo actualizado y reindexado correctamente." });
        await loadExcelPreview(file);
    };

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
                        <p className="text-sm text-white/50 mb-6 min-h-10 relative z-10">
                            {tool.description}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                            {tool.status === "connected" ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Activado
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
                                {savingToolId === tool.id
                                    ? (tool.status === "connected" ? "Guardando..." : "Conectando...")
                                    : (tool.status === "connected" ? "Configurar" : "Conectar")}
                            </button>
                        </div>

                        {tool.status === "connected" && tool.slug !== "knowledge-excel-viewer" && (
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
