"use client";
import { Plus, Mic, ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";

interface MagicBoxProps {
    onSubmit: (text: string) => void;
    isLoading: boolean;
}

export default function MagicBox({ onSubmit, isLoading }: MagicBoxProps) {
    const [text, setText] = useState("");

    return (
        <div className="relative w-full max-w-3xl mx-auto group z-20">
            {/* Contenedor principal estilo Glassmorphism */}
            <div className="relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 shadow-2xl transition-all duration-500 ease-out focus-within:border-white/30 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_40px_rgba(255,255,255,0.05)]">

                {/* Input Area */}
                <textarea
                    rows={4}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white/90 placeholder-white/30 resize-none text-xl sm:text-2xl font-light py-2 px-3 leading-relaxed transition-all placeholder:transition-opacity focus:placeholder-white/10"
                    placeholder="Cuéntame sobre tu negocio para crear tu agente..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Controles de abajo */}
                <div className="flex items-center justify-between mt-6 px-1">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/70 transition-all duration-300 hover:scale-105 active:scale-95 group-focus-within:border-white/20"
                            title="Añadir contexto (Imágenes/Docs)"
                        >
                            <Plus size={22} />
                        </button>
                    </div>

                    <div className="flex items-center gap-5">
                        <span className="text-xs font-semibold text-white/30 tracking-[0.15em] uppercase pointer-events-none transition-colors group-focus-within:text-white/50">
                            Build
                        </span>

                        <div className="h-4 w-px bg-white/10" />

                        <button
                            className="p-3 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all duration-300 active:scale-95"
                            title="Usar dictado por voz"
                        >
                            <Mic size={22} />
                        </button>

                        <button
                            onClick={() => onSubmit(text)}
                            disabled={isLoading || !text}
                            className={`p-3.5 rounded-full transition-all duration-500 flex items-center justify-center ${text
                                    ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95'
                                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                }`}
                        >
                            <ArrowUp size={22} className={text ? "stroke-[3px]" : "stroke-[2px]"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Badge de IA flotante estilo Lovable */}
            <div className="absolute -right-3 -top-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-xl shadow-purple-500/10 pointer-events-none animate-float">
                <Sparkles size={18} className="text-blue-300" />
            </div>
        </div>
    );
}
