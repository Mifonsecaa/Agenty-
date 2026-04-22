"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Bot, Save, Play, Send, Settings2, Sparkles, User, Loader2 } from "lucide-react";
import { useBrainia } from "@/context/BrainiaContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type BuilderMessage = {
    role: "assistant" | "user";
    text: string;
};

function buildDraftPrompt(messages: BuilderMessage[], fallbackBusinessName: string) {
    const userInputs = messages
        .filter((m) => m.role === "user")
        .map((m) => m.text.trim())
        .filter(Boolean);

    const identity = userInputs[0] || "Pendiente: nombre del negocio, rubro y tono de voz.";
    const objective = userInputs[1] || "Pendiente: objetivo principal del agente.";
    const logistics = userInputs[2] || "Pendiente: horarios, dias, zonas y metodos de pago.";
    const guardrails = userInputs[3] || "Pendiente: limites/guardrails (que nunca debe hacer).";
    const executionProtocol =
        userInputs[4] ||
        "Pendiente: como ejecutar cada accion clave (ej: reserva -> anotar en hoja de calculo, consulta -> leer hoja sin revelar datos de terceros).";

    return `SOP DRAFT - ${fallbackBusinessName || "Negocio"}

PASO 1 - IDENTIDAD
${identity}

PASO 2 - OBJETIVO PRINCIPAL
${objective}

PASO 3 - LOGISTICA
${logistics}

PASO 4 - LIMITES (GUARDRAILS)
${guardrails}

PASO 5 - PROTOCOLO DE EJECUCION POR ACCION
${executionProtocol}

REGLAS OPERATIVAS
- Nunca inventar informacion fuera del contexto validado.
- Hacer una sola pregunta por turno cuando falte informacion critica.
- Confirmar accion solo cuando haya datos completos.
- Mantener continuidad sin reiniciar la conversacion.
- Ejecutar acciones criticas en el sistema definido por el negocio (ej. hoja de calculo del conocimiento).`;
}

