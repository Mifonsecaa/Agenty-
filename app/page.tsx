"use client";
import { useState } from "react";
import MagicBox from "../components/onboarding/MagicBox"; // Asegúrate de que esta ruta sea correcta

export default function HomePage() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleMagicSubmit = async (description: string) => {
        setLoading(true);
        try {
            // Simulamos la creación del agente
            setTimeout(() => {
                console.log("Texto enviado:", description);
                setLoading(false);
                setStep(2);
            }, 2000);
        } catch (error) {
            alert("Hubo un error al generar el agente.");
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent" />

            {/* Aurora effect improved */}
            <div className="aurora-bg opacity-70" />

            {/* Glowing orb behind the MagicBox */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">
                        Build something{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-pulse-slow">
                            Lovable
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
                        Crea tu agente de automatización describiendo tu negocio con IA
                    </p>
                </div>

                {/* La Caja Mágica */}
                <div className="w-full relative">
                    <MagicBox onSubmit={handleMagicSubmit} isLoading={loading} />
                </div>

                {/* Footer sutil */}
                <div className="mt-20 flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/30 text-xs sm:text-sm font-medium uppercase tracking-[0.2em]">
                    <span className="hover:text-white/60 transition-colors cursor-default">Fast setup</span>
                    <span className="hidden sm:inline text-white/10">•</span>
                    <span className="hover:text-white/60 transition-colors cursor-default">AI Native</span>
                    <span className="hidden sm:inline text-white/10">•</span>
                    <span className="hover:text-white/60 transition-colors cursor-default">Omnichannel</span>
                </div>
            </div>

            {/* Overlay de carga */}
            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-500">
                    <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 mb-8 group">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
                            <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-spin animation-delay-150" />
                            <div className="absolute inset-4 rounded-full border-t-2 border-white animate-spin animation-delay-300" />
                        </div>
                        <p className="text-white/80 font-medium tracking-wide animate-pulse text-lg">
                            Diseñando la inteligencia de tu negocio...
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
