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
        <div className="relative w-full max-w-3xl mx-auto group">
            {/* Contenedor principal de la caja */}
            <div className="relative flex flex-col bg-[#1a1a1a] border border-white/10 rounded-[28px] p-4 shadow-2xl transition-all focus-within:border-white/20">

        <textarea
            rows={3}
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/40 resize-none text-lg py-2 px-2"
            placeholder="Cuéntame sobre tu negocio para crear tu agente..."
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-white/5 rounded-full text-white/60 transition-colors">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-white/40 tracking-wider uppercase">Plan</span>
                        <button className="p-2 hover:bg-white/5 rounded-full text-white/60 transition-colors">
                            <Mic size={20} />
                        </button>
                        <button
                            onClick={() => onSubmit(text)}
                            disabled={isLoading || !text}
                            className={`p-2 rounded-full transition-all ${
                                text ? 'bg-white text-black' : 'bg-white/10 text-white/20'
                            }`}
                        >
                            <ArrowUp size={20} fill={text ? "black" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Badge de IA flotante estilo Lovable */}
            <div className="absolute -right-2 -top-2 bg-[#2a2a2a] p-1.5 rounded-lg border border-white/10 shadow-lg">
                <Sparkles size={16} className="text-blue-400" />
            </div>
        </div>
    );
}