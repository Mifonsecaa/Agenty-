"use client";
import { useState, useEffect } from "react";
import { UploadCloud, FileText, Database, Link as LinkIcon, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";
import { AnimatePresence, motion } from "framer-motion";
import type { KnowledgeItem, KnowledgeListResponse } from "@/types/knowledge";

const KNOWLEDGE_LOADING_PHRASES = [
    "Escaneando documento...",
    "Extrayendo precios y servicios...",
    "Construyendo base de conocimiento...",
];

export default function KnowledgeBase() {
    const { activeAgent } = useAgenty();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
    const [progress, setProgress] = useState(0);
    const [activeFiles, setActiveFiles] = useState<KnowledgeItem[]>([]);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState("");

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

        if (file.size > 50 * 1024 * 1024) {
            alert("El archivo supera el límite de 50MB.");
            return;
        }

        const isTextLike = file.type.startsWith("text/") ||
            ["application/json", "text/csv"].includes(file.type) ||
            /\.(txt|md|csv|json)$/i.test(file.name);

        setUploadState("uploading");
        setProgress(10);
        setUploadingFileName(file.name);

        try {
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                let content = e.target?.result as string;
                setProgress(40);

                // Para binarios recibimos DataURL y extraemos base64.
                if (!isTextLike) {
                    content = content.split(",")[1];
                }

                const res = await fetch("/api/knowledge", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessId,
                        text: content,
                        name: file.name,
                        type: file.type || "application/octet-stream"
                    })
                });

                if (res.ok) {
                    setProgress(100);
                    setUploadState("success");
                    setTimeout(() => {
                        setUploadState("idle");
                        setUploadingFileName("");
                        fetchKnowledge();
                    }, 2000);
                } else {
                    const errorData: KnowledgeListResponse = await res.json().catch(() => ({ error: "Error desconocido", success: false }));
                    setUploadState("idle");
                    setUploadingFileName("");
                    const errorMsg = errorData.error || "Error al procesar el documento.";
                    const errorDetails = errorData.details || errorData.message || "";
                    alert(`Error: ${errorMsg}\n\nDetalles técnicos: ${errorDetails}`);
                    console.error("Server Error:", errorData);
                }
            };

            isTextLike ? reader.readAsText(file) : reader.readAsDataURL(file);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadState("idle");
            setUploadingFileName("");
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!activeAgent?.id) return;
        if (!confirm("¿Seguro que quieres borrar este conocimiento?")) return;
        try {
            await fetch("/api/knowledge", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: activeAgent.id, itemId })
            });
            fetchKnowledge();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

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
                                            Procesando: {uploadingFileName}
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
                                    <p className="text-xs text-white/40 mt-1">PDF, imágenes y archivos generales. Max 50MB</p>
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
                                className="flex-1 min-w-0 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0">
                                Sincronizar
                            </button>
                        </div>
                        <p className="text-[10px] text-white/40 mt-2">Próximamente: Sincronización automática de URLs.</p>
                    </div>
                </div>

                {/* Columna Derecha: Memoria Semántica */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Memoria Semántica
                        </h2>
                        <span className="bg-white/5 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10 font-medium tracking-wide">
                            {activeFiles.length} Fragmentos Activos
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {activeFiles.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20">
                                <Database className="w-12 h-12 mb-4 opacity-10" />
                                <p>La memoria está vacía. Sube documentos para empezar.</p>
                            </div>
                        )}
                        {activeFiles.map((file) => (
                            <div key={file.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
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
                                        onClick={() => handleDelete(file.id)}
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
