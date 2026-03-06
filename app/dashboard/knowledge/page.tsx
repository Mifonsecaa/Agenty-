"use client";
import { useState } from "react";
import { UploadCloud, FileText, Database, Link as LinkIcon, CheckCircle2, Trash2, Loader2 } from "lucide-react";

export default function KnowledgeBase() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
    const [progress, setProgress] = useState(0);
    const [activeFiles, setActiveFiles] = useState([
        { id: 1, name: "Menu_Precios_2026.pdf", size: "2.4 MB", chunks: 45, type: "pdf" },
        { id: 2, name: "Politicas_Reembolso.txt", size: "12 KB", chunks: 5, type: "txt" }
    ]);

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
            simulateUpload(e.dataTransfer.files[0].name);
        }
    };

    const simulateUpload = (fileName: string) => {
        if (uploadState === "uploading") return;

        setUploadState("uploading");
        setProgress(0);

        // Simular progreso de subida
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.floor(Math.random() * 15) + 5;
                if (next >= 100) {
                    clearInterval(interval);

                    // Cuando termina de "subir", lo pasamos a succes brevemente
                    setTimeout(() => {
                        setUploadState("success");
                        // Y agregamos el archivo falso a la lista
                        setTimeout(() => {
                            setActiveFiles(prev => [{
                                id: Date.now(),
                                name: fileName,
                                size: (Math.random() * 3 + 0.1).toFixed(1) + " MB",
                                chunks: Math.floor(Math.random() * 30) + 10,
                                type: fileName.split('.').pop() || "doc"
                            }, ...prev]);

                            setUploadState("idle");
                            setProgress(0);
                        }, 1500);
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, 300);
    };
    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col relative z-10 space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    Knowledge Base <Database className="w-6 h-6 text-blue-400" />
                </h1>
                <p className="text-white/60">Sube documentos para que tu agente no invente respuestas (RAG).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

                {/* Upload Area */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${isDragging
                                ? "border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                                : "border-white/20 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                    >
                        {uploadState === "idle" && (
                            <>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform ${isDragging ? "bg-blue-500/20 scale-110" : "bg-blue-500/10"}`}>
                                    <UploadCloud className={`w-10 h-10 ${isDragging ? "text-blue-300" : "text-blue-400"}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Drag & Drop tus archivos aquí</h3>
                                <p className="text-sm text-white/50 max-w-sm mb-6">
                                    Soporta PDF, TXT, CSV y DOCX. Tu agente extraerá el texto automáticamente para responder a tus clientes.
                                </p>
                                <button className="px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors pointer-events-none">
                                    Buscar Archivos
                                </button>
                            </>
                        )}

                        {uploadState === "uploading" && (
                            <div className="w-full max-w-sm flex flex-col items-center py-6">
                                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                                <h3 className="text-lg font-bold">Analizando con IA...</h3>
                                <p className="text-xs text-white/50 mb-6">Extrayendo vectores de conocimiento</p>

                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs font-mono mt-2 text-white/40">{progress}%</p>
                            </div>
                        )}

                        {uploadState === "success" && (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-400">¡Conocimiento Entrenado!</h3>
                            </div>
                        )}

                        {/* Glow animation on drag */}
                        {isDragging && <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl animate-pulse pointer-events-none" />}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Ó Conecta una URL</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="https://tupagina.com/menu"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors">
                            Escanear Web
                        </button>
                    </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
                        <h3 className="font-bold text-lg mb-6">Archivos Activos (Cerebro)</h3>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            {activeFiles.map((file) => (
                                <div key={file.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div className={`p-2 rounded-lg ${file.type.toLowerCase().includes('pdf') ? 'bg-red-500/10 text-red-400' :
                                            file.type.toLowerCase().includes('txt') ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-purple-500/10 text-purple-400'
                                        }`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{file.size} • {file.chunks} fragmentos extraídos</p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium bg-emerald-400/10 w-fit px-2 py-0.5 rounded-md">
                                            <CheckCircle2 className="w-3 h-3" /> Vectorizado
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveFiles(prev => prev.filter(f => f.id !== file.id))}
                                        className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/10 mt-auto">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/50">Uso de Almacenamiento</span>
                                <span className="text-white font-medium">14% (1.4GB)</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="w-[14%] h-full bg-blue-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
