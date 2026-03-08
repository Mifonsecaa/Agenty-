"use client";
import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle2, Loader2, Bot, Sliders } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [agentData, setAgentData] = useState({
        id: "",
        name: "",
        businessType: "INDIVIDUAL_APPOINTMENTS",
        agentTone: "Amable y profesional",
        businessDescription: "",
        defaultDurationMinutes: 60,
        schedules: []
    });

    useEffect(() => {
        const loadConfig = () => {
            const configStr = localStorage.getItem("agenty_config");
            if (configStr) {
                try {
                    const config = JSON.parse(configStr);
                    const actualConfig = config.config || config; // Handle nested structure just in case

                    setAgentData({
                        id: config.id || "",
                        name: config.name || actualConfig.businessName || "Mi Agente",
                        businessType: actualConfig.businessType || "INDIVIDUAL_APPOINTMENTS",
                        agentTone: actualConfig.agentTone || "Amable",
                        businessDescription: actualConfig.businessDescription || "",
                        defaultDurationMinutes: actualConfig.defaultDurationMinutes || 60,
                        schedules: actualConfig.schedules || []
                    });
                } catch (e) {
                    console.error("Error parsing config", e);
                }
            }
            setIsLoading(false);
        };

        loadConfig();
        window.addEventListener('agentSwitched', loadConfig);
        return () => window.removeEventListener('agentSwitched', loadConfig);
    }, []);

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

                // Update localStorage so the rest of the app sees the changes immediately
                const currentFullConfigStr = localStorage.getItem("agenty_config");
                if (currentFullConfigStr) {
                    const currentFullConfig = JSON.parse(currentFullConfigStr);
                    const newLocalConfig = {
                        ...currentFullConfig,
                        name: agentData.name,
                        config: updatedConfig
                    };
                    localStorage.setItem("agenty_config", JSON.stringify(newLocalConfig));

                    // Dispatch event for components like Sidebar or Playground
                    window.dispatchEvent(new Event('agentSwitched'));
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al guardar.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setIsSaving(false);

            // Clear message after 3 seconds
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

                    {/* General Section */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
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

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
