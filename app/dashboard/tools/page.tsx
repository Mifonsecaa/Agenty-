"use client";
import { useState, useEffect } from "react";
import { Calendar, CreditCard, ShoppingBag, Mail, Blocks } from "lucide-react";

export default function ToolsStore() {
    const [tools, setTools] = useState([
        {
            id: 1,
            name: "Google Calendar",
            description: "Permite a tu agente revisar disponibilidad y agendar citas automáticamente.",
            icon: <Calendar className="w-6 h-6 text-blue-400" />,
            status: "connected",
            category: "Productividad"
        },
        {
            id: 2,
            name: "MercadoPago / Wompi",
            description: "Genera links de pago y verifica si el cliente ya pagó la orden.",
            icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
            status: "disconnected",
            category: "Ventas"
        },
        {
            id: 3,
            name: "Shopify Inventory",
            description: "Conecta tu catálogo para que el agente vea el stock en tiempo real.",
            icon: <ShoppingBag className="w-6 h-6 text-purple-400" />,
            status: "disconnected",
            category: "E-Commerce"
        },
        {
            id: 4,
            name: "Gmail / Outlook",
            description: "Envía correos electrónicos con cotizaciones a petición del cliente.",
            icon: <Mail className="w-6 h-6 text-rose-400" />,
            status: "disconnected",
            category: "Productividad"
        }
    ]);

    // Leer tools recomendadas desde localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem("agenty_config");
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.recommendedTools && Array.isArray(config.recommendedTools)) {
                    // Actualizar el estado 'connected' si la tool está en la lista recomendada
                    setTools(prevTools => prevTools.map(tool => ({
                        ...tool,
                        status: config.recommendedTools.includes(tool.id) ? "connected" : "disconnected"
                    })));
                }
            } catch (e) {
                console.error("Error parsing config", e);
            }
        }
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    Tools Store <Blocks className="w-6 h-6 text-purple-400" />
                </h1>
                <p className="text-white/60">Instala "habilidades" (Function Calling) en tu agente con un solo clic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <div key={tool.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all">

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                {tool.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                {tool.category}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 relative z-10">{tool.name}</h3>
                        <p className="text-sm text-white/50 mb-6 min-h-[40px] relative z-10">
                            {tool.description}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                            {tool.status === "connected" ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Activado
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-white/40 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-white/20" />
                                    Desactivado
                                </div>
                            )}

                            <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tool.status === 'connected'
                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                : 'bg-white text-black hover:bg-white/90'
                                }`}>
                                {tool.status === "connected" ? "Configurar" : "Conectar"}
                            </button>
                        </div>

                        {/* Glowing background effect */}
                        {tool.status === "connected" && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
