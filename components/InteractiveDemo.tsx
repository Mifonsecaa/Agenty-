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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700 text-center">Prueba Interactiva del Agente de Reservas</h2>
        <div className="flex-grow flex overflow-hidden">
          {/* Columna de Chat */}
          <div className="w-2/3 flex flex-col p-4 border-r border-gray-700">
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-2xl">
                    <span className="animate-pulse">...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-grow bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50" disabled={isLoading}>
                Enviar
              </button>
            </form>
          </div>
          {/* Columna de Tareas */}
          <div className="w-1/3 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estado del Proceso (Backend)</h3>
            <ul className="space-y-3">
              {TASKS.map(task => (
                <li key={task.id} className="flex items-center text-gray-300">
                  {taskState[task.id] === 'completed' && <span className="w-6 h-6 text-green-400">✔</span>}
                  {taskState[task.id] === 'in_progress' && <span className="w-6 h-6 text-yellow-400 animate-spin">⏳</span>}
                  {taskState[task.id] === 'pending' && <span className="w-6 h-6 text-gray-500">⚪</span>}
                  <span className="ml-3">{task.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
