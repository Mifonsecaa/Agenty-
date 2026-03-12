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
                    {/* Tarjeta Subir Documentos */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={uploadState === "idle" ? () => simulateUpload("Archivo_Subido.pdf") : undefined}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[220px] ${uploadState === "uploading" ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' : isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'
                                }`}
                        >
                            {uploadState === "uploading" ? (
                                <>
                                    <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                        <span className="absolute text-[10px] font-bold text-blue-400 mt-12">{progress}%</span>
                                    </div>
                                    <p className="text-sm font-medium text-white/90">Extrayendo texto...</p>
                                    <div className="w-full max-w-[150px] h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </>
                            ) : uploadState === "success" ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-400">¡Documento Aprendido!</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <UploadCloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-white/90">Haz clic o arrastra un archivo</p>
                                    <p className="text-xs text-white/40 mt-1">PDF, DOCX, TXT. Max 50MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tarjeta Importar Web */}
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
                        <p className="text-[10px] text-white/40 mt-2">El agente leerá automáticamente todo el texto público de este enlace.</p>
                    </div>
                </div>

                {/* Columna Derecha: Cerebro del Agente (Lista de archivos) */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Memoria Activa
                        </h2>
                        <span className="bg-white/5 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10 font-medium tracking-wide">
                            {activeFiles.length} Archivos Entrenados
                        </span>
                    </div>

                    {/* Lista de archivos (Scrollable) */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {activeFiles.map((file) => (
                            <div key={file.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center
                                        ${file.type === 'pdf' ? 'bg-red-500/10 border-red-500/20' :
                                            file.type === 'txt' ? 'bg-blue-500/10 border-blue-500/20' :
                                                'bg-purple-500/10 border-purple-500/20'}`}
                                    >
                                        <FileText className={`w-5 h-5 
                                            ${file.type === 'pdf' ? 'text-red-400' :
                                                file.type === 'txt' ? 'text-blue-400' :
                                                    'text-purple-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/90 truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Vectorizado
                                            </span>
                                            <span className="text-[10px] text-white/40">{file.size} • {file.chunks} fragmentos</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setActiveFiles(prev => prev.filter(f => f.id !== file.id))}
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
