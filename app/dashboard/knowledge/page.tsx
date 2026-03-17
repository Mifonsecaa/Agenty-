"use client";
import { useState, useEffect } from "react";
import { UploadCloud, FileText, Database, Link as LinkIcon, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";
import { AnimatePresence, motion } from "framer-motion";
import ActionConfirmationPanel from "@/components/dashboard/ActionConfirmationPanel";
import { useDashboardCopy } from "@/components/dashboard/useDashboardCopy";
import type {
    KnowledgeItem,
    KnowledgeListResponse,
    KnowledgeJobResponse,
    KnowledgeQueueHealthResponse,
    KnowledgeJobReplayResponse,
    KnowledgeJobCleanupResponse,
} from "@/types/knowledge";
import { toast } from "sonner";

const KNOWLEDGE_LOADING_PHRASES = [
    "Escaneando documento...",
    "Extrayendo precios y servicios...",
    "Construyendo base de conocimiento...",
];

const SHIFT_TIP_STORAGE_KEY = "knowledge.shift_tip_dismissed";
const JOB_POLL_INTERVAL_MS = 1800;
const JOB_POLL_TIMEOUT_MS = 120000;
const HEALTH_POLL_MS = 15000;

export default function KnowledgeBase() {
    const { activeAgent } = useAgenty();
    const { copy } = useDashboardCopy();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
    const [progress, setProgress] = useState(0);
    const [activeFiles, setActiveFiles] = useState<KnowledgeItem[]>([]);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [isSyncingWebsite, setIsSyncingWebsite] = useState(false);
    const [websiteSyncMessage, setWebsiteSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [showShiftTip, setShowShiftTip] = useState(false);
    const [queueHealth, setQueueHealth] = useState<KnowledgeQueueHealthResponse["data"] | null>(null);
    const [healthError, setHealthError] = useState<string | null>(null);
    const [lastHealthAt, setLastHealthAt] = useState<string | null>(null);
    const [isHealthLoading, setIsHealthLoading] = useState(false);
    const [isReplayingJobs, setIsReplayingJobs] = useState(false);
    const [isCleaningJobs, setIsCleaningJobs] = useState(false);
    const [isSingleDeleting, setIsSingleDeleting] = useState(false);
    const [cleanupRetentionDays, setCleanupRetentionDays] = useState(14);
    const [pendingCleanupRetentionDays, setPendingCleanupRetentionDays] = useState(14);
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<null | "single-delete" | "bulk-delete" | "cleanup">(null);

    const loadingMessage = KNOWLEDGE_LOADING_PHRASES[loadingPhraseIndex % KNOWLEDGE_LOADING_PHRASES.length];

    useEffect(() => {
        if (uploadState !== "uploading") {
            setLoadingPhraseIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setLoadingPhraseIndex((prev) => prev + 1);
        }, 1800);

        return () => clearInterval(interval);
    }, [uploadState]);

    useEffect(() => {
        if (activeAgent?.id) {
            fetchKnowledge();
        }
    }, [activeAgent]);

    useEffect(() => {
        if (!activeAgent?.id) {
            setQueueHealth(null);
            setHealthError(null);
            setLastHealthAt(null);
            return;
        }

        void fetchQueueHealth({ silent: false });
        const interval = setInterval(() => {
            void fetchQueueHealth({ silent: true });
        }, HEALTH_POLL_MS);

        return () => clearInterval(interval);
    }, [activeAgent?.id]);

    useEffect(() => {
        try {
            const dismissed = localStorage.getItem(SHIFT_TIP_STORAGE_KEY) === "1";
            setShowShiftTip(!dismissed);
        } catch {
            setShowShiftTip(true);
        }
    }, []);

    useEffect(() => {
        // Limpia ids seleccionados que ya no existen tras refrescar la lista.
        setSelectedIds((prev) => {
            if (prev.size === 0) return prev;
            const available = new Set(activeFiles.map((file) => file.id));
            const next = new Set<string>();
            for (const id of prev) {
                if (available.has(id)) next.add(id);
            }
            return next;
        });
        if (activeFiles.length === 0) {
            setLastSelectedIndex(null);
        }
    }, [activeFiles]);

    const fetchKnowledge = async () => {
        if (!activeAgent?.id) return;

        try {
            const res = await fetch(`/api/knowledge?businessId=${activeAgent?.id}`);
            const data: KnowledgeListResponse = await res.json();
            if (data.success) {
                setActiveFiles(data.data?.items || data.items || []);
            }
        } catch (error) {
            console.error("Error fetching knowledge:", error);
        }
    };

    const fetchQueueHealth = async ({ silent }: { silent: boolean }) => {
        if (!activeAgent?.id) return;
        if (!silent) setIsHealthLoading(true);

        try {
            const res = await fetch(`/api/knowledge/jobs/health?businessId=${activeAgent.id}`);
            const data: KnowledgeQueueHealthResponse = await res.json().catch(() => ({ success: false, error: copy.knowledge.healthReadError }));

            if (!res.ok || !data.success || !data.data) {
                setHealthError(data.error || copy.knowledge.healthFetchError);
                return;
            }

            setQueueHealth(data.data);
            setHealthError(null);
            setLastHealthAt(new Date().toISOString());
        } catch (error) {
            setHealthError(copy.knowledge.healthFetchError);
        } finally {
            if (!silent) setIsHealthLoading(false);
        }
    };

    const waitForJobCompletion = async (jobId: string) => {
        const startedAt = Date.now();
        while (Date.now() - startedAt < JOB_POLL_TIMEOUT_MS) {
            const res = await fetch(`/api/knowledge/jobs/${jobId}`);
            const data: KnowledgeJobResponse = await res.json().catch(() => ({ success: false, error: copy.knowledge.jobStatusReadError }));

            if (!res.ok || !data.success || !data.data) {
                throw new Error(data.error || copy.knowledge.jobStatusFetchError);
            }

            if (data.data.status === "COMPLETED") {
                void fetchQueueHealth({ silent: true });
                return data.data;
            }

            if (data.data.status === "DLQ" || data.data.status === "FAILED") {
                throw new Error(data.data.lastError || copy.knowledge.jobFailed);
            }

            await new Promise((resolve) => setTimeout(resolve, JOB_POLL_INTERVAL_MS));
        }

        throw new Error(copy.knowledge.jobTimeout);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!activeAgent?.id || uploadState === "uploading") return;

        const businessId = activeAgent.id;

        // Validación de tipos de archivo
        const validTypes = [
            "text/plain", "text/markdown", "text/csv", "application/json", "application/pdf"
        ];
        
        if (!validTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
            toast.error(copy.knowledge.unsupportedFileType(file.type));
            return;
        }

        setUploadState("uploading");
        setProgress(10);
        setUploadingFileName(file.name);

        try {
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                let content = e.target?.result as string;
                setProgress(40);

                // Si es PDF, el contenido será un DataURL (base64), lo limpiamos un poco
                if (file.type === "application/pdf") {
                    content = content.split(",")[1];
                }

                const res = await fetch("/api/knowledge", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessId,
                        text: content,
                        name: file.name,
                        type: file.type
                    })
                });

                if (res.ok) {
                    const data: KnowledgeListResponse = await res.json().catch(() => ({ success: true } as KnowledgeListResponse));

                    if (data.queued && data.jobId) {
                        setProgress(55);
                        toast.info(data.message || copy.knowledge.uploadQueued);
                        await waitForJobCompletion(data.jobId);
                    }

                    setProgress(100);
                    setUploadState("success");
                    toast.success(copy.knowledge.uploadSuccess);
                    setTimeout(() => {
                        setUploadState("idle");
                        setUploadingFileName("");
                        fetchKnowledge();
                        void fetchQueueHealth({ silent: true });
                    }, 1200);
                } else {
                    const errorData: KnowledgeListResponse = await res.json().catch(() => ({ error: "Error desconocido", success: false }));
                    setUploadState("idle");
                    setUploadingFileName("");
                    const errorMsg = errorData.error || "Error al procesar el documento.";
                    const errorDetails = errorData.details || errorData.message || "";
                    toast.error(errorDetails ? `${errorMsg} ${errorDetails}` : errorMsg);
                    console.error("Server Error:", errorData);
                }
            };

            if (file.type === "application/pdf") {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }

        } catch (error) {
            console.error("Upload error:", error);
            setUploadState("idle");
            setUploadingFileName("");
            toast.error(copy.knowledge.uploadError);
        }
    };

    const openSingleDeleteConfirm = (itemId: string) => {
        setPendingDeleteItemId(itemId);
        setConfirmDialog("single-delete");
    };

    const closeConfirmDialog = () => {
        if (isBulkDeleting || isCleaningJobs || isSingleDeleting) return;
        setConfirmDialog(null);
        setPendingDeleteItemId(null);
    };

    const handleDelete = async () => {
        if (!activeAgent?.id || !pendingDeleteItemId) return;
        setIsSingleDeleting(true);
        try {
            const res = await fetch("/api/knowledge", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: activeAgent.id, itemId: pendingDeleteItemId })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || copy.knowledge.deleteError);
                return;
            }

            toast.success(copy.knowledge.deleteSuccess);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(pendingDeleteItemId);
                return next;
            });
            closeConfirmDialog();
            fetchKnowledge();
            void fetchQueueHealth({ silent: true });
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(copy.knowledge.deleteError);
        } finally {
            setIsSingleDeleting(false);
        }
    };


    const toggleSelectByIndex = (index: number, withRange: boolean) => {
        const current = activeFiles[index];
        if (!current) return;

        setSelectedIds((prev) => {
            const next = new Set(prev);
            const shouldSelect = !next.has(current.id);

            if (withRange && lastSelectedIndex !== null && activeFiles[lastSelectedIndex]) {
                const start = Math.min(lastSelectedIndex, index);
                const end = Math.max(lastSelectedIndex, index);

                for (let i = start; i <= end; i++) {
                    const id = activeFiles[i]?.id;
                    if (!id) continue;
                    if (shouldSelect) next.add(id);
                    else next.delete(id);
                }
                return next;
            }

            if (shouldSelect) next.add(current.id);
            else next.delete(current.id);
            return next;
        });

        setLastSelectedIndex(index);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === activeFiles.length && activeFiles.length > 0) {
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
            return;
        }
        setSelectedIds(new Set(activeFiles.map((file) => file.id)));
        setLastSelectedIndex(activeFiles.length > 0 ? activeFiles.length - 1 : null);
    };

    const openBulkDeleteConfirm = () => {
        if (selectedIds.size === 0 || isBulkDeleting) return;
        setConfirmDialog("bulk-delete");
    };

    const handleBulkDelete = async () => {
        if (!activeAgent?.id || selectedIds.size === 0 || isBulkDeleting) return;

        setIsBulkDeleting(true);
        try {
            const ids = Array.from(selectedIds);
            const res = await fetch("/api/knowledge", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: activeAgent.id, itemIds: ids }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || copy.knowledge.bulkDeleteError);
                return;
            }

            const data = await res.json().catch(() => ({}));
            const deletedCount = typeof data.deletedCount === "number" ? data.deletedCount : ids.length;
            toast.success(`${deletedCount} fragmento(s) eliminado(s)`);

            setSelectedIds(new Set());
            setLastSelectedIndex(null);
            closeConfirmDialog();
            await fetchKnowledge();
            await fetchQueueHealth({ silent: true });
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error(copy.knowledge.bulkDeleteError);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const dismissShiftTip = () => {
        setShowShiftTip(false);
        try {
            localStorage.setItem(SHIFT_TIP_STORAGE_KEY, "1");
        } catch {
            // Ignora errores de almacenamiento del navegador.
        }
    };

    const handleSyncWebsite = async () => {
        if (!activeAgent?.id || isSyncingWebsite) return;

        const url = websiteUrl.trim();
        if (!url) {
            setWebsiteSyncMessage({ type: "error", text: copy.knowledge.websiteMissingUrl });
            return;
        }

        try {
            new URL(url);
        } catch {
            setWebsiteSyncMessage({ type: "error", text: copy.knowledge.websiteInvalidUrl });
            return;
        }

        setIsSyncingWebsite(true);
        setWebsiteSyncMessage(null);

        try {
            const res = await fetch("/api/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId: activeAgent.id,
                    url,
                    name: new URL(url).hostname,
                    type: "text/html",
                }),
            });

            const data: KnowledgeListResponse = await res.json().catch(() => ({ success: false, error: "Error desconocido" }));
            if (!res.ok || !data.success) {
                setWebsiteSyncMessage({ type: "error", text: data.error || copy.knowledge.websiteSyncError });
                return;
            }

            if (data.queued && data.jobId) {
                setWebsiteSyncMessage({ type: "success", text: copy.knowledge.websiteQueued });
                await waitForJobCompletion(data.jobId);
            }

            setWebsiteSyncMessage({ type: "success", text: copy.knowledge.websiteSuccess });
            setWebsiteUrl("");
            await fetchKnowledge();
            await fetchQueueHealth({ silent: true });
        } catch (error) {
            console.error("Error syncing website:", error);
            setWebsiteSyncMessage({ type: "error", text: copy.knowledge.websiteSyncError });
        } finally {
            setIsSyncingWebsite(false);
        }
    };

    const handleReplayQueue = async () => {
        if (!activeAgent?.id || isReplayingJobs) return;

        setIsReplayingJobs(true);
        try {
            const res = await fetch("/api/knowledge/jobs/replay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: activeAgent.id, limit: 50 }),
            });

            const data: KnowledgeJobReplayResponse = await res.json().catch(() => ({
                success: false,
                replayedCount: 0,
                replayedIds: [],
                error: "Error desconocido",
            }));

            if (!res.ok || !data.success) {
                toast.error(data.error || copy.knowledge.replayError);
                return;
            }

            toast.success(copy.knowledge.replaySuccess(data.replayedCount));
            await fetchQueueHealth({ silent: true });
        } catch (error) {
            toast.error(copy.knowledge.replayError);
        } finally {
            setIsReplayingJobs(false);
        }
    };

    const openCleanupConfirm = () => {
        const retentionDays = Math.max(1, Math.min(365, cleanupRetentionDays || 14));
        setPendingCleanupRetentionDays(retentionDays);
        setConfirmDialog("cleanup");
    };

    const handleCleanupQueue = async () => {
        if (!activeAgent?.id || isCleaningJobs) return;

        const retentionDays = Math.max(1, Math.min(365, pendingCleanupRetentionDays || 14));

        setIsCleaningJobs(true);
        try {
            const res = await fetch("/api/knowledge/jobs/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: activeAgent.id, retentionDays }),
            });

            const data: KnowledgeJobCleanupResponse = await res.json().catch(() => ({
                success: false,
                deletedCount: 0,
                retentionDays,
                cutoff: new Date().toISOString(),
                error: "Error desconocido",
            }));

            if (!res.ok || !data.success) {
                toast.error(data.error || copy.knowledge.cleanupError);
                return;
            }

            toast.success(copy.knowledge.cleanupSuccess(data.deletedCount));
            await fetchQueueHealth({ silent: true });
            closeConfirmDialog();
        } catch (error) {
            toast.error(copy.knowledge.cleanupError);
        } finally {
            setIsCleaningJobs(false);
        }
    };

    const confirmDialogMessage =
        confirmDialog === "bulk-delete"
            ? copy.knowledge.deleteBulkConfirm(selectedIds.size)
            : confirmDialog === "single-delete"
                ? copy.knowledge.deleteFragmentConfirm
                : copy.knowledge.cleanupConfirm(pendingCleanupRetentionDays);

    const confirmDialogDetails =
        confirmDialog === "cleanup"
            ? copy.knowledge.cleanupDetails
            : undefined;

    const confirmDialogLabel =
        confirmDialog === "bulk-delete"
            ? copy.confirmation.labels.bulkDelete
            : confirmDialog === "single-delete"
                ? copy.confirmation.labels.delete
                : copy.confirmation.labels.cleanup;

    const isConfirmDialogLoading = isBulkDeleting || isCleaningJobs || isSingleDeleting;

    return (
        <div className="h-full flex flex-col relative z-10 overflow-hidden">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Knowledge Base <Database className="w-6 h-6 text-blue-400" />
                    </h1>
                    <p className="text-white/60">Entrena a tu agente subiendo documentos o conectando tu sitio web.</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Columna Izquierda: Zona de Subida */}
                <div className="lg:col-span-1 border-r border-white/10 pr-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => {
                                if (uploadState !== "idle") return;
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.onchange = (e: Event) => {
                                    const target = e.target as HTMLInputElement | null;
                                    if (target?.files?.[0]) handleUpload(target.files[0]);
                                };
                                input.click();
                            }}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-55 ${uploadState === "uploading" ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' :
                                isDragging ? 'border-blue-400 bg-blue-500/10' :
                                    'border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'
                                }`}
                        >
                            {uploadState === "uploading" ? (
                                <>
                                    <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                        <span className="absolute text-[10px] font-bold text-blue-400 mt-12">{progress}%</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80" aria-live="polite">
                                        <Loader2 size={13} className="animate-spin text-emerald-300" />
                                        <div className="relative h-4 min-w-55 overflow-hidden text-left">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={loadingMessage}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                                    className="absolute left-0 top-0"
                                                >
                                                    {loadingMessage}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    {uploadingFileName && (
                                        <p className="text-xs text-white/50 mt-2 max-w-55 truncate">
                                            {copy.knowledge.processingFilePrefix} {uploadingFileName}
                                        </p>
                                    )}
                                    <div className="w-full max-w-37.5 h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </>
                            ) : uploadState === "success" ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-400">¡Conocimiento Guardado!</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <UploadCloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-white/90">Haz clic o arrastra un archivo</p>
                                    <p className="text-xs text-white/40 mt-1">PDF, TXT, DOCX. Max 50MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/80">
                            <LinkIcon className="w-4 h-4 text-emerald-400" /> Conectar Sitio Web
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://tupagina.com"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSyncWebsite();
                                    }
                                }}
                                disabled={isSyncingWebsite}
                                className="flex-1 min-w-0 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button
                                onClick={handleSyncWebsite}
                                disabled={isSyncingWebsite || !websiteUrl.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
                            >
                                {isSyncingWebsite ? "Sincronizando..." : "Sincronizar"}
                            </button>
                        </div>
                        {websiteSyncMessage ? (
                            <p className={`text-[11px] mt-2 ${websiteSyncMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                                {websiteSyncMessage.text}
                            </p>
                        ) : (
                            <p className="text-[10px] text-white/40 mt-2">Sincroniza una URL pública para extraer texto y entrenar al agente.</p>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Memoria Semántica */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 shrink-0 gap-3">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Memoria Semántica
                        </h2>
                        <div className="flex flex-col items-end gap-2">
                            {showShiftTip && activeFiles.length > 1 && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
                                    <span>
                                        Tip: usa <span className="text-white/75">Shift + click</span> para seleccionar rangos.
                                    </span>
                                    <button
                                        onClick={dismissShiftTip}
                                        className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors"
                                    >
                                        Entendido
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                            <button
                                onClick={toggleSelectAll}
                                disabled={activeFiles.length === 0}
                                className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {selectedIds.size === activeFiles.length && activeFiles.length > 0 ? "Limpiar selección" : "Seleccionar todo"}
                            </button>
                            <button
                                onClick={openBulkDeleteConfirm}
                                disabled={selectedIds.size === 0 || isBulkDeleting}
                                className="text-xs px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                            >
                                {isBulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Borrar seleccionados ({selectedIds.size})
                            </button>
                            <span className="bg-white/5 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10 font-medium tracking-wide">
                                {activeFiles.length} Fragmentos Activos
                            </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-white/50">Estado cola</p>
                            <p className={`font-semibold ${queueHealth?.health === "degraded" ? "text-amber-300" : "text-emerald-300"}`}>
                                {isHealthLoading ? "Cargando..." : queueHealth?.health === "degraded" ? "Degradado" : "OK"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-white/50">Backlog</p>
                            <p className="font-semibold text-white/85">{queueHealth?.backlog ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-white/50">DLQ</p>
                            <p className="font-semibold text-red-300">{queueHealth?.dlq ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-white/50">Última lectura</p>
                                <p className="font-semibold text-white/85">{lastHealthAt ? new Date(lastHealthAt).toLocaleTimeString() : "-"}</p>
                            </div>
                            <button
                                onClick={() => void fetchQueueHealth({ silent: false })}
                                className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/10 transition-colors"
                            >
                                Refrescar
                            </button>
                        </div>
                    </div>

                    {healthError && (
                        <p className="mb-3 text-[11px] text-amber-300">{healthError}</p>
                    )}

                    {confirmDialog && (
                        <ActionConfirmationPanel
                            message={confirmDialogMessage}
                            details={confirmDialogDetails}
                            confirmLabel={confirmDialogLabel}
                            cancelLabel={copy.confirmation.cancel}
                            isLoading={isConfirmDialogLoading}
                            onCancel={closeConfirmDialog}
                            onConfirm={() => {
                                if (confirmDialog === "bulk-delete") {
                                    void handleBulkDelete();
                                } else if (confirmDialog === "single-delete") {
                                    void handleDelete();
                                } else {
                                    void handleCleanupQueue();
                                }
                            }}
                        />
                    )}

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleReplayQueue}
                            disabled={!activeAgent?.id || isReplayingJobs}
                            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isReplayingJobs ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Reintentar DLQ/FAILED
                        </button>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                            <label htmlFor="cleanup-days" className="text-[11px] text-white/60">Retención (días)</label>
                            <input
                                id="cleanup-days"
                                type="number"
                                min={1}
                                max={365}
                                value={cleanupRetentionDays}
                                onChange={(e) => setCleanupRetentionDays(Number(e.target.value || 14))}
                                className="w-16 rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white focus:outline-none"
                            />
                        </div>

                        <button
                            onClick={openCleanupConfirm}
                            disabled={!activeAgent?.id || isCleaningJobs}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCleaningJobs ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Limpiar jobs antiguos
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {activeFiles.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20">
                                <Database className="w-12 h-12 mb-4 opacity-10" />
                                <p>La memoria está vacía. Sube documentos para empezar.</p>
                            </div>
                        )}
                        {activeFiles.map((file, index) => (
                            <div key={file.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedIds.has(file.id) ? "border-blue-500/40 bg-blue-500/5" : "border-white/5 bg-[#0a0a0a] hover:bg-white/5"}`}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(file.id)}
                                        onChange={(e) => {
                                            toggleSelectByIndex(index, (e.nativeEvent as MouseEvent).shiftKey);
                                        }}
                                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-blue-500"
                                        aria-label="Seleccionar fragmento"
                                    />
                                    <div className="w-10 h-10 rounded-lg border bg-blue-500/10 border-blue-500/20 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/90 truncate max-w-50 md:max-w-xs">
                                            {file.metadata?.fileName || "Fragmento de conocimiento"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Indexado
                                            </span>
                                            <span className="text-[10px] text-white/40 truncate max-w-37.5">
                                                {file.content.substring(0, 60)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => openSingleDeleteConfirm(file.id)}
                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
