"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type TaskStatus = 'pending' | 'in_progress' | 'completed';

const TASKS = [
  { id: 'saludo', text: 'Saludo informativo' },
  { id: 'buscando_reserva', text: 'Buscando disponibilidad' },
  { id: 'registro_db', text: 'Registro de reserva en BD' },
  { id: 'reserva_realizada', text: 'Reserva confirmada' },
  { id: 'confirmacion_enviada', text: 'Mensaje de confirmación enviado' },
];

const aiResponses = [
  "Perfecto. Estoy buscando disponibilidad... Un momento por favor.",
  "¡Buenas noticias! Tenemos una mesa libre. ¿A qué hora les gustaría venir?",
  "Excelente. ¿A nombre de quién hago la reserva?",
  "¡Listo, David! Tu mesa para 2 personas a las 8:00 PM está confirmada. Te enviaremos un mensaje de confirmación en breve.",
  "Gracias por usar el asistente de Agenty. ¡Que disfrutes tu cena!"
];

export const InteractiveDemo = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: '¡Hola! Bienvenido al asistente de reservas de Agenty. ¿Para cuántas personas te gustaría reservar?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [taskState, setTaskState] = useState<Record<string, TaskStatus>>({
    saludo: 'completed',
    buscando_reserva: 'pending',
    registro_db: 'pending',
    reserva_realizada: 'pending',
    confirmacion_enviada: 'pending',
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateTaskStatus = (updates: Record<string, TaskStatus>) => {
    setTaskState(prev => ({ ...prev, ...updates }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    // --- Lógica de la Conversación Simulada ---
    setTimeout(() => {
      switch (conversationStep) {
        case 0: // Buscando disponibilidad
          updateTaskStatus({ buscando_reserva: 'in_progress' });
          setMessages(prev => [...prev, { sender: 'ai', text: aiResponses[0] }]);
          setTimeout(() => {
            updateTaskStatus({ buscando_reserva: 'completed' });
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponses[1] }]);
            setConversationStep(1);
            setIsLoading(false);
          }, 2000); // Simula la demora de la búsqueda
          break;
        case 1: // Pidiendo nombre
          setMessages(prev => [...prev, { sender: 'ai', text: aiResponses[2] }]);
          setConversationStep(2);
          setIsLoading(false);
          break;
        case 2: // Confirmando reserva
          updateTaskStatus({ registro_db: 'in_progress' });
          setTimeout(() => {
            updateTaskStatus({ registro_db: 'completed', reserva_realizada: 'completed' });
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponses[3] }]);
            setTimeout(() => {
              updateTaskStatus({ confirmacion_enviada: 'completed' });
              setMessages(prev => [...prev, { sender: 'ai', text: aiResponses[4] }]);
              setConversationStep(3);
              setIsLoading(false);
            }, 1500);
          }, 1000);
          break;
        default: // Fin de la conversación
          setIsLoading(false);
          break;
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors bg-white/5 p-1 rounded-lg">
          <X size={20} />
        </button>
        <div className="px-6 py-4 border-b border-white/10 bg-[#111111]">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Prueba Interactiva <span className="text-emerald-400 text-sm font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Live</span>
          </h2>
        </div>
        <div className="flex-grow flex overflow-hidden">
          {/* Columna de Chat */}
          <div className="w-2/3 flex flex-col p-6 border-r border-white/10">
            <div className="flex-grow overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 text-sm shadow-sm ${msg.sender === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-white/90 rounded-2xl rounded-br-none'
                      : 'bg-white/10 text-white/90 rounded-2xl rounded-bl-none border border-white/5'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-white/10 flex gap-3 relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Prueba interactuar con el agente..."
                className="flex-grow bg-[#111111] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/30"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isLoading}
              >
                Enviar
              </button>
            </form>
          </div>
          {/* Columna de Tareas */}
          <div className="w-1/3 p-6 bg-[#050505]">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-6">Estado del Proceso</h3>
            <ul className="space-y-4">
              {TASKS.map(task => (
                <li key={task.id} className="flex items-center text-sm">
                  {taskState[task.id] === 'completed' && <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 mr-3 shadow-sm shadow-emerald-500/10">✓</div>}
                  {taskState[task.id] === 'in_progress' && <div className="w-6 h-6 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin mr-3"></div>}
                  {taskState[task.id] === 'pending' && <div className="w-6 h-6 rounded-full border border-white/20 bg-white/5 mr-3"></div>}
                  <span className={`${taskState[task.id] === 'completed' ? 'text-white' : taskState[task.id] === 'in_progress' ? 'text-yellow-400 font-medium' : 'text-white/40'}`}>
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