export default function BuilderPlayground() {
    const { activeAgent, saveAgent, refreshAgents } = useBrainia();
    const router = useRouter();
    const [agentName, setAgentName] = useState("AgentBot");
    const [aiProvider, setAiProvider] = useState("openai");
    const [systemPrompt, setSystemPrompt] = useState("Cargando personalidad...");
    const [messages, setMessages] = useState<BuilderMessage[]>([
        {
            role: "assistant",
            text: "Soy Brainia Builder. Empecemos por lo basico: como se llama tu negocio y a que se dedica? Luego te preguntare como quieres que el agente ejecute cada accion clave."
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    const quickStartChips = [
        "Restaurante con reservas",
        "Tienda de productos fisicos",
        "Atencion y soporte al cliente"
    ];

    const handleDeploy = () => {
        router.push('/dashboard/connections');
    };

    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [fullAgentConfig, setFullAgentConfig] = useState<any>(null); // To store all fields to pass to the magic prompt generator

    // Auto-scroll al final del chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Cargar la configuración del agente y priorizar prompt persistido
    useEffect(() => {
        if (!activeAgent) return;

        const config = activeAgent.config || activeAgent;
        setFullAgentConfig(config);
        setAgentName(config.businessName || activeAgent.name || "AgentBot");
        setAiProvider(config.aiProvider || "openai");

        // Fuente de verdad: config.systemPrompt (con fallback legacy)
        const persistedPrompt = (config?.systemPrompt || activeAgent.systemPrompt || "").trim();

        if (persistedPrompt) {
            setSystemPrompt(persistedPrompt);
        } else if (config.schedules) {
            const generatedPrompt = `Eres el asistente virtual para: ${config.businessName || activeAgent.name}.
Tu comportamiento y personalidad debe ser: ${config.agentTone || 'Amable y profesional'}.

REGLAS DE NEGOCIO Y CONOCIMIENTO:
${config.businessDescription || 'Aún no hay reglas específicas.'}

Tipo de negocio: ${config.businessType === 'GROUP_CLASSES' ? 'Clases Grupales' : 'Citas/Pedidos Individuales'}.
Duración estándar de reserva/atención: ${config.defaultDurationMinutes || 60} minutos.

Horarios disponibles:
${config.schedules.map((s: any) => `- ${s.activityName}: Días de semana (1=Lunes): [${s.daysOfWeek.join(', ')}], de ${s.startTime} a ${s.endTime}. Capacidad máxima: ${s.maxCapacity}`).join('\n')}

Por favor, actúa estrictamente basándote en esta personalidad, conocimientos de productos/precios y horarios al responder a los clientes.`;

            setSystemPrompt(generatedPrompt);
        } else {
            setSystemPrompt("Eres un asistente virtual. Sé amable y conciso.");
        }

        if (activeAgent.greeting) {
            setMessages([{ role: "assistant", text: activeAgent.greeting }]);
        } else {
            setMessages([
                {
                    role: "assistant",
                    text: `Soy Brainia Builder para ${config.businessName || 'tu negocio'}. Dime como se llama tu negocio y que hace.`
                }
            ]);
        }
    }, [activeAgent]);


    const handleSave = async () => {
        if (!activeAgent || !fullAgentConfig) return;
        const normalizedPrompt = systemPrompt.trim();
        if (!normalizedPrompt) {
            toast.error("El System Prompt no puede quedar vacio");
            return;
        }

        setIsSaving(true);

        try {
            const updatedConfig = {
                ...fullAgentConfig,
                businessName: agentName,
                aiProvider,
                systemPrompt: normalizedPrompt
            };

            const success = await saveAgent(activeAgent.id, agentName, updatedConfig);
            if (success) {
                setSystemPrompt(normalizedPrompt);
                setFullAgentConfig(updatedConfig);
                toast.success("Borrador guardado correctamente");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Error al persistir los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoGeneratePrompt = async () => {
        if (!fullAgentConfig) return;
        setIsGeneratingPrompt(true);

        try {
            const res = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullAgentConfig)
            });

            if (!res.ok) {
                toast.error("No se pudo generar el prompt estricto");
                return;
            }

            const data = await res.json();
            if (data.success && data.prompt) {
                setSystemPrompt(data.prompt);
                toast.success("Prompt generado correctamente");
            } else {
                toast.error(data.error || "No se pudo generar el prompt estricto");
            }
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error al contactar al motor de magia de prompts.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;
        if (!activeAgent) {
            toast.error("Selecciona un agente antes de probar el chat");
            return;
        }

        const userMsg = input.trim();
        const currentMessages: BuilderMessage[] = [...messages, { role: "user", text: userMsg }];

        setMessages(currentMessages);
        setSystemPrompt(buildDraftPrompt(currentMessages, agentName));
        setInput("");
        setIsTyping(true);

        try {
            const apiMessages = currentMessages.map(m => ({
                role: m.role,
                content: m.text
            }));

            const reqMessages = [
                { role: 'system', content: systemPrompt },
                ...apiMessages
            ];

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: reqMessages,
                    provider: aiProvider,
                    agentId: activeAgent?.id,
                    systemPrompt,
                    mode: "builder_interview"
                })
            });

            if (!res.ok) {
                setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error al procesar tu mensaje. Revisa tu consola." }]);
                return;
            }

            const data = await res.json();
            const nextMessages: BuilderMessage[] = [...currentMessages, { role: "assistant", text: data.content }];
            setMessages(nextMessages);

            if (!data?.systemPromptFinal) {
                setSystemPrompt(buildDraftPrompt(nextMessages, agentName));
            }

            if (data?.completed && data?.saved && data?.systemPromptFinal) {
                const finalBusinessName = data.businessName || agentName;
                setSystemPrompt(data.systemPromptFinal);
                setAgentName(finalBusinessName);

                const mergedConfig = {
                    ...(fullAgentConfig || activeAgent.config || {}),
                    businessName: finalBusinessName,
                    aiProvider,
                    systemPrompt: data.systemPromptFinal,
                    builderInterview: {
                        completedAt: new Date().toISOString(),
                        transcript: nextMessages,
                    },
                };

                const persisted = await saveAgent(activeAgent.id, finalBusinessName, mergedConfig);
                if (!persisted) {
                    toast.warning("El SOP se genero, pero no se pudo confirmar el guardado local. Intenta guardar manualmente.");
                    return;
                }

                await refreshAgents();
                toast.success("SOP guardado. Redirigiendo al dashboard...");
                setTimeout(() => router.push("/dashboard"), 900);
            }

        } catch (error) {
            console.error("Error enviando mensaje al chat:", error);
            setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error al procesar tu mensaje. Revisa tu consola." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative z-10">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Agent Builder <Sparkles className="w-5 h-5 text-purple-400" />
                    </h1>
                    <p className="text-white/60">Configura la personalidad y prueba a tu agente en tiempo real.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !activeAgent}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Guardando...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 text-white font-medium shadow-lg transition-all"
                    >
                        <Play className="w-4 h-4" /> Conectar WhatsApp
                    </button>

                    {/* Toggle global playground panel (dispatch custom event) */}
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('togglePlayground', { detail: { open: true } }))}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all"
                        title={'Abrir panel de pruebas'}
                    >
                        <Play className="w-4 h-4" /> Abrir Playground
                    </button>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-1 gap-6 min-h-0 overflow-hidden">

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col min-h-[420px]">
                    <div className="flex items-center gap-2 mb-4">
                        <Bot className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold">Entrevista Guiada (Brainia Builder)</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {messages.map((m, idx) => (
                            <div
                                key={`${m.role}-${idx}`}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed border ${
                                        m.role === "user"
                                            ? "bg-blue-600/30 border-blue-400/30 text-white"
                                            : "bg-white/5 border-white/10 text-white/90"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1 text-xs text-white/50">
                                        {m.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        <span>{m.role === "user" ? "Tu" : "Builder"}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{m.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && <p className="text-xs text-white/50">Brainia Builder esta escribiendo...</p>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Como se llama tu negocio y que hace? (Luego definimos como ejecutar reservas, pedidos y consultas)"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !activeAgent || !input.trim()}
                                className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {quickStartChips.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => setInput(chip)}
                                    className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white/85"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>

                {/* Left Column: Configuration */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-emerald-400" /> Personality & Rules
                        </h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Agent Name</label>
                            <input
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">AI Provider</label>
                            <select
                                value={aiProvider}
                                onChange={(e) => setAiProvider(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="openai">OpenAI (GPT-4o Mini)</option>
                                <option value="github">GitHub Models (Copilot)</option>
                                <option value="gemini">Google Gemini</option>
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium text-white/70 mb-2 flex justify-between items-center">
                                <span>System Prompt (Instructions)</span>
                                <button
                                    onClick={handleAutoGeneratePrompt}
                                    disabled={isGeneratingPrompt || !fullAgentConfig}
                                    className="text-purple-400 text-xs hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                    <Sparkles className={`w-3 h-3 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                                    {isGeneratingPrompt ? 'Mejorando...' : 'Auto-generate'}
                                </button>
                            </label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full flex-1 min-h-62.5 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono text-sm leading-relaxed"
                            ></textarea>
                        </div>
                    </div>
                </div>

            </div>

            {/* Playground ahora es un componente global montado en layout (PlaygroundPanel). */}

        </div>
    );
}
