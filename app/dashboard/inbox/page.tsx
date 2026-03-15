"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, MoreVertical, AlertCircle, Smartphone, Camera, Globe, Sparkles } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";
import { toast } from "sonner";

const CHATS_POLL_MS = 10000;
const MESSAGES_POLL_MS = 5000;

async function parseApiJson<T>(res: Response): Promise<T | null> {
    const raw = await res.text();
    try {
        return JSON.parse(raw) as T;
    } catch {
        console.error("[Inbox] API returned non-JSON response", {
            status: res.status,
            snippet: raw.slice(0, 180),
        });
        return null;
    }
}

export default function LiveInbox() {
    const { activeAgent } = useAgenty();
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "handoff">("all");
    const [isTakingControl, setIsTakingControl] = useState(false);

    useEffect(() => {
        const handleVisibility = () => {
            setIsPageVisible(!document.hidden);
        };

        handleVisibility();
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    // Cargar lista de chats
    useEffect(() => {
        if (!activeAgent?.id || !isPageVisible) return;

        const fetchChats = async () => {
            try {
                const res = await fetch(`/api/chats?businessId=${activeAgent.id}`);
                const data = await parseApiJson<{ success?: boolean; chats?: any[]; error?: string }>(res);
                if (res.ok && data?.success && Array.isArray(data.chats)) {
                    setChats(data.chats);
                } else if (!res.ok && data?.error) {
                    toast.error(data.error);
                }
            } catch (error) {
                console.error("Error loading chats", error);
            }
        };

        fetchChats();
        const interval = setInterval(fetchChats, CHATS_POLL_MS);
        return () => clearInterval(interval);
    }, [activeAgent, isPageVisible]);

    // Cargar historial de mensajes
    useEffect(() => {
        if (!selectedChatId || !isPageVisible) return;

        const fetchMessages = async () => {
            if (!selectedChatId) return;
            try {
                const res = await fetch(`/api/chats/${selectedChatId}/messages`);
                const data = await parseApiJson<{ success?: boolean; history?: any[]; error?: string }>(res);
                if (res.ok && data?.success && Array.isArray(data.history)) {
                    const mapped = data.history.map((m: any) => ({
                        id: m.id,
                        role: m.role === 'assistant' ? 'agent' : m.role, // Mapping backend -> UI
                        text: m.content || m.text,
                        createdAt: m.createdAt
                    }));
                    setMessages(mapped);
                } else if (!res.ok && data?.error) {
                    toast.error(data.error);
                }
            } catch (error) {
                console.error("Error loading messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, MESSAGES_POLL_MS);
        return () => clearInterval(interval);
    }, [selectedChatId, isPageVisible]);

    const handleSendMessage = async () => {
        if (!selectedChatId || !inputMessage.trim()) return;

        const tempId = 'temp-' + Date.now();
        const tempMsg = { role: 'agent', text: inputMessage, id: tempId };
        setMessages(prev => [...prev, tempMsg]);
        setInputMessage("");

        try {
            const res = await fetch(`/api/chats/${selectedChatId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: tempMsg.text })
            });

            if (!res.ok) {
                const data = await parseApiJson<{ error?: string }>(res);
                throw new Error(data?.error || "No se pudo enviar el mensaje");
            }

            toast.success("Mensaje enviado");
            // El polling actualizará el mensaje real
        } catch (error: any) {
            console.error("Error sending message", error);
            // Si falla, quitamos el mensaje optimista para evitar inconsistencias.
            setMessages(prev => prev.filter((m) => m.id !== tempId));
            setInputMessage(tempMsg.text);
            toast.error(error?.message || "No se pudo enviar el mensaje");
        }
    };

    const handleTakeControl = async () => {
        if (!selectedChatId || isTakingControl) return;

        setIsTakingControl(true);
        try {
            const takeControlPromise = fetch(`/api/chats/${selectedChatId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIVE" }),
            }).then(async (res) => {
                if (!res.ok) {
                    const data = await parseApiJson<{ error?: string }>(res);
                    throw new Error(data?.error || "No se pudo tomar control de la conversación");
                }
                return res;
            });

            await toast.promise(takeControlPromise, {
                loading: "Tomando control de la conversación...",
                success: "Tomaste control de la conversación",
                error: (err) => err?.message || "No se pudo tomar control de la conversación",
            });

            setChats((prev: any[]) =>
                prev.map((chat) =>
                    chat.id === selectedChatId ? { ...chat, status: "active" } : chat,
                ),
            );
        } catch (error) {
            console.error("Error taking control", error);
        } finally {
            setIsTakingControl(false);
        }
    };

    const filteredChats = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return chats.filter((chat) => {
            const matchesStatus = statusFilter === "all" ? true : chat.status === statusFilter;
            if (!matchesStatus) return false;

            if (!query) return true;

            const haystack = `${chat.name || ""} ${chat.phone || ""} ${chat.preview || ""}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [chats, searchQuery, statusFilter]);

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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter("active")}
                                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md border transition-colors ${statusFilter === "active" ? "bg-blue-500/15 border-blue-500/30" : "bg-white/5 hover:bg-white/10 border-white/5"}`}
                            >
                                <i className="w-2 h-2 rounded-full bg-blue-500 not-italic" aria-hidden="true" /> Active
                            </button>
                            <button
                                onClick={() => setStatusFilter("handoff")}
                                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md border transition-colors ${statusFilter === "handoff" ? "bg-amber-500/15 border-amber-500/30" : "bg-white/5 hover:bg-white/10 border-white/5"}`}
                            >
                                <i className="w-2 h-2 rounded-full bg-amber-500 not-italic" aria-hidden="true" /> Handoff
                            </button>
                        </div>
                        <button
                            onClick={() => setStatusFilter("all")}
                            className="mt-2 w-full text-[11px] text-white/60 hover:text-white/80 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedChatId === chat.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-white/10 to-white/5 flex items-center justify-center font-bold text-xs uppercase text-white/70 shadow-inner">
                                            {chat.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-sm text-white/90 truncate max-w-30">{chat.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white/40 whitespace-nowrap">{chat.time}</span>
                                </div>
                                <div className="pl-10">
                                    <p className="text-xs text-white/60 truncate pr-6">{chat.preview}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {chat.source === 'whatsapp' && <Smartphone className="w-3 h-3 text-emerald-400" />}
                                        {chat.source === 'instagram' && <Camera className="w-3 h-3 text-rose-400" />}
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
                                        <button
                                            onClick={handleTakeControl}
                                            disabled={isTakingControl}
                                            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            {isTakingControl ? "Tomando control..." : "Tomar Control (Handoff)"}
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
                                                    : 'bg-linear-to-tr from-blue-600 to-purple-600 text-white rounded-br-none shadow-md shadow-purple-500/10'
                                                    }`}>
                                                    {msg.text}
                                                </div>

                                                {msg.role === 'agent' && (
                                                    <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
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
                                            <i className="w-1.5 h-1.5 bg-emerald-400 rounded-full not-italic" aria-hidden="true" /> IA pensando respuesta...
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
