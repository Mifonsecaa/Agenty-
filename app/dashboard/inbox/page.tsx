"use client";
import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, CheckCircle2, AlertCircle, Clock, Smartphone, Instagram, Globe, Sparkles } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";

export default function LiveInbox() {
    const { activeAgent } = useAgenty();
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [inputMessage, setInputMessage] = useState("");

    // Cargar lista de chats
    useEffect(() => {
        if (!activeAgent?.id) return;

        const fetchChats = async () => {
            try {
                const res = await fetch(`/api/chats?businessId=${activeAgent.id}`);
                const data = await res.json();
                if (data.success) {
                    setChats(data.chats);
                }
            } catch (error) {
                console.error("Error loading chats", error);
            }
        };

        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, [activeAgent]);

    // Cargar historial de mensajes
    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {
            // Solo poner loading la primera vez o si cambia de chat
            if (messages.length === 0) setIsLoadingMessages(true);
            try {
                const res = await fetch(`/api/chats/${selectedChatId}/messages`);
                const data = await res.json();
                if (data.success) {
                    const mapped = data.history.map((m: any) => ({
                        id: m.id,
                        role: m.role === 'assistant' ? 'agent' : m.role, // Mapping backend -> UI
                        text: m.content || m.text,
                        createdAt: m.createdAt
                    }));
                    setMessages(mapped);
                }
            } catch (error) {
                console.error("Error loading messages", error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedChatId]);

    const handleSendMessage = async () => {
        if (!selectedChatId || !inputMessage.trim()) return;
        
        const tempMsg = { role: 'agent', text: inputMessage, id: 'temp-' + Date.now() };
        setMessages(prev => [...prev, tempMsg]);
        setInputMessage("");

        try {
            await fetch(`/api/chats/${selectedChatId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: tempMsg.text })
            });
            // El polling actualizará el mensaje real
        } catch (error) {
            console.error("Error sending message", error);
            alert("No se pudo enviar el mensaje");
        }
    };

    const agentName = activeAgent?.name || "Agent";
    const activeChatData = chats.find(c => c.id === selectedChatId);

    return (
        <div className="h-full flex flex-col relative z-10 overflow-hidden">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Live Inbox (Monitor)</h1>
                    <p className="text-white/60">Observa en tiempo real cómo <strong>{agentName}</strong> interactúa con tus clientes.</p>
                </div>
            </div>

            <div className="flex-1 bg-black border border-white/10 rounded-2xl flex overflow-hidden shadow-2xl min-h-0">

                {/* Left Sidebar: Conversaciones */}
                <div className="w-80 border-r border-white/10 bg-[#0a0a0a] flex flex-col">
                    <div className="p-4 border-b border-white/10 shrink-0">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-xs font-medium py-1.5 rounded-md border border-white/5 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Active
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-xs font-medium py-1.5 rounded-md border border-white/5 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Handoff
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedChatId === chat.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center font-bold text-xs uppercase text-white/70 shadow-inner">
                                            {chat.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-sm text-white/90 truncate max-w-[120px]">{chat.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white/40 whitespace-nowrap">{chat.time}</span>
                                </div>
                                <div className="pl-10">
                                    <p className="text-xs text-white/60 truncate pr-6">{chat.preview}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {chat.source === 'whatsapp' && <Smartphone className="w-3 h-3 text-emerald-400" />}
                                        {chat.source === 'instagram' && <Instagram className="w-3 h-3 text-rose-400" />}
                                        {chat.source === 'web' && <Globe className="w-3 h-3 text-blue-400" />}

                                        {chat.status === 'resolved' && <span className="text-[9px] text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 rounded">Resolved by AI</span>}
                                        {chat.status === 'active' && <span className="text-[9px] text-blue-400 border border-blue-400/20 bg-blue-400/10 px-1.5 py-0.5 rounded">AI Talking</span>}
                                        {chat.status === 'handoff' && <span className="text-[9px] text-amber-400 border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 rounded">Needs Human</span>}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Area: Log de Lectura */}
                <div className="flex-1 flex flex-col bg-[#111111] relative">
                    {activeChatData ? (
                        <>
                            {/* Cabecera del chat */}
                            <div className="h-16 border-b border-white/10 bg-[#161616] flex items-center justify-between px-6 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white/70 shadow-inner">
                                        {activeChatData.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-white/90">{activeChatData.name}</h2>
                                        <p className="text-xs text-white/50">{activeChatData.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {activeChatData.status === 'handoff' && (
                                        <button className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                            Tomar Control (Handoff)
                                        </button>
                                    )}
                                    <button className="p-2 border border-white/10 hover:bg-white/5 rounded-lg transition-colors text-white/50">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Alerta si es handoff */}
                            {activeChatData.status === 'handoff' && (
                                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center gap-2 text-xs text-amber-500">
                                    <AlertCircle className="w-4 h-4" />
                                    El agente de IA detuvo la conversación. Este cliente necesita atención humana crítica.
                                </div>
                            )}

                            {/* Historial (Conectado a API) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="text-center text-[10px] text-white/30 font-medium tracking-widest uppercase mb-8">
                                    Conversación en {activeChatData.source}
                                </div>

                                {messages.map((msg, i) => {
                                    if (msg.role === "system") {
                                        return (
                                            <div key={i} className="flex justify-center my-6">
                                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-full font-medium shadow-sm">
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                            <div className="flex items-end gap-2 max-w-[70%]">
                                                {msg.role === 'user' && (
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0">
                                                        {activeChatData.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-[#222222] text-white/90 rounded-bl-none border border-white/5'
                                                    : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-br-none shadow-md shadow-purple-500/10'
                                                    }`}>
                                                    {msg.text}
                                                </div>

                                                {msg.role === 'agent' && (
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeChatData.status === 'active' && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                                    <div className="flex justify-end pr-8">
                                        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> IA pensando respuesta...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Habilitado */}
                            <div className="p-4 border-t border-white/10 bg-[#161616]">
                                <form 
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="bg-[#0a0a0a] border border-white/5 rounded-xl p-2 flex gap-2 items-center"
                                >
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent border-none text-white text-sm px-3 focus:outline-none"
                                        placeholder="Escribe un mensaje..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                                        disabled={!inputMessage.trim()}
                                    >
                                        <span className="sr-only">Enviar</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Selecciona una conversación para leer el historial.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
