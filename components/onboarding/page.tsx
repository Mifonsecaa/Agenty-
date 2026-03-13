"use client";
import { useState } from "react";
import MagicBox from "@/components/onboarding/MagicBox";

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleMagicSubmit = async (description: string, files?: File[]) => {
        setLoading(true);
        try {
            let body: any;
            const headers: any = {};

            if (files && files.length > 0) {
                 const formData = new FormData();
                 formData.append("ownerDescription", description);
                 files.forEach(file => formData.append("files", file));
                 
                 body = formData;
            } else {
                 body = JSON.stringify({ ownerDescription: description });
                 headers["Content-Type"] = "application/json";
            }

            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: headers,
                body: body,
            });

            const result = await response.json();
            if (result.success) {
                console.log("Configuración generada:", result.data);
                setStep(2); // Avanzar a la confirmación
            }
        } catch (error) {
            alert("Hubo un error configurando tu agente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center px-6">
            <div className="aurora-bg" />

            {/* Hero Section Estilo Linear */}
            <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                    Build something <span className="text-white/60">Lovable</span>
                </h1>
                <p className="text-xl text-white/40 font-light">
                    Crea tu agente de automatización describiendo tu negocio con IA
                </p>
            </div>

            {/* La Caja Mágica */}
            <MagicBox onSubmit={handleMagicSubmit} isLoading={loading} />

            {/* Footer sutil */}
            <div className="mt-12 flex gap-6 text-white/20 text-sm font-medium uppercase tracking-widest">
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