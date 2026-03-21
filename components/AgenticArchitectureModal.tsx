"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Workflow, Database, Brain, MessageSquareText, Shield } from "lucide-react";

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
};

const pillars = [
  {
    icon: <Workflow className="w-5 h-5 text-blue-300" />,
    title: "Orquestacion agentica",
    detail:
      "Coordinamos pasos de analisis, decision y respuesta para que el agente actue con contexto real del negocio.",
  },
  {
    icon: <Database className="w-5 h-5 text-purple-300" />,
    title: "Memoria y conocimiento",
    detail:
      "Ingerimos documentos, menus y archivos para construir una base consultable que evita respuestas inventadas.",
  },
  {
    icon: <Brain className="w-5 h-5 text-emerald-300" />,
    title: "RAG orientado a precision",
    detail:
      "Antes de responder, el sistema recupera fragmentos relevantes para fundamentar cada salida del agente.",
  },
  {
    icon: <MessageSquareText className="w-5 h-5 text-cyan-300" />,
    title: "Accion en tiempo real",
    detail:
      "El agente responde, agenda y deriva conversaciones al humano cuando el caso requiere mayor criterio.",
  },
  {
    icon: <Shield className="w-5 h-5 text-amber-300" />,
    title: "Control y trazabilidad",
    detail:
      "Incluimos validaciones y rutas de fallback para mantener calidad operativa y supervision del negocio.",
  },
];

export function AgenticArchitectureModal({ isOpen, onCloseAction }: Props) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCloseAction}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0b0b0d] text-white max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-6 border-b border-white/10 bg-[#0b0b0d]">
              <div>
                <h3 className="text-2xl font-semibold">Arquitectura Agentica de brainia</h3>
                <p className="text-sm text-white/60 mt-2">
                  Lo que hay detras del agente para responder con contexto, ejecutar tareas y escalar atencion sin perder control.
                </p>
              </div>
              <button
                onClick={onCloseAction}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid gap-4 md:grid-cols-2">
              {pillars.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <h4 className="font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


