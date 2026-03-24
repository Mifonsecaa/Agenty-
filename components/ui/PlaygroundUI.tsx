"use client";
import React from 'react';
import { Bot, Send, User, Trash2, X } from 'lucide-react';
import i18n from './i18n';
import { usePlayground } from '@/components/PlaygroundContext';
import { useBrainia } from '@/context/BrainiaContext';

type Message = { role: string; text: string };

export default function PlaygroundUI() {
  const { isOpen, messages, isTyping, input, setInput, clearHistory, close, testAgentId, setTestAgentId, sendMessage } = usePlayground();
  const { activeAgent } = useBrainia();
  const agentName = activeAgent?.name || null;

  // Show the test-agent input only if there's no activeAgent and no saved testAgentId
  const showTestAgentInput = !activeAgent && !testAgentId;

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 right-0 left-0 bottom-0 top-0 lg:top-20 lg:right-4 lg:left-auto lg:bottom-auto lg:w-105 lg:h-[80vh]">
      <div className="h-full bg-black border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#111111] border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate max-w-[160px]">{agentName ? (String(agentName).length > 24 ? `${String(agentName).slice(0,20)}...` : agentName) : 'Playground'}</p>
              <p className="text-[10px] text-emerald-400">{i18n.onlineLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showTestAgentInput && (
              <div className="hidden sm:flex items-center gap-2">
                <input
                  className="bg-transparent border border-white/10 px-2 py-1 rounded text-xs text-white/80 w-36"
                  placeholder="Test agent id (opcional)"
                  value={testAgentId ?? ''}
                  onChange={(e) => setTestAgentId(e.target.value || null)}
                />
              </div>
            )}
            <button onClick={clearHistory} title={i18n.clearHistory} className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/5">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={close} title={i18n.closeButton} className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-linear-to-tr from-blue-500 to-purple-500'}`}>
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

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[85%] flex-row">
                <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 text-white/90 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-3 bg-[#111111] border-t border-white/10">
            <div className="flex relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={i18n.placeholder}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {/* Test agent input moved to header to avoid overlap; no absolute input here */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4 text-white -ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

