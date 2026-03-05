import { UploadCloud, FileText, Database, Link as LinkIcon, CheckCircle2, Trash2 } from "lucide-react";

export default function KnowledgeBase() {
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
                    <div className="border-2 border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group">
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Drag & Drop tus archivos aquí</h3>
                        <p className="text-sm text-white/50 max-w-sm mb-6">
                            Soporta PDF, TXT, CSV y DOCX. Tu agente extraerá el texto automáticamente para responder a tus clientes.
                        </p>
                        <button className="px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors">
                            Buscar Archivos
                        </button>
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

                        <div className="space-y-4 flex-1">
                            {/* File 1 */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Menu_Precios_2026.pdf</p>
                                    <p className="text-xs text-white/40 mt-0.5">2.4 MB • 45 fragmentos extraídos</p>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium bg-emerald-400/10 w-fit px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" /> Vectorizado
                                    </div>
                                </div>
                                <button className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* File 2 */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Politicas_Reembolso.txt</p>
                                    <p className="text-xs text-white/40 mt-0.5">12 KB • 5 fragmentos extraídos</p>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium bg-emerald-400/10 w-fit px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" /> Vectorizado
                                    </div>
                                </div>
                                <button className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

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
