"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Save, Play, Send, Settings2, Sparkles, User, Loader2 } from "lucide-react";
import { useBrainia } from "@/context/BrainiaContext";
import { toast } from "sonner";
import Image from 'next/image';

export default function BuilderPlayground() {
    const { activeAgent, saveAgent } = useBrainia();
    const [agentName, setAgentName] = useState("AgentBot");
    const [aiProvider, setAiProvider] = useState("openai");
    const [systemPrompt, setSystemPrompt] = useState("Cargando personalidad...");
    const [messages, setMessages] = useState([
        { role: "assistant", text: "¡Hola! Soy tu asistente de prueba. ¿En qué te ayudo hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showQrModal, setShowQrModal] = useState(false);
    const [qrState, setQrState] = useState<"generating" | "ready" | "connected">("generating");
    const [realQrCode, setRealQrCode] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleDeploy = async () => {
        if (!activeAgent) return;
        setShowQrModal(true);
        setQrState("generating");
        setRealQrCode(null);

        try {
            const res = await fetch("/api/whatsapp/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentId: activeAgent.id })
            });

            const data = await res.json();
            if (data.success) {
                if (data.state === "CONNECTED") {
                    setQrState("connected");
                    setTimeout(() => setShowQrModal(false), 2000);
                } else if (data.state === "READY" && data.qrcode) {
                    setRealQrCode(data.qrcode);
                    setQrState("ready");
                    startPollingStatus();
                } else if (data.state === "INITIALIZING") {
                    // Si está inicializando, simplemente esperamos a que el polling haga su trabajo
                    // o lanzamos un reintento silencioso después de 5 segundos si no hay QR aún
                    if (qrState === "generating") {
                        console.log("[Builder] Still initializing, retrying fetch in 5s...");
                        setTimeout(() => handleDeploy(), 5000);
                    }
                }
            } else {
                toast.error(data.error || "Error al conectar con WhatsApp");
            }
        } catch (error) {
            console.error("Error en handleDeploy:", error);
            toast.error("Error al iniciar la conexión");
        }
    };

    const startPollingStatus = () => {
        const interval = setInterval(async () => {
            if (!showQrModal) {
                clearInterval(interval);
                return;
            }

            try {
                const res = await fetch(`/api/whatsapp/connect?agentId=${activeAgent?.id}`);
                const data = await res.json();
                if (data.success && data.state === "CONNECTED") {
                    setQrState("connected");
                    clearInterval(interval);
                    setTimeout(() => setShowQrModal(false), 2000);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000);
    };

    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [fullAgentConfig, setFullAgentConfig] = useState<any>(null); // To store all fields to pass to the magic prompt generator

    // Auto-scroll al final del chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Cargar la configuración mágica generada desde la Home
    useEffect(() => {
        if (!activeAgent) return;

        const config = activeAgent.config || activeAgent;
        setFullAgentConfig(config);
        setAgentName(config.businessName || activeAgent.name || "AgentBot");
        setAiProvider(config.aiProvider || "openai");

        // Si ya tiene un system prompt guardado, usamos ese. Si no, generamos uno a partir del config
        if (activeAgent.systemPrompt) {
            setSystemPrompt(activeAgent.systemPrompt);
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
            setMessages([{ role: "assistant", text: `¡Hola! Soy tu asistente de ${config.businessName || 'este negocio'}. ¿En qué te puedo asesorar?` }]);
        }
    }, [activeAgent]);


    const handleSave = async () => {
        if (!activeAgent || !fullAgentConfig) return;
        setIsSaving(true);

        try {
            const updatedConfig = {
                ...fullAgentConfig,
                businessName: agentName,
                aiProvider,
                systemPrompt: systemPrompt
            };

            const success = await saveAgent(activeAgent.id, agentName, updatedConfig);
            if (success) {
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;
        if (!activeAgent) {
            toast.error("Selecciona un agente antes de probar el chat");
            return;
        }

        const userMsg = input.trim();
        const currentMessages = [...messages, { role: "user", text: userMsg }];

        setMessages(currentMessages);
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
                })
            });

            if (!res.ok) {
                setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error al procesar tu mensaje. Revisa tu consola." }]);
                return;
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", text: data.content }]);

        } catch (error) {
            console.error("Error enviando mensaje al chat:", error);
            setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error al procesar tu mensaje. Revisa tu consola." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative z-10 p-4 md:p-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-gray-900 dark:text-white">
                        Agent Builder <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </h1>
                    <p className="text-gray-600 dark:text-white/60">Configura la personalidad y prueba a tu agente en tiempo real.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !activeAgent}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white font-medium transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Guardando...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <Play className="w-4 h-4" /> Conectar WhatsApp
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">

                {/* Left Column: Configuration */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col overflow-y-auto shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Settings2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Personality & Rules
                        </h2>
                    </div>

                    <div className="space-y-6 flex-1 flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Agent Name</label>
                            <input
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">AI Provider</label>
                            <select
                                value={aiProvider}
                                onChange={(e) => setAiProvider(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="openai">OpenAI (GPT-4o Mini)</option>
                                <option value="github">GitHub Models (Copilot)</option>
                                <option value="gemini">Google Gemini</option>
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2 flex justify-between items-center">
                                <span>System Prompt (Instructions)</span>
                                <button
                                    onClick={handleAutoGeneratePrompt}
                                    disabled={isGeneratingPrompt || !fullAgentConfig}
                                    className="text-purple-600 dark:text-purple-400 text-xs hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                    <Sparkles className={`w-3 h-3 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                                    {isGeneratingPrompt ? 'Mejorando...' : 'Auto-generate'}
                                </button>
                            </label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full flex-1 min-h-[250px] bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white/90 placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono text-sm leading-relaxed"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column: Simulator */}
                <div className="flex flex-col gap-6 min-h-0 overflow-hidden">

                    {/* Phone Mockup Window */}
                    <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col min-h-0 relative shadow-2xl overflow-hidden">
                        {/* Header chat */}
                        <div className="bg-gray-50 dark:bg-[#111111] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{agentName}</p>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">● Online (Test Mode)</p>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-tr from-blue-600 to-purple-600'}`}>
                                            {m.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white/90 rounded-bl-none border border-gray-200 dark:border-white/5'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-end gap-2 max-w-[85%] flex-row">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Chat */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-white/10">
                            <div className="flex relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a test message..."
                                    className="w-full bg-gray-100 dark:bg-[#0a0a0a] border border-transparent focus:border-blue-500 rounded-full pl-4 pr-12 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-1 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-4 h-4 text-white -ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

            {/* WhatsApp QR Modal Overlay */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />

                    <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                            <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Conecta tu Número</h2>
                        <p className="text-sm text-gray-600 dark:text-white/50 mb-8">
                            Abre WhatsApp en tu teléfono, ve a Dispositivos Vinculados y escanea el código para desplegar a <strong className="text-gray-900 dark:text-white">'{agentName}'</strong>.
                        </p>

                        {/* QR Box */}
                        <div className="w-48 h-48 bg-white rounded-2xl mb-8 relative flex items-center justify-center overflow-hidden border border-gray-200 dark:border-none shadow-sm dark:shadow-none">
                            {qrState === "generating" && (
                                <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    <p className="text-xs text-gray-500 dark:text-white/50 font-mono">Generando sesión...</p>
                                </div>
                            )}

                            {qrState === "ready" && (
                                <>
                                    {/* Un QR simulado usando caracteres de bloque para no depender de imágenes reales */}
                                    {realQrCode ? (
                                        <div className="relative w-full h-full p-2">
                                            <Image 
                                                src={realQrCode} 
                                                alt="WhatsApp QR Code" 
                                                fill 
                                                className="object-contain p-2" 
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <pre className="text-black text-[6px] leading-[6px] tracking-tighter opacity-80 pointer-events-none select-none overflow-hidden h-full flex flex-col justify-center">
                                            {"██████████████  ████  ██████████████\n" +
                                                "██          ██  ██    ██          ██\n" +
                                                "██  ██████  ██      ████  ██████  ██\n" +
                                                "██  ██████  ██  ████  ██  ██████  ██\n" +
                                                "██  ██████  ██  ██  ████  ██████  ██\n" +
                                                "██          ██  ██    ██          ██\n" +
                                                "██████████████  ██  ████████████████\n" +
                                                "                ██████              \n" +
                                                "████  ████  ████████    ██  ████  ██\n" +
                                                "  ████    ████████  ████████    ████\n" +
                                                "██  ████████  ████  ██    ██████  ██\n" +
                                                "                ██████              \n" +
                                                "██████████████  ████████  ████  ████\n" +
                                                "██          ██  ██████  ██      ████\n" +
                                                "██  ██████  ██      ████████  ██  ██\n" +
                                                "██  ██████  ██  ██████  ████    ████\n" +
                                                "██  ██████  ██  ████  ██      ██  ██\n" +
                                                "██          ██    ██████      ██  ██\n" +
                                                "██████████████  ████████████████████"}
                                        </pre>
                                    )}

                                    {/* Efecto láser escaneando */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_15px_#10b981] dark:shadow-[0_0_15px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />
                                </>
                            )}

                            {qrState === "connected" && (
                                <div className="absolute inset-0 bg-emerald-600 dark:bg-emerald-500 flex flex-col items-center justify-center text-white">
                                    <Sparkles className="w-12 h-12 mb-2 animate-bounce" />
                                    <p className="font-bold">¡Conectado!</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowQrModal(false)}
                            className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Animación del láser QR (se podría mover a un CSS global para limpieza) */}
            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
            `}</style>

        </div>
    );
}