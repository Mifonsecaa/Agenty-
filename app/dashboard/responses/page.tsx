"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Save, Loader2, Plus, Trash2, HelpCircle } from "lucide-react";
import { useBrainia } from "@/context/BrainiaContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

type CustomResponse = {
    id: string;
    trigger: string;
    response: string;
};

export default function ResponsesPage() {
    const { activeAgent, updateActiveAgentConfig, saveAgent } = useBrainia();
    const [responses, setResponses] = useState<CustomResponse[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [handoffMessage, setHandoffMessage] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState("");

    useEffect(() => {
        if (!activeAgent) return;
        
        const config = activeAgent.config || activeAgent;
        
        // Cargar respuestas predefinidas si existen, si no inicializar vacío
        if (config.customResponses && Array.isArray(config.customResponses)) {
            setResponses(config.customResponses);
        } else {
            setResponses([]);
        }

        // Cargar mensajes del sistema
        setHandoffMessage(config.handoffMessage || "Dame un momento para confirmar esa información, por favor.");
        setWelcomeMessage(config.welcomeMessage || "¡Hola! Soy el asistente virtual. ¿En qué te puedo ayudar hoy?");
    }, [activeAgent]);

    const handleAddResponse = () => {
        setResponses([...responses, { id: Date.now().toString(), trigger: "", response: "" }]);
    };

    const handleRemoveResponse = (id: string) => {
        setResponses(responses.filter(r => r.id !== id));
    };

    const handleResponseChange = (id: string, field: 'trigger' | 'response', value: string) => {
        setResponses(responses.map(r => 
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const handleSave = async () => {
        if (!activeAgent?.id) return;
        setIsSaving(true);

        try {
            // Filtrar respuestas vacías antes de guardar
            const validResponses = responses.filter(r => r.trigger.trim() !== "" && r.response.trim() !== "");
            
            const currentConfig = activeAgent.config || {};
            const updatedConfig = {
                ...currentConfig,
                customResponses: validResponses,
                handoffMessage,
                welcomeMessage
            };

            const success = await saveAgent(activeAgent.id, activeAgent.name, updatedConfig);
            
            if (success) {
                updateActiveAgentConfig({ config: updatedConfig });
                toast.success("Respuestas personalizadas guardadas");
            } else {
                toast.error("Hubo un error al guardar las respuestas");
            }
        } catch (error) {
            console.error("Error saving responses:", error);
            toast.error("Error al guardar la configuración");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Respuestas Personalizadas <MessageSquare className="w-6 h-6 text-blue-400" />
                    </h1>
                    <p className="text-white/60">
                        Define exactamente qué debe decir el agente en situaciones específicas.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !activeAgent}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Mensajes del Sistema */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    Mensajes del Sistema
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Mensaje de Bienvenida</label>
                        <p className="text-xs text-white/40 mb-3">El primer mensaje que enviará el bot cuando un cliente inicie una conversación.</p>
                        <textarea
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            className="w-full h-20 bg-black/50 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                            placeholder="Ej. ¡Hola! Bienvenido a nuestra tienda. ¿En qué te puedo ayudar hoy?"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <label className="block text-sm font-medium text-white/70 mb-2">Mensaje de "Pausa" (Handoff) Seguro</label>
                        <p className="text-xs text-white/40 mb-3">Lo que dirá el bot cuando no sepa la respuesta o no tenga la información confirmada en su base de datos. <strong>Nota:</strong> Nunca dirá que pasará a un humano.</p>
                        <textarea
                            value={handoffMessage}
                            onChange={(e) => setHandoffMessage(e.target.value)}
                            className="w-full h-20 bg-black/50 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                            placeholder="Ej. Dame un momento para confirmar esa información exacta, por favor."
                        />
                    </div>
                </div>
            </div>

            {/* Respuestas Predefinidas */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">Reglas Estrictas de Conversación</h2>
                        <p className="text-xs text-white/40 mt-1">Si el cliente dice X, el agente responderá Y exactamente como lo escribas.</p>
                    </div>
                    <button
                        onClick={handleAddResponse}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Agregar Regla
                    </button>
                </div>

                <div className="space-y-4">
                    {responses.length === 0 ? (
                        <div className="text-center py-10 border border-white/5 border-dashed rounded-xl bg-black/20">
                            <p className="text-sm text-white/40">Aún no has definido ninguna regla estricta.</p>
                            <p className="text-xs text-white/30 mt-1">Haz clic en "Agregar Regla" para empezar.</p>
                        </div>
                    ) : (
                        responses.map((resp, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={resp.id} 
                                className="flex gap-4 p-4 border border-white/10 rounded-xl bg-black/40 relative group"
                            >
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-white/50 mb-1">Si el cliente pregunta o menciona algo sobre:</label>
                                        <input
                                            type="text"
                                            value={resp.trigger}
                                            onChange={(e) => handleResponseChange(resp.id, 'trigger', e.target.value)}
                                            placeholder="Ej. Métodos de pago, quejas, dirección, etc..."
                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/50 mb-1">El agente responderá exactamente con:</label>
                                        <textarea
                                            value={resp.response}
                                            onChange={(e) => handleResponseChange(resp.id, 'response', e.target.value)}
                                            placeholder="Ej. Aceptamos efectivo, tarjeta y transferencias."
                                            className="w-full min-h-[60px] bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-y"
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleRemoveResponse(resp.id)}
                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg h-fit transition-colors"
                                    title="Eliminar regla"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
