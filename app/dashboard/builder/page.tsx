"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Save, Play, TerminalSquare, Send, Settings2, Sparkles, User } from "lucide-react";

export default function BuilderPlayground() {
    const [agentName, setAgentName] = useState("AgentBot");
    const [systemPrompt, setSystemPrompt] = useState("Cargando personalidad...");
    const [messages, setMessages] = useState([
        { role: "assistant", text: "¡Hola! Soy tu asistente de prueba. ¿En qué te ayudo hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showQrModal, setShowQrModal] = useState(false);
    const [qrState, setQrState] = useState<"generating" | "ready" | "connected">("generating");

    const handleDeploy = () => {
        setShowQrModal(true);
        setQrState("generating");

        // Simular tiempo de generación del QR
        setTimeout(() => {
            setQrState("ready");

            // Simular escaneo exitoso después de unos segundos
            setTimeout(() => {
                setQrState("connected");

                // Cerrar modal automáticamente
                setTimeout(() => {
                    setShowQrModal(false);
                }, 2000);
            }, 6000); // 6 segundos para que el usuario "escanee"
        }, 1500);
    };

    // Cargar la configuración mágica generada desde la Home
    useEffect(() => {
        const loadActiveAgent = () => {
            const savedAgentsStr = localStorage.getItem("agenty_agents");
            const activeId = localStorage.getItem("agenty_active_agent_id");

            if (savedAgentsStr) {
                try {
                    const parsedAgents = JSON.parse(savedAgentsStr);
                    const active = parsedAgents.find((a: any) => a.id === activeId) || parsedAgents[0];

                    if (active) {
                        setAgentName(active.name || "AgentBot");
                        setSystemPrompt(active.systemPrompt || "Cargando personalidad...");
                        if (active.greeting) {
                            setMessages([{ role: "assistant", text: active.greeting }]);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing agents", e);
                }
            }
        };

        loadActiveAgent();
        window.addEventListener('agentSwitched', loadActiveAgent);
        return () => window.removeEventListener('agentSwitched', loadActiveAgent);
    }, []);

    // Auto-scroll al final del chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setIsTyping(true);

        // Simulador de respuesta "con IA"
        setTimeout(() => {
            const mockResponses = [
                `Como ${agentName}, estoy configurado para ayudarte con eso. ¿Necesitas más detalles?`,
                "Entiendo. Según mis reglas de negocio, podemos proceder con esa solicitud.",
                "¡Claro que sí! Estoy procesando esa información justo ahora.",
                "Esa es una excelente pregunta. En este modo de prueba, te confirmo que puedo manejar ese flujo.",
                "Revisando mi base de conocimiento... ¡Listo! Te puedo confirmar que sí es posible."
            ];

            // Respuesta basada vagamente en la longitud o palabras (muy simple mockup)
            let responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];

            if (userMsg.toLowerCase().includes("hola")) responseText = "¡Hola nuevamente! ¿Cómo van las pruebas?";
            if (userMsg.toLowerCase().includes("precio")) responseText = "Nuestros precios dependen de tus necesidades. ¿Te gustaría agendar una llamada?";

            setMessages(prev => [...prev, { role: "assistant", text: responseText }]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000); // Retraso aleatorio para parecer humano/IA pensando
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all">
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <Play className="w-4 h-4" /> Conectar WhatsApp
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

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

                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-medium text-white/70 mb-2 flex justify-between">
                                <span>System Prompt (Instructions)</span>
                                <button className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Auto-generate
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
                <div className="flex flex-col gap-6">

                    {/* Phone Mockup Window */}
                    <div className="flex-1 bg-black border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
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

            {/* WhatsApp QR Modal Overlay */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />

                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                            <Bot className="w-8 h-8 text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Conecta tu Número</h2>
                        <p className="text-sm text-white/50 mb-8">
                            Abre WhatsApp en tu teléfono, ve a Dispositivos Vinculados y escanea el código para desplegar a <strong className="text-white">'{agentName}'</strong>.
                        </p>

                        {/* QR Box */}
                        <div className="w-48 h-48 bg-white rounded-2xl mb-8 relative flex items-center justify-center overflow-hidden">
                            {qrState === "generating" && (
                                <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center border border-white/10 rounded-2xl">
                                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    <p className="text-xs text-white/50 font-mono">Generando sesión...</p>
                                </div>
                            )}

                            {qrState === "ready" && (
                                <>
                                    {/* Un QR simulado usando caracteres de bloque para no depender de imágenes reales */}
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

                                    {/* Efecto láser escaneando */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-[scan_2s_ease-in-out_infinite]" />
                                </>
                            )}

                            {qrState === "connected" && (
                                <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white">
                                    <Sparkles className="w-12 h-12 mb-2 animate-bounce" />
                                    <p className="font-bold">¡Conectado!</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowQrModal(false)}
                            className="text-sm text-white/40 hover:text-white transition-colors"
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
