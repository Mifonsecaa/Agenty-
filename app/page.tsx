"use client";
import { useState, Suspense, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MagicBox from "../components/onboarding/MagicBox";
import { AgenticArchitectureModal } from "@/components/AgenticArchitectureModal";
import { SearchParamsHandler } from "@/components/SearchParamsHandler";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Zap, Sparkles as SparklesIcon, Command, Cloud, Hexagon, Activity, Triangle, PlayCircle, MessageSquare, Clock, Users, Bot } from "lucide-react";

const ParticleBackground = dynamic(() => import("../components/ui/ParticleBackground"), {
    ssr: false,
});

const InteractiveDemo = dynamic(
    () => import("@/components/InteractiveDemo").then((mod) => mod.InteractiveDemo),
    { ssr: false },
);

export default function HomePage() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const [hasHydrated, setHasHydrated] = useState(false);
    const reduceMotionSafe = hasHydrated && Boolean(shouldReduceMotion);
    // Search params moved to SearchParamsHandler
    const [loading, setLoading] = useState(false);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    const loadingPhrases = [
        "Analizando tu modelo de negocio...",
        "Entrenando motor de lenguaje...",
        "Generando base de conocimiento...",
        "Configurando respuestas de ventas...",
        "Afinando últimos detalles...",
        "Preparando tu Agente...",
    ];

    const handleSetIsDemoOpen = useCallback((val: boolean) => {
        setIsDemoOpen(val);
    }, []);

    const handleCloseDemo = () => {
        window.history.pushState({}, '', '/');
        setIsDemoOpen(false);
    };

    const handleOpenDemo = () => {
        setIsDemoOpen(true);
    };

    const handleOpenArchitecture = () => {
        setIsArchitectureOpen(true);
    };

    const handleCloseArchitecture = () => {
        setIsArchitectureOpen(false);
    };

    const handleMagicSubmit = async (description: string, files?: File[]) => {
        setLoading(true);
        setLoadingPhraseIndex(0);

        const phraseInterval = setInterval(() => {
            setLoadingPhraseIndex((prev) => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
        }, 1800);

        try {
            // --- ¡CAMBIO AQUÍ! ---
            // Guardamos el contexto del negocio para que la demo lo pueda usar.
            localStorage.setItem("business_context", description);

            let body: any;
            const headers: any = {};

            if (files && files.length > 0) {
                 const formData = new FormData();
                 formData.append("ownerDescription", description);
                 files.forEach(file => formData.append("files", file));
                 
                 body = formData;
                 // Don't set Content-Type header when using FormData, let browser set boundary
            } else {
                 body = JSON.stringify({ ownerDescription: description });
                 headers["Content-Type"] = "application/json";
            }

            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: headers,
                body: body,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la descripción");
            }
            // Check if business is in data.data or directly in data
            const newAgent = data.data?.business || data.business;
            
            if (!newAgent) {
               throw new Error("No se pudo crear el agente: Respuesta inválida del servidor");
            }
            
            // Si el backend devuelve el ID, lo usamos. Si no, generamos uno temporal (fallback raro)
            if (!newAgent.id) {
                newAgent.id = Date.now().toString();
            }
            
            // Generar métricas iniciales para demo si no vienen
            if (!newAgent.metrics) {
                newAgent.metrics = {
                    conversations: 0,
                    tasksAutomated: 0,
                    savedTime: 0
                };
            }

            const existingAgentsStr = localStorage.getItem("brainia_agents");
            const agentsArray = existingAgentsStr ? JSON.parse(existingAgentsStr) : [];
            agentsArray.push(newAgent);

            localStorage.setItem("brainia_agents", JSON.stringify(agentsArray));
            localStorage.setItem("brainia_active_agent_id", newAgent.id);
            localStorage.setItem("brainia_config", JSON.stringify(newAgent));

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
        <MotionConfig reducedMotion="user">
            <Suspense fallback={null}>
                <SearchParamsHandler onDemoOpen={handleSetIsDemoOpen} />
            </Suspense>
            <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-12 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">

                <div className="aurora-bg dark:opacity-100 opacity-30" />
                <ParticleBackground />

                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 max-w-3xl relative z-10 pt-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
                        Tu fuerza laboral <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Autónoma</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-white/50 font-light leading-relaxed mb-8">
                        Entrena un Agente de IA experto en tu negocio en segundos. Solo describe lo que haces.
                    </p>
                    
                    <button 
                        onClick={handleOpenDemo}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white font-medium transition-all hover:scale-105 mb-8 group"
                    >
                        <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors" />
                        Probar Demo Interactiva
                    </button>
                </motion.div>

                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative z-10 w-full"
                >
                    <MagicBox onSubmit={handleMagicSubmit} isLoading={loading} />

                    {/* Trust Badges - Social Proof MVP */}
                    <motion.div
                        initial={reduceMotionSafe ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={reduceMotionSafe ? { duration: 0 } : { duration: 1, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-gray-500 dark:text-white/40 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400/70" />
                            <span>Privacidad de datos garantizada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-amber-500 dark:text-amber-400/70" />
                            <span>Potenciado por GPT-4o & Claude 3.5</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 1, delay: 0.6 }}
                    className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6 text-gray-400 dark:text-white/30 text-xs md:text-sm font-medium uppercase tracking-widest relative z-10"
                >
                    <span>Fast setup</span>
                    <span className="hidden md:inline">•</span>
                    <span>AI Native</span>
                    <span className="hidden md:inline">•</span>
                    <span>Omnichannel</span>
                </motion.div>
                
                {/* Features Section - BENTO BOX DESIGN */}
                <motion.div
                    id="features"
                    initial={reduceMotionSafe ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 0.8 }}
                    className="mt-32 w-full max-w-6xl relative z-10 px-4"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Automatiza sin perder el toque humano
                        </h2>
                        <p className="text-gray-600 dark:text-white/40 max-w-2xl mx-auto">
                            brainia se encarga del 80% de las consultas repetitivas, permitiéndote enfocarte en lo que realmente importa: hacer crecer tu negocio.
                        </p>
                        <button
                            onClick={handleOpenArchitecture}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white/90 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                            Ver arquitectura agentica
                        </button>
                    </div>

                    {/* Bento Box Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[280px]">
                        
                        {/* Box 1 - Large (Respuestas Instantáneas) */}
                        <div className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-gray-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-colors group flex flex-col justify-between overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div>
                                <div className="mb-6 p-4 rounded-xl bg-blue-100 dark:bg-blue-500/10 w-fit group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Respuestas Instantáneas 24/7</h3>
                                <p className="text-gray-600 dark:text-white/50 leading-relaxed max-w-md">
                                    Tu agente entiende el contexto y responde dudas sobre precios, horarios y servicios en segundos, sin importar la hora del día. Nunca dejes a un cliente esperando.
                                </p>
                            </div>
                            <div className="mt-8 flex-1 w-full bg-white dark:bg-black/40 rounded-t-xl border-t border-x border-black/5 dark:border-white/10 p-4 relative translate-y-8 group-hover:translate-y-2 transition-transform duration-500 shadow-xl">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                                    <div className="bg-gray-100 dark:bg-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700 dark:text-gray-300">
                                        ¿Tienen disponibilidad para mañana a las 3pm?
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-white"/></div>
                                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-sm">
                                        ¡Hola! Sí, tenemos un espacio disponible mañana a las 3:00 PM. ¿Te gustaría que lo reserve a tu nombre?
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2 - Medium (Agendamiento) */}
                        <div className="md:col-span-2 p-8 rounded-3xl bg-gray-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="mb-6 p-4 rounded-xl bg-purple-100 dark:bg-purple-500/10 w-fit group-hover:scale-110 transition-transform">
                                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Agendamiento Automático</h3>
                            <p className="text-gray-600 dark:text-white/50 leading-relaxed text-sm">
                                Gestiona reservas y citas directamente en el chat. El agente sincroniza con tu calendario y evita conflictos sin intervención humana.
                            </p>
                        </div>

                        {/* Box 3 - Small (Handoff) */}
                        <div className="md:col-span-1 p-8 rounded-3xl bg-gray-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-colors group relative overflow-hidden flex flex-col justify-center items-center text-center">
                            <div className="mb-4 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 w-fit group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Handoff Inteligente</h3>
                            <p className="text-gray-600 dark:text-white/50 leading-relaxed text-xs">
                                Transferencia automática a un humano si el agente no sabe la respuesta.
                            </p>
                        </div>

                        {/* Box 4 - Small (Multicanal) */}
                        <div className="md:col-span-1 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 border border-transparent hover:shadow-lg hover:shadow-purple-500/20 transition-all group relative overflow-hidden flex flex-col justify-center items-center text-center">
                            <SparklesIcon className="w-10 h-10 text-white mb-4 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-lg font-bold text-white mb-2">Soporte Omnicanal</h3>
                            <p className="text-white/80 leading-relaxed text-xs">
                                WhatsApp, Instagram, Web y más. Un solo cerebro para todos tus canales.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Logo Cloud Preview */}
                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 1, delay: 1 }}
                    className="mt-24 w-full max-w-5xl mx-auto relative z-10 pt-10"
                >
                    <p className="text-center text-sm text-gray-500 dark:text-white/30 mb-8 font-semibold uppercase tracking-widest">
                        Startups que automatizan con nosotros
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white"><Command size={28} /> Acme</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white"><Cloud size={28} /> Nimbus</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white"><Hexagon size={28} /> Nexa</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white"><Activity size={28} /> Pulse</div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white"><Triangle size={28} /> Vertex</div>
                    </div>
                </motion.div>

                {loading && (
                    <div className="fixed inset-0 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-700">
                        <div className="max-w-md w-full px-6 flex flex-col items-center">
                            {/* Minimal Elegant Spinner */}
                            <div className="relative w-12 h-12 mb-8 flex justify-center items-center">
                                <motion.div
                                    className="absolute w-full h-full border border-black/20 dark:border-white/20 rounded-full"
                                    animate={reduceMotionSafe ? { rotate: 0 } : { rotate: 360 }}
                                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/50 to-purple-500/50 blur-sm"
                                    animate={reduceMotionSafe ? { scale: 1, opacity: 0.6 } : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <SparklesIcon size={16} className="text-black dark:text-white relative z-10" />
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
                                        className="text-lg md:text-xl text-gray-900 dark:text-white/90 font-light tracking-wide absolute text-center w-full"
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
            <AgenticArchitectureModal isOpen={isArchitectureOpen} onCloseAction={handleCloseArchitecture} />
        </MotionConfig>
    );
}
