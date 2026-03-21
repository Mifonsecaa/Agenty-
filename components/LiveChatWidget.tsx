"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LiveChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
        // Initial bot message
        setMessages([
            { role: 'bot', text: '¡Hola! Soy Brainia, el agente de IA de esta plataforma. ¿En qué te puedo ayudar hoy?' }
        ]);
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user' as const, text: inputValue }];
        setMessages(newMessages);
        setInputValue("");

        // Simulate bot typing
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: 'Esta es una respuesta de prueba del widget de chat. En producción, esto se conectaría a tu agente de IA real.' }
            ]);
        }, 1000);
    };

    if (!hasHydrated) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">Brainia AI</h3>
                                    <p className="text-white/70 text-xs">Soporte Automático</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50 dark:bg-transparent">
                            {messages.map((msg, i) => (
                                <div 
                                    key={i} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                                : 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Escribe tu mensaje..."
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none transition-colors"
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors flex-shrink-0"
                                >
                                    <Send size={16} className="ml-1" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                    isOpen 
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-300 dark:hover:bg-white/20' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25'
                }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
};
