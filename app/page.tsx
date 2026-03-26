"use client";
import { useState, Suspense, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MagicBox from "../components/onboarding/MagicBox";
import { AgenticArchitectureModal } from "@/components/AgenticArchitectureModal";
import { SearchParamsHandler } from "@/components/SearchParamsHandler";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Zap, Sparkles as SparklesIcon, Command, Cloud, Hexagon, Activity, Triangle, PlayCircle, MessageSquare, Clock, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Inicializamos Supabase cliente
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
            // Guardamos el contexto del negocio para que la demo lo pueda usar.
            localStorage.setItem("business_context", description);

            const uploadedFiles = [];
            
            // Subir archivos directamente a Supabase para evitar el límite de 4.5MB de Vercel
            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        const prefijo = 'business/onboarding';
                        const nombreSeguro = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                        const rutaArchivo = `${prefijo}/${Date.now()}-${nombreSeguro}`;
                        
                        const { data, error } = await supabase.storage
                            .from('knowledge-files')
                            .upload(rutaArchivo, file, { cacheControl: '3600', upsert: false });
                            
                        if (error) {
                            console.error("Error subiendo archivo a Supabase:", error);
                            throw new Error(`Error al subir ${file.name}`);
                        }
                        
                        if (data) {
                            const { data: urlData } = supabase.storage
                                .from('knowledge-files')
                                .getPublicUrl(data.path);
                                
                            uploadedFiles.push({ 
                                name: file.name, 
                                type: file.type, 
                                url: urlData.publicUrl 
                            });
                        }
                    } catch (fileErr) {
                        console.error("Fallo al procesar archivo en frontend:", fileErr);
                    }
                }
            }

            const body = JSON.stringify({ 
                ownerDescription: description,
                uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined
            });

            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body,
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                throw new Error("Error en la respuesta del servidor (puede que el archivo sea demasiado grande o la sesión expiró).");
            }
            
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
            <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-12 overflow-hidden">

                <div className="aurora-bg" />
                <ParticleBackground />

                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 max-w-3xl relative z-10 pt-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
                        Tu fuerza laboral <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Autónoma</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed mb-8">
                        Entrena un Agente de IA experto en tu negocio en segundos. Solo describe lo que haces.
                    </p>
                    
                    <button 
                        onClick={handleOpenDemo}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all hover:scale-105 mb-8 group"
                    >
                        <PlayCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
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
                    initial={reduceMotionSafe ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 1, delay: 0.6 }}
                    className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6 text-white/30 text-xs md:text-sm font-medium uppercase tracking-widest relative z-10"
                >
                    <span>Fast setup</span>
                    <span className="hidden md:inline">•</span>
                    <span>AI Native</span>
                    <span className="hidden md:inline">•</span>
                    <span>Omnichannel</span>
                </motion.div>
                
                {/* Features Section */}
                <motion.div
                    id="features"
                    initial={reduceMotionSafe ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 0.8 }}
                    className="mt-32 w-full max-w-6xl relative z-10 px-4"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Automatiza sin perder el toque humano
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            brainia se encarga del 80% de las consultas repetitivas, permitiéndote enfocarte en lo que realmente importa: hacer crecer tu negocio.
                        </p>
                        <button
                            onClick={handleOpenArchitecture}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
                        >
                            Ver arquitectura agentica
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
                                title: "Respuestas Instantáneas",
                                desc: "Tu agente responde dudas sobre precios, horarios y servicios en segundos, 24/7."
                            },
                            {
                                icon: <Clock className="w-8 h-8 text-purple-400" />,
                                title: "Agendamiento Automático",
                                desc: "Gestiona reservas y citas directamente en el chat sin intervención humana."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-emerald-400" />,
                                title: "Handoff Inteligente",
                                desc: "Si el agente no sabe la respuesta, transfiere la conversación a un humano al instante."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Logo Cloud Preview */}
                <motion.div
                    initial={reduceMotionSafe ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 1, delay: 1 }}
                    className="mt-24 w-full max-w-5xl mx-auto relative z-10 pt-10"
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
                                    animate={reduceMotionSafe ? { rotate: 0 } : { rotate: 360 }}
                                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute w-8 h-8 rounded-full bg-linear-to-tr from-blue-500/50 to-purple-500/50 blur-sm"
                                    animate={reduceMotionSafe ? { scale: 1, opacity: 0.6 } : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={reduceMotionSafe ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
            <AgenticArchitectureModal isOpen={isArchitectureOpen} onCloseAction={handleCloseArchitecture} />
        </MotionConfig>
    );
}
