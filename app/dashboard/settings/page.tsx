"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle2, Loader2, Bot, Sliders, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useBrainia } from "@/context/BrainiaContext";
import { useSearchParams } from "next/navigation";

type Schedule = {
    day: string;
    start: string;
    end: string;
};

type AgentData = {
    id: string;
    name: string;
    businessType: string;
    agentTone: string;
    businessDescription: string;
    defaultDurationMinutes: number;
    schedules: Schedule[];
};

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const { activeAgent, updateActiveAgentConfig } = useBrainia();
    const [isLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [integrationHint, setIntegrationHint] = useState<{ toolLabel: string; section: "identity" | "knowledge" | "schedule" } | null>(null);

    const [agentData, setAgentData] = useState<AgentData>({
        id: "",
        name: "",
        businessType: "INDIVIDUAL_APPOINTMENTS",
        agentTone: "Amable y profesional",
        businessDescription: "",
        defaultDurationMinutes: 60,
        schedules: []
    });

    useEffect(() => {
        if (!activeAgent) return;

        const config = activeAgent.config || activeAgent;
        setAgentData({
            id: activeAgent.id || "",
            name: activeAgent.name || config.businessName || "Mi Agente",
            businessType: config.businessType || "INDIVIDUAL_APPOINTMENTS",
            agentTone: config.agentTone || "Amable",
            businessDescription: config.businessDescription || "",
            defaultDurationMinutes: config.defaultDurationMinutes || 60,
            schedules: config.schedules || []
        });
    }, [activeAgent]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        const tool = searchParams.get("tool");

        if (tab !== "integrations" || !tool) {
            setIntegrationHint(null);
            return;
        }

        const map: Record<string, { toolLabel: string; section: "identity" | "knowledge" | "schedule" }> = {
            "google-calendar": { toolLabel: "Google Calendar", section: "schedule" },
            payments: { toolLabel: "MercadoPago / Wompi", section: "identity" },
            shopify: { toolLabel: "Shopify Inventory", section: "knowledge" },
            email: { toolLabel: "Gmail / Outlook", section: "knowledge" },
        };

        setIntegrationHint(map[tool] || null);
    }, [searchParams]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAgentData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agentData.id) return;

        setIsSaving(true);
        setMessage(null);

        try {
            // Build the updated config object matching the DB schema
            const updatedConfig = {
                businessName: agentData.name,
                businessType: agentData.businessType,
                agentTone: agentData.agentTone,
                businessDescription: agentData.businessDescription,
                defaultDurationMinutes: agentData.defaultDurationMinutes,
                schedules: agentData.schedules
            };

            const payload = {
                id: agentData.id,
                name: agentData.name,
                config: updatedConfig
            };

            const response = await fetch('/api/business', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Configuración guardada exitosamente.' });

                // Update central context
                updateActiveAgentConfig(payload);
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al guardar.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };


    if (isLoading) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
    }

    return (
        <div className="h-full flex flex-col relative z-10 overflow-hidden max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Ajustes del Agente <Sliders className="w-6 h-6 text-blue-400" />
                    </h1>
                    <p className="text-white/60">Modifica manualmente la personalidad, conocimientos y reglas de tu agente.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2 pb-10">
                <form onSubmit={handleSave} className="space-y-6">

                    {integrationHint && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-sm text-blue-200">
                            Ajustando <strong>{integrationHint.toolLabel}</strong>. Revisa y guarda la sección resaltada para dejar la integración lista.
                        </div>
                    )}

                    {/* General Section */}
                    <div className={`bg-white/5 border rounded-2xl p-6 backdrop-blur-sm ${integrationHint?.section === "identity" ? "border-blue-400/50 ring-1 ring-blue-400/40" : "border-white/10"}`}>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-white/90">
                            <Bot className="w-5 h-5 text-purple-400" /> Identidad Básica
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Nombre del Agente</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={agentData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                                    placeholder="Ej. Asistente Frutas La Cosecha"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Tono y Personalidad</label>
                                <input
                                    type="text"
                                    name="agentTone"
                                    value={agentData.agentTone}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                                    placeholder="Ej. Amable, entusiasta, responde corto y con emojis"
                                    required
                                />
                                <p className="text-[10px] text-white/40 mt-1.5 ml-1">Instruye a la IA sobre cómo debe comportarse al hablar con tus clientes.</p>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge & Rules Section */}
                    <div className={`bg-white/5 border rounded-2xl p-6 backdrop-blur-sm ${integrationHint?.section === "knowledge" ? "border-blue-400/50 ring-1 ring-blue-400/40" : "border-white/10"}`}>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-white/90">
                            <AlertCircle className="w-5 h-5 text-emerald-400" /> Reglas y Conocimiento (Precios, Productos, FAQs)
                        </h2>

                        <div>
                            <textarea
                                name="businessDescription"
                                value={agentData.businessDescription}
                                onChange={handleChange}
                                className="w-full h-64 bg-black/50 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none scrollbar-thin scrollbar-thumb-white/10"
                                placeholder="Escribe aquí todo lo que el bot debe saber: 
- El domicilio cuesta $5.000
- Vendemos hamburguesas a $25.000
- No abrimos los festivos
- Nuestra dirección es Calle 123 #45-67"
                            />
                            <p className="text-xs text-white/40 mt-2">
                                Este es el <strong>cerebro</strong> de tu agente. Cualquier detalle sobre precios, promociones, direcciones o reglas de tu negocio debe ir aquí para que el bot pueda responder a los clientes con precisión.
                            </p>
                        </div>
                    </div>

                    {/* Schedule Section (Simplified) */}
                    <div className={`bg-white/5 border rounded-2xl p-6 backdrop-blur-sm ${integrationHint?.section === "schedule" ? "border-blue-400/50 ring-1 ring-blue-400/40" : "border-white/10"}`}>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-white/90">
                            <Clock className="w-5 h-5 text-orange-400" /> Horarios de Atención (Lunes a Viernes)
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Apertura</label>
                                <input
                                    type="time"
                                    value={agentData.schedules.find((s: any) => s.day === "monday")?.start || "09:00"}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
                                        const currentEnd = agentData.schedules.find((s: any) => s.day === "monday")?.end || "18:00";
                                        const newSchedules = days.map(day => ({ day, start: val, end: currentEnd }));
                                        setAgentData(prev => ({ ...prev, schedules: newSchedules }));
                                    }}
                                    className="w-full bg-black/50 border border-white/10 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Cierre</label>
                                <input
                                    type="time"
                                    value={agentData.schedules.find((s: any) => s.day === "monday")?.end || "18:00"}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
                                        const currentStart = agentData.schedules.find((s: any) => s.day === "monday")?.start || "09:00";
                                        const newSchedules = days.map(day => ({ day, start: currentStart, end: val }));
                                        setAgentData(prev => ({ ...prev, schedules: newSchedules }));
                                    }}
                                    className="w-full bg-black/50 border border-white/10 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-white/40 mt-3">
                            La IA solo ofrecerá citas dentro de este rango horario. Se aplica de Lunes a Viernes.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </button>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </motion.div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
