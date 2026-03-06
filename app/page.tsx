"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MagicBox from "../components/onboarding/MagicBox";
import ParticleBackground from "../components/ui/ParticleBackground";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Zap, Sparkles as SparklesIcon, Command, Cloud, Hexagon, Activity, Triangle } from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    const loadingPhrases = [
        "Analizando tu modelo de negocio...",
        "Entrenando motor de lenguaje...",
        "Generando base de conocimiento...",
        "Configurando respuestas de ventas...",
        "Afinando últimos detalles...",
        "Preparando tu Agente...",
    ];

    useEffect(() => {
        if (searchParams.get('demo') === 'true') {
            setIsDemoOpen(true);
        }
    }, [searchParams]);

    const handleCloseDemo = () => {
        window.history.pushState({}, '', '/');
        setIsDemoOpen(false);
    };

    const handleMagicSubmit = async (description: string) => {
        setLoading(true);
        setLoadingPhraseIndex(0);

        const phraseInterval = setInterval(() => {
            setLoadingPhraseIndex((prev) => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
        }, 1800);

        try {
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ownerDescription: description }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la descripción");
            }
            const newAgent = data.data;
            newAgent.id = Date.now().toString();
            // Generar métricas aleatorias para simular diferentes consumos
            newAgent.metrics = {
                conversations: Math.floor(Math.random() * 5000) + 150,
                tasksAutomated: Math.floor(Math.random() * 3000) + 80,
                savedTime: Math.floor(Math.random() * 400) + 20
            };

            const existingAgentsStr = localStorage.getItem("agenty_agents");
            const agentsArray = existingAgentsStr ? JSON.parse(existingAgentsStr) : [];
            agentsArray.push(newAgent);

            localStorage.setItem("agenty_agents", JSON.stringify(agentsArray));
            localStorage.setItem("agenty_active_agent_id", newAgent.id);
            localStorage.setItem("agenty_config", JSON.stringify(newAgent));

            clearInterval(phraseInterval);
            setLoading(false);
            router.push("/dashboard/builder");
        } catch (error) {
            console.error("Error:", error);
            toast.error(error instanceof Error ? error.message : "Hubo un error al procesar tu descripción.");
            clearInterval(phraseInterval);
            setLoading(false);
        }
    };

    return (
        <>
            <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
                <div className="aurora-bg" />
                <ParticleBackground />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 max-w-3xl relative z-10"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
                        Tu fuerza laboral <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Autónoma</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
                        Entrena un Agente de IA experto en tu negocio en segundos. Solo describe lo que haces.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative z-10 w-full"
                >
                    <MagicBox onSubmit={handleMagicSubmit} isLoading={loading} />

                    {/* Trust Badges - Social Proof MVP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-white/40 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-400/70" />
                            <span>Privacidad de datos garantizada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-amber-400/70" />
                            <span>Potenciado por GPT-4o & Claude 3.5</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6 text-white/30 text-xs md:text-sm font-medium uppercase tracking-widest relative z-10"
                >
                    <span>Fast setup</span>
                    <span className="hidden md:inline">•</span>
                    <span>AI Native</span>
                    <span className="hidden md:inline">•</span>
                    <span>Omnichannel</span>
                </motion.div>

                {/* Logo Cloud Preview */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-24 w-full max-w-5xl mx-auto relative z-10 border-t border-white/5 pt-10"
                >
                    <p className="text-center text-sm text-white/30 mb-8 font-semibold uppercase tracking-widest">
                        Startups que automatizan con nosotros
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-2 font-bold text-2xl text-white"><Command size={28} /> Acme</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-white"><Cloud size={28} /> Nimbus</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-white"><Hexagon size={28} /> Nexa</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-white"><Activity size={28} /> Pulse</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-white"><Triangle size={28} /> Vertex</div>
                    </div>
                </motion.div>

                {loading && (
                    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-700">
                        <div className="max-w-md w-full px-6 flex flex-col items-center">
                            {/* Minimal Elegant Spinner */}
                            <div className="relative w-12 h-12 mb-8 flex justify-center items-center">
                                <motion.div
                                    className="absolute w-full h-full border border-white/20 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/50 to-purple-500/50 blur-sm"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <SparklesIcon size={16} className="text-white relative z-10" />
                            </div>

                            {/* Crisp Text Transition */}
                            <div className="h-10 relative w-full flex justify-center items-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={loadingPhraseIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="text-lg md:text-xl text-white/90 font-light tracking-wide absolute text-center w-full"
                                    >
                                        {loadingPhrases[loadingPhraseIndex]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {isDemoOpen && <InteractiveDemo onClose={handleCloseDemo} />}
        </>
    );
}
