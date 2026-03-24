"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Save, Play, Send, Settings2, Sparkles, User, Loader2 } from "lucide-react";
import { useBrainia } from "@/context/BrainiaContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BuilderPlayground() {
    const { activeAgent, saveAgent } = useBrainia();
    const router = useRouter();
    const [agentName, setAgentName] = useState("AgentBot");
    const [aiProvider, setAiProvider] = useState("openai");
    const [systemPrompt, setSystemPrompt] = useState("Cargando personalidad...");
    const [messages, setMessages] = useState([
        { role: "assistant", text: "¡Hola! Soy tu asistente de prueba. ¿En qué te ayudo hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    const handleDeploy = () => {
        router.push('/dashboard/connections');
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
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">

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
                            <label className="block text-sm font-medium text-white/70 mb-2 flex justify-between items-center">
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
                                className="w-full flex-1 min-h-[250px] bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono text-sm leading-relaxed"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column: Simulator */}
                <div className="flex flex-col gap-6 min-h-0 overflow-hidden">

                    {/* Phone Mockup Window */}
                    <div className="flex-1 bg-black border border-white/10 rounded-2xl flex flex-col min-h-0 relative shadow-2xl">
                        {/* Header chat */}
                        <div className="bg-[#111111] px-4 py-3 border-b border-white/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{agentName}</p>
                                <p className="text-[10px] text-emerald-400">● Online (Test Mode)</p>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}>
                                            {m.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-[#1a1a1a] text-white/90 rounded-bl-none border border-white/5'
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
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="bg-[#1a1a1a] border border-white/5 text-white/90 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Chat */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-[#111111] border-t border-white/10">
                            <div className="flex relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a test message..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-1 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-4 h-4 text-white -ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

        </div>
    );
}
