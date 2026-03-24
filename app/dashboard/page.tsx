"use client";
import { useState, useEffect } from "react";
import { MessageSquare, ArrowUpRight, Zap, Users, CheckCircle2, ChevronRight, Settings, UploadCloud, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBrainia } from "@/context/BrainiaContext";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Inicializamos el cliente de Supabase FUERA del componente para no recrearlo en cada render
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardOverview() {
    const { activeAgent } = useBrainia();
    const [chartData, setChartData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        conversations: 0,
        tasksAutomated: 0,
        savedTime: 0
    });

    const [loading, setLoading] = useState(true);
    const [subiendo, setSubiendo] = useState(false); // Estado para el subidor de archivos

    useEffect(() => {
        if (!activeAgent?.id) {
            setLoading(false);
            return;
        }

        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/metrics?businessId=${activeAgent.id}&days=7`);
                const data = await res.json();
                if (data.success) {
                    setChartData(data.chartData);
                    setMetrics({
                        conversations: data.stats.conversations,
                        tasksAutomated: data.stats.tasksAutomated,
                        savedTime: Math.round(data.stats.tasksAutomated * 0.1)
                    });
                }
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [activeAgent]);

    const agentName = activeAgent?.name || "Asistente Virtual";

    // --- LÓGICA DE SUBIDA DIRECTA A SUPABASE (CON RASTREADORES) ---
    const manejarSubida = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("1. Función manejarSubida iniciada (Evento onChange disparado)");

        try {
            setSubiendo(true);

            const archivo = event.target.files?.[0];
            console.log("2. Archivo capturado:", archivo?.name, "| Tamaño:", archivo?.size, "bytes");

            if (!archivo) {
                console.warn("2.1. No se detectó ningún archivo en el input. Cancelando.");
                return;
            }

            // Sanitizamos el nombre y creamos la ruta
            const prefijo = activeAgent?.id ? `business/${activeAgent.id}` : 'business/unassigned';
            const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const rutaArchivo = `${prefijo}/${Date.now()}-${nombreSeguro}`;
            console.log("3. Ruta generada para Supabase:", rutaArchivo);

            // Subimos a Supabase
            console.log("4. Iniciando subida directa a Supabase...");
            const { data, error } = await supabase.storage
                .from('knowledge-files') // <-- Asegúrate de que este bucket exista y sea público
                .upload(rutaArchivo, archivo, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("4.1. Error DEVUELTO por Supabase:", error);
                throw error;
            }

            console.log("5. Subida exitosa a Supabase. Datos:", data);

            // Obtenemos la URL pública
            const { data: urlData } = supabase.storage
                .from('knowledge-files')
                .getPublicUrl(data.path);

            console.log("6. URL pública obtenida con éxito:", urlData.publicUrl);
            // Descomentar si quieres la alerta visual: alert("¡Documento subido a la nube! Registrando...");

            // 5. Enviar la URL a tu API avanzada
            console.log("7. Enviando petición POST a /api/knowledge-files...");
            const respuesta = await fetch('/api/knowledge-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: urlData.publicUrl, // Mandamos la URL mágica de Supabase
                    name: archivo.name,     // El nombre del archivo
                    type: archivo.type,     // El tipo (ej. application/pdf)
                    businessId: activeAgent?.id || ""
                })
            });

            console.log("8. Respuesta del servidor Vercel recibida. Status:", respuesta.status);

            if (!respuesta.ok) {
                const errorText = await respuesta.text();
                console.error("8.1. El backend de Vercel rechazó la URL. Detalles:", errorText);
                throw new Error(`El archivo se subió a Supabase, pero falló en Prisma (Status ${respuesta.status})`);
            }

            console.log("9. ¡TODO LISTO! 🎉 Archivo guardado en Supabase y registrado en Prisma al 100%.");

        } catch (error: any) {
            console.error('ERROR CRÍTICO CAPTURADO EN CATCH:', error.message || error);
            alert('Hubo un error al subir el archivo. Revisa la consola de desarrollador (F12).');
        } finally {
            setSubiendo(false);
            // Limpiamos el input para que pueda subir otro archivo si quiere
            event.target.value = '';
            console.log("10. Proceso finalizado, input limpiado.");
        }
    };

    // Checklist Logic
    const steps = [
        {
            id: 'agent-created',
            title: 'Crear Agente',
            completed: true, // Always true if they are here
            icon: CheckCircle2,
            href: '/dashboard/builder'
        },
        {
            id: 'customize',
            title: 'Personalizar Respuestas',
            completed: activeAgent?.config?.systemPrompt && activeAgent.config.systemPrompt.length > 50,
            icon: Settings,
            href: '/dashboard/builder'
        },
        {
            id: 'test',
            title: 'Probar conversación',
            completed: false, // Hard to track without more state, keep as action
            icon: MessageSquare,
            href: '/dashboard/builder'
        },
        {
            id: 'connect',
            title: 'Conectar WhatsApp',
            completed: false, // To implement real check later
            icon: Zap,
            href: '/dashboard/connections'
        }
    ];

    const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {agentName}👋</h1>
                <p className="text-white/60">Here is what happening with your AI Agent today.</p>
            </motion.div>

            {/* Metrics Row */}
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Metric Card 1 */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            <ArrowUpRight className="w-3 h-3" /> 12%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.conversations}</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">TOTAL CONVERSATIONS</p>
                </motion.div>

                {/* Metric Card 2 */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            <ArrowUpRight className="w-3 h-3" /> 8%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.tasksAutomated}</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">TASKS AUTOMATED</p>
                </motion.div>

                {/* Metric Card 3 */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full border border-rose-400/20">
                            <ArrowUpRight className="w-3 h-3 rotate-90" /> 2%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.savedTime} hrs</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">SAVED TIME</p>
                </motion.div>
            </motion.div>

            {/* Main Content Area - Split */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >

                {/* Token Usage Graph Placeholder */}
                <div className="col-span-1 lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Token Usage</h2>
                        <select className="bg-transparent border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1 outline-none">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-[300px] mt-4 w-full relative">
                        {/* Custom Gradient for Area Chart */}
                        <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                            <defs>
                                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </svg>

                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(10,10,10,0.9)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tokens"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTokens)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Checklist & Upload Card */}
                <div className="col-span-1 flex flex-col gap-6">

                    {/* Onboarding Checklist */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                            <span>Guía de Inicio</span>
                            <span className="text-xs font-normal text-white/40">{progress}% Completado</span>
                        </h2>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="space-y-3">
                            {steps.map((step) => (
                                <Link
                                    key={step.id}
                                    href={step.href}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                                        step.completed
                                            ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            step.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                                        </div>
                                        <span className={`text-sm font-medium ${step.completed ? 'text-white/60 line-through' : 'text-white/90'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {!step.completed && (
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {!steps.every(s => s.completed) && (
                            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                                <p className="text-xs text-white/40">Completa estos pasos para activar tu agente al 100%.</p>
                            </div>
                        )}
                    </div>

                    {/* NUEVO: Tarjeta de Subida de Documentos */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold">Base de Conocimiento</h2>
                        </div>

                        <p className="text-sm text-white/60 mb-4">
                            Sube PDFs o documentos grandes (hasta 50MB) para entrenar a tu agente.
                        </p>

                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={manejarSubida}
                                disabled={subiendo}
                                className="hidden" // Ocultamos el input nativo para estilizarlo mejor
                            />
                            <label
                                htmlFor="file-upload"
                                className={`flex items-center justify-center w-full py-3 px-4 rounded-xl border border-dashed transition-all cursor-pointer
                                    ${subiendo
                                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 cursor-not-allowed'
                                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white/80'
                                }`}
                            >
                                {subiendo ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Subiendo a la nube...
                                    </>
                                ) : (
                                    <span className="text-sm font-medium">Seleccionar archivo...</span>
                                )}
                            </label>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}