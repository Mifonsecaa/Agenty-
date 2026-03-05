"use client";
import { useState, useEffect } from "react";
import { Bot, Save, Play, TerminalSquare, Send, Settings2, Sparkles } from "lucide-react";

export default function BuilderPlayground() {
    const [agentName, setAgentName] = useState("AgentBot");
    const [systemPrompt, setSystemPrompt] = useState("Cargando personalidad...");
    const [messages, setMessages] = useState([
        { role: "assistant", text: "¡Hola! Soy tu asistente de prueba. ¿En qué te ayudo hoy?" }
    ]);
    const [input, setInput] = useState("");

    // Cargar la configuración mágica generada desde la Home
    useEffect(() => {
        const savedConfig = localStorage.getItem("agenty_config");
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.name) setAgentName(config.name);
                if (config.systemPrompt) setSystemPrompt(config.systemPrompt);
                if (config.greeting) {
                    setMessages([{ role: "assistant", text: config.greeting }]);
                }
            } catch (e) {
                console.error("Error parsing config", e);
            }
        }
    }, []);

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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all">
                        <Play className="w-4 h-4" /> Deploy to WhatsApp
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Chat */}
                        <div className="p-3 bg-[#111111] border-t border-white/10">
                            <div className="flex relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a test message..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                                />
                                <button className="absolute right-1 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                    <Send className="w-4 h-4 text-white -ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Magic Terminal feedback */}
                    <div className="h-32 bg-black border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3">
                            <TerminalSquare className="w-4 h-4 text-white/30" />
                        </div>
                        <p className="text-blue-400 mb-2">▶ SYSTEM LOGS</p>
                        <p className="text-emerald-400 opacity-80">&gt; System Prompt loaded successfully.</p>
                        <p className="text-white/40">&gt; Waiting for incoming messages...</p>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    </div>

                </div>

            </div>
        </div>
    );
}
