"use client";
import { useState, useEffect } from "react";
import { Search, MoreVertical, PauseCircle, Send, Users, CheckCircle } from "lucide-react";

export default function Inbox() {
    const [takeover, setTakeover] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);

    // Lista de mensajes dinámicos
    const [conversation, setConversation] = useState([
        { id: 1, role: "user", text: "Hola, compré unos zapatos ayer pero me quedaron pequeños. ¿Hacen cambios?", time: "10:40 AM" },
        { id: 2, role: "ai", text: "¡Hola Juan! Claro que sí. Tienes 30 días para cambios. ¿Qué talla necesitas para revisar el inventario? 👟", time: "10:40 AM" },
        { id: 3, role: "user", text: "Necesito talla 42 pero la verdad me enoja porque en la página decía que la horma era grande. Necesito un reembolso, no un cambio.", time: "10:42 AM" },
        { id: 4, role: "system", text: "⚠️ El cliente solicitó un reembolso. Notificando a un humano.", time: "10:42 AM" }
    ]);

    const [chats, setChats] = useState([
        {
            id: 1,
            clientMatch: "Cliente Muestra",
            lastMessage: "Hola, ¿Cómo estás?",
            time: "10:42 AM"
        }
    ]);

    useEffect(() => {
        const savedConfig = localStorage.getItem("agenty_config");
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.fakeChats && config.fakeChats.length > 0) {
                    setChats(config.fakeChats);
                }
            } catch (e) {
                console.error("Error parsing config", e);
            }
        }
    }, []);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            role: takeover ? "human" : "user", // Si el humano tiene el control, envía como humano. Si no, simulamos que es el cliente respondiendo.
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversation(prev => [...prev, newMessage]);
        setInputValue("");

        // Si la IA tiene el control y nosotros simulamos mandar un mensaje como usuario, la IA responde sola.
        if (!takeover && newMessage.role === "user") {
            setIsAiTyping(true);
            setTimeout(() => {
                setConversation(prev => [...prev, {
                    id: Date.now() + 1,
                    role: "ai",
                    text: "Por supuesto, entiendo completamente. Déjame revisar nuestro sistema para procesar tu solicitud inmediatamente.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                setIsAiTyping(false);
            }, 2500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="h-full flex flex-col relative z-10">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Live Inbox <Users className="w-6 h-6 text-emerald-400" />
                    </h1>
                    <p className="text-white/60">Supervisa las conversaciones de tu agente y toma el control si es necesario.</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Left Column: Client List */}
                <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Buscar cliente o número..."
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Render Dynamic Chats */}
                        {chats.map((chat, index) => (
                            <div key={chat.id} className={`p-4 cursor-pointer transition-colors ${index === 0 ? 'bg-white/10 border-l-2 border-blue-500 hover:bg-white/15' : 'border-b border-white/5 hover:bg-white/5'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm">{chat.clientMatch}</span>
                                    <span className="text-[10px] text-white/40">{chat.time}</span>
                                </div>
                                <p className="text-xs text-white/60 truncate">{chat.lastMessage}</p>
                                <div className="flex mt-2 gap-2">
                                    {index === 0 ? (
                                        <span className="bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Urgente</span>
                                    ) : (
                                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 uppercase">
                                            <CheckCircle className="w-3 h-3" /> Resuelto
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Chat Window */}
                <div className="col-span-1 lg:col-span-2 bg-black border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">

                    {/* Header */}
                    <div className="bg-[#111111] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-500 to-stone-700 flex items-center justify-center font-bold text-lg">
                                J
                            </div>
                            <div>
                                <p className="font-semibold">Juan Pérez (+57 300 123 4567)</p>
                                {takeover ? (
                                    <p className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                                        <PauseCircle className="w-3 h-3" /> <span>Agente Pausado. Estás respondiendo tú.</span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Agente AI manejando la conversación</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setTakeover(!takeover)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${takeover
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:bg-orange-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <PauseCircle className="w-4 h-4" />
                                {takeover ? "Reactivar IA" : "Pausar IA (Takeover)"}
                            </button>
                            <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0a0a]">

                        {conversation.map((msg) => {
                            if (msg.role === "system") {
                                return (
                                    <div key={msg.id} className="flex justify-center my-6">
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-full font-medium shadow-sm">
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            const isOwnEntity = msg.role === "ai" || msg.role === "human"; // Derecha

                            return (
                                <div key={msg.id} className={`flex ${isOwnEntity ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm relative ${msg.role === "ai"
                                        ? "bg-blue-600/20 border border-blue-500/30 text-white/90 rounded-br-none"
                                        : msg.role === "human"
                                            ? "bg-orange-600/20 border border-orange-500/30 text-white/90 rounded-br-none"
                                            : "bg-white/10 text-white/90 rounded-bl-none border border-white/5"
                                        }`}>

                                        {msg.role === "ai" && (
                                            <div className="absolute -top-2.5 -right-2 bg-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                                                AI Respondió
                                            </div>
                                        )}
                                        {msg.role === "human" && (
                                            <div className="absolute -top-2.5 -right-2 bg-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded text-white tracking-widest uppercase flex items-center gap-1">
                                                Tú <CheckCircle className="w-2 h-2" />
                                            </div>
                                        )}

                                        {msg.text}

                                        <p className={`text-[10px] text-right mt-1 ${isOwnEntity ? 'text-white/40' : 'text-white/40'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {isAiTyping && (
                            <div className="flex justify-end">
                                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-blue-600/10 border border-blue-500/20 text-white/90 rounded-br-none shadow-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Input Area */}
                    <div className={`p-4 border-t transition-colors ${takeover ? 'bg-orange-950/20 border-orange-500/20' : 'bg-[#111111] border-white/10'}`}>
                        <div className="flex relative items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={takeover ? "Escribe un mensaje como humano..." : "Escribe como cliente para probar la IA (o Pausa IA para tomar control)"}
                                className={`w-full rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none transition-colors border ${takeover
                                    ? 'bg-[#0a0a0a] border-orange-500/30 text-white placeholder-white/40 focus:border-orange-500'
                                    : 'bg-[#0a0a0a] border-white/10 text-white placeholder-white/40 focus:border-blue-500/50'
                                    }`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className={`absolute right-2 top-1.5 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${inputValue.trim()
                                    ? takeover
                                        ? 'bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/20 opacity-100 text-black'
                                        : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 opacity-100 text-white'
                                    : 'bg-white/10 opacity-50 cursor-not-allowed text-white/40'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        {takeover && (
                            <p className="text-[10px] text-orange-400/80 mt-2 ml-1">
                                Envía este mensaje por WhatsApp a nombre de tu negocio.
                            </p>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
