"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MagicBox from "../components/onboarding/MagicBox";
import ParticleBackground from "../components/ui/ParticleBackground"; // <-- Importamos el nuevo componente

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleMagicSubmit = async (description: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ownerDescription: description }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la descripción");
            }

            console.log("Configuración generada:", data.data);

            // Guardamos localmente para que el dashboard lo pueda leer
            localStorage.setItem("agenty_config", JSON.stringify(data.data));

            setLoading(false);

            // Redirigir al Agent Builder
            router.push("/dashboard/builder");

        } catch (error) {
            console.error("Error:", error);
            alert(error instanceof Error ? error.message : "Hubo un error al procesar tu descripción.");
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center px-6">
            {/* Nuestro fondo Aurora sigue estando atrás */}
            <div className="aurora-bg" />

            {/* Añadimos nuestro nuevo sistema de partículas interactivas */}
            <ParticleBackground />

            {/* Hero Section Estilo Linear (Le añadimos z-10 para que quede sobre las partículas) */}
            <div className="text-center mb-12 max-w-2xl relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                    Build something <span className="text-white/60">Haisonbel</span>
                </h1>
                <p className="text-xl text-white/40 font-light">
                    Crea tu agente de automatización describiendo tu negocio con IA
                </p>
            </div>

            {/* La Caja Mágica (z-10 para mantenerla adelante) */}
            <div className="relative z-10 w-full">
                <MagicBox onSubmit={handleMagicSubmit} isLoading={loading} />
            </div>

            {/* Footer sutil */}
            <div className="mt-12 flex gap-6 text-white/20 text-sm font-medium uppercase tracking-widest relative z-10">
                <span>Fast setup</span>
                <span>•</span>
                <span>AI Native</span>
                <span>•</span>
                <span>Omnichannel</span>
            </div>

            {/* Overlay de carga */}
            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4" />
                        <p className="text-white/60 animate-pulse">Agenty está configurando tu base de datos...</p>
                    </div>
                </div>
            )}
        </main>
    );
}