"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de logging
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg shadow-2xl shadow-red-500/5"
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Ups! Algo salió mal
        </h2>
        
        <p className="text-white/60 mb-8 leading-relaxed">
          No pudimos cargar esta parte del dashboard. Puede ser un problema temporal de conexión o un error inesperado.
          {process.env.NODE_ENV === "development" && (
            <span className="block mt-4 p-3 bg-red-950/50 rounded-lg text-red-200 text-xs font-mono break-all text-left border border-red-500/10">
              Error técnico: {error.message}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 active:scale-95 duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 font-medium rounded-xl hover:bg-white/10 transition-colors active:scale-95 duration-200"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

