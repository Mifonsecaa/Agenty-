import React from 'react';
import { GraduationCap, Rocket, Target } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-32 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        Nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Historia</span>
                    </h1>
                    <p className="text-lg text-white/60">
                        De las aulas de clase a la vanguardia de la automatización cognitiva.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Timeline Item 1: El Origen */}
                    <div className="relative pl-8 md:pl-0">
                        <div className="md:w-1/2 md:pr-12 md:text-right relative">
                            <div className="md:hidden absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center -translate-x-[29px]">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center md:justify-end gap-3">
                                <span className="md:order-last">El Origen</span>
                                <GraduationCap className="w-6 h-6 text-blue-400 md:order-first" />
                            </h3>
                            <p className="text-white/70 leading-relaxed p-6 rounded-3xl border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md shadow-xl text-left md:text-right">
                                Todo comenzó en los pasillos de la <strong className="text-blue-300">Universidad Nacional de Colombia</strong>. Como estudiantes de <strong className="text-white">Ciencias de la Computación</strong>, nos unió la fascinación por la Inteligencia Artificial y su enorme potencial transformador. Entre proyectos de clase y madrugadas de código, descubrimos que la tecnología más avanzada del mundo a menudo es inalcanzable para el negocio común.
                            </p>
                        </div>
                        {/* Timeline dot line (Desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent -translate-x-1/2" />
                        <div className="hidden md:flex absolute left-1/2 top-6 w-8 h-8 rounded-full bg-[#050505] border-2 border-blue-500 items-center justify-center -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                        </div>
                    </div>

                    {/* Timeline Item 2: La Misión */}
                    <div className="relative pl-8 md:pl-0 flex md:justify-end">
                        <div className="md:w-1/2 md:pl-12 relative">
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center -translate-x-[29px] md:hidden">
                                <div className="w-2 h-2 rounded-full bg-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <Target className="w-6 h-6 text-purple-400" />
                                Nuestra Misión
                            </h3>
                            <p className="text-white/70 leading-relaxed p-6 rounded-3xl border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md shadow-xl">
                                Queremos <strong className="text-purple-300">revolucionar el uso de agentes en Colombia</strong>. Nos dimos cuenta de que las PYMES necesitan más que simples chatbots; necesitan asistentes inteligentes capaces de tomar decisiones, agendar citas y cerrar ventas. brainia nace para ser ese puente, democratizando el acceso a la "Inteligencia Artificial Ejecutiva" en nuestro país.
                            </p>
                        </div>
                        <div className="hidden md:flex absolute left-1/2 top-6 w-8 h-8 rounded-full bg-[#050505] border-2 border-purple-500 items-center justify-center -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                        </div>
                    </div>

                    {/* Timeline Item 3: El Futuro */}
                    <div className="relative pl-8 md:pl-0">
                        <div className="md:w-1/2 md:pr-12 md:text-right relative">
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center -translate-x-[29px] md:hidden">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center md:justify-end gap-3">
                                <span className="md:order-last">El Futuro</span>
                                <Rocket className="w-6 h-6 text-emerald-400 md:order-first" />
                            </h3>
                            <p className="text-white/70 leading-relaxed p-6 rounded-3xl border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md shadow-xl text-left md:text-right">
                                Lo que empezó como un sueño universitario hoy es la arquitectura fundacional de brainia. Estamos construyendo una plataforma escalable, segura y profundamente integrada con los flujos de comunicación diarios de los colombianos (como WhatsApp). Cada línea de código que escribimos está pensada para empoderar a la próxima generación de negocios en Latinoamérica.
                            </p>
                        </div>
                        <div className="hidden md:flex absolute left-1/2 top-6 w-8 h-8 rounded-full bg-[#050505] border-2 border-emerald-500 items-center justify-center -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
