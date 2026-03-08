"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};
type Provider = 'openai' | 'gemini';
type TaskStatus = 'pending' | 'in_progress' | 'completed';

const TASKS = [
  { id: 'start', text: 'Inicio de la conversación' },
  { id: 'context', text: 'Análisis del contexto del negocio' },
  { id: 'understanding', text: 'Comprensión de la petición del usuario' },
  { id: 'generation', text: 'Generación de respuesta de IA' },
  { id: 'response', text: 'Respuesta enviada' },
];

export const InteractiveDemo = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy AgentyBot 🤖, el experto en ventas de Agenty.ai. ¿Te gustaría saber cómo podemos automatizar la atención y reservas de tu negocio en WhatsApp? (O si prefieres, escribe el contexto de tu negocio a la derecha para probarme en vivo).' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [demoContext, setDemoContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('openai');
  const [taskState, setTaskState] = useState<Record<string, TaskStatus>>({
    start: 'completed',
    context: 'pending',
    understanding: 'pending',
    generation: 'pending',
    response: 'pending',
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    setTaskState(prev => ({ ...prev, context: 'in_progress', understanding: 'in_progress' }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, provider, isDemo: true, demoContext }),
      });

      setTaskState(prev => ({ ...prev, context: 'completed', understanding: 'completed', generation: 'in_progress' }));

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'La respuesta de la API no fue exitosa');

      setMessages(prev => [...prev, data]);
      setTaskState(prev => ({ ...prev, generation: 'completed', response: 'completed' }));

    } catch (error: any) {
      const errorMessage: Message = { role: 'assistant', content: `Error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
      setTaskState(prev => ({ ...prev, context: 'completed', understanding: 'completed', generation: 'completed', response: 'pending' }));
    } finally {
      setIsLoading(false);
      setTimeout(() => setTaskState(prev => ({ ...prev, understanding: 'pending', generation: 'pending', response: 'pending' })), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors bg-white/5 p-1 rounded-lg"><X size={20} /></button>
        <div className="px-6 py-3 border-b border-white/10 bg-[#111111] flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Prueba Interactiva <span className="text-emerald-400 text-sm font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Live</span>
          </h2>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button onClick={() => setProvider('openai')} className={`px-3 py-1 text-xs rounded-md transition-colors ${provider === 'openai' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>OpenAI</button>
            <button onClick={() => setProvider('gemini')} className={`px-3 py-1 text-xs rounded-md transition-colors ${provider === 'gemini' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>Gemini</button>
          </div>
        </div>
        <div className="flex-grow flex overflow-hidden">
          <div className="w-2/3 flex flex-col p-6 border-r border-white/10">
            <div className="flex-grow overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-white/90 rounded-2xl rounded-br-none' : 'bg-white/10 text-white/90 rounded-2xl rounded-bl-none border border-white/5'}`}>{msg.content}</div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start"><div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-white/10 flex gap-3 relative">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Prueba interactuar con el agente..." className="flex-grow bg-[#111111] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/30" disabled={isLoading} />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all" disabled={isLoading}>Enviar</button>
            </form>
          </div>
          <div className="w-1/3 p-6 bg-[#050505] flex flex-col h-full overflow-y-auto">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-6">Estado del Proceso</h3>
            <ul className="space-y-4 mb-8">
              {TASKS.map(task => (
                <li key={task.id} className="flex items-center text-sm">
                  {taskState[task.id] === 'completed' && <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 mr-3 shadow-sm shadow-emerald-500/10">✓</div>}
                  {taskState[task.id] === 'in_progress' && <div className="w-6 h-6 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin mr-3"></div>}
                  {taskState[task.id] === 'pending' && <div className="w-6 h-6 rounded-full border border-white/20 bg-white/5 mr-3"></div>}
                  <span className={`${taskState[task.id] === 'completed' ? 'text-white' : taskState[task.id] === 'in_progress' ? 'text-yellow-400 font-medium' : 'text-white/40'}`}>{task.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex-1 min-h-0 flex flex-col pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                ✨ Inyectar Contexto
              </h3>
              <p className="text-xs text-white/50 mb-3">
                Escribe a qué se dedica tu negocio aquí y envíale un mensaje al bot. ¡Verás cómo asume esa personalidad al instante!
              </p>
              <textarea
                value={demoContext}
                onChange={(e) => setDemoContext(e.target.value)}
                placeholder="Ej. Soy una clínica dental..."
                className="w-full flex-1 bg-[#111111] text-white rounded-xl px-3 py-3 text-sm border border-white/10 focus:outline-none focus:border-purple-500/50 transition-colors placeholder-white/30 resize-none min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
