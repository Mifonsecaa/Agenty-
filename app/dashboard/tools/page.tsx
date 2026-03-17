"use client";
import { useState, useEffect } from "react";
import { Calendar, CreditCard, ShoppingBag, Mail, Blocks } from "lucide-react";
import { useAgenty } from "@/context/AgentyContext";
import { useRouter } from "next/navigation";
import ActionConfirmationPanel from "@/components/dashboard/ActionConfirmationPanel";
import { useDashboardCopy } from "@/components/dashboard/useDashboardCopy";

type ToolCard = {
    id: number;
    slug: "google-calendar" | "payments" | "shopify" | "email";
    name: string;
    description: string;
    icon: React.ReactNode;
    status: "connected" | "disconnected";
    category: string;
};

export default function ToolsStore() {
    const router = useRouter();
    const { copy } = useDashboardCopy();
    const { activeAgent, saveAgent, updateActiveAgentConfig } = useAgenty();
    const [tools, setTools] = useState<ToolCard[]>([
        {
            id: 1,
            slug: "google-calendar",
            name: "Google Calendar",
            description: "Permite a tu agente revisar disponibilidad y agendar citas automáticamente.",
            icon: <Calendar className="w-6 h-6 text-blue-400" />,
            status: "connected",
            category: "Productividad"
        },
        {
            id: 2,
            slug: "payments",
            name: "MercadoPago / Wompi",
            description: "Genera links de pago y verifica si el cliente ya pagó la orden.",
            icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
            status: "disconnected",
            category: "Ventas"
        },
        {
            id: 3,
            slug: "shopify",
            name: "Shopify Inventory",
            description: "Conecta tu catálogo para que el agente vea el stock en tiempo real.",
            icon: <ShoppingBag className="w-6 h-6 text-purple-400" />,
            status: "disconnected",
            category: "E-Commerce"
        },
        {
            id: 4,
            slug: "email",
            name: "Gmail / Outlook",
            description: "Envía correos electrónicos con cotizaciones a petición del cliente.",
            icon: <Mail className="w-6 h-6 text-rose-400" />,
            status: "disconnected",
            category: "Productividad"
        }
    ]);
    const [savingToolId, setSavingToolId] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [pendingDeactivateToolId, setPendingDeactivateToolId] = useState<number | null>(null);

    // Leer tools recomendadas desde el contexto
    useEffect(() => {
        if (!activeAgent) return;

        const config = activeAgent.config || activeAgent;
        if (config.recommendedTools && Array.isArray(config.recommendedTools)) {
            setTools(prevTools => prevTools.map(tool => ({
                ...tool,
                status: config.recommendedTools.includes(tool.id) ? "connected" : "disconnected"
            })));
        }
    }, [activeAgent]);

    const handleToggleTool = async (toolId: number) => {
        if (!activeAgent || savingToolId !== null) return;

        setStatusMessage(null);
        setSavingToolId(toolId);

        const previousTools = tools;
        const nextTools: ToolCard[] = previousTools.map((tool) => {
            if (tool.id !== toolId) return tool;
            return {
                ...tool,
                status: tool.status === "connected" ? "disconnected" : "connected",
            };
        });

        // Optimistic update para respuesta inmediata en UI
        setTools(nextTools);

        const recommendedTools = nextTools
            .filter((tool) => tool.status === "connected")
            .map((tool) => tool.id);

        const currentConfig = activeAgent.config || {};
        const mergedConfig = {
            ...currentConfig,
            recommendedTools,
        };

        const saved = await saveAgent(activeAgent.id, activeAgent.name, mergedConfig);

        if (!saved) {
            // Rollback si falla persistencia
            setTools(previousTools);
            setStatusMessage({ type: "error", text: copy.tools.updateError });
            setSavingToolId(null);
            return;
        }

        updateActiveAgentConfig({
            config: mergedConfig,
        });

        setStatusMessage({ type: "success", text: copy.tools.updateSuccess });
        setSavingToolId(null);
    };

    const handlePrimaryAction = (tool: ToolCard) => {
        if (tool.status === "connected") {
            const configTargetBySlug: Record<ToolCard["slug"], string> = {
                "google-calendar": "/dashboard/settings?tab=integrations&tool=google-calendar",
                "payments": "/dashboard/settings?tab=integrations&tool=payments",
                "shopify": "/dashboard/knowledge",
                "email": "/dashboard/settings?tab=integrations&tool=email",
            };

            const target = configTargetBySlug[tool.slug];
            setStatusMessage({ type: "success", text: copy.tools.openingConfig(tool.name) });
            router.push(target);
            return;
        }

        handleToggleTool(tool.id);
    };

    const openDeactivateConfirm = (toolId: number) => {
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(toolId);
    };

    const closeDeactivateConfirm = () => {
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(null);
    };

    const confirmDeactivateTool = async () => {
        if (pendingDeactivateToolId === null) return;
        await handleToggleTool(pendingDeactivateToolId);
        setPendingDeactivateToolId(null);
    };

    const pendingDeactivateTool = tools.find((tool) => tool.id === pendingDeactivateToolId) || null;


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
                        <p className="text-sm text-white/50 mb-6 min-h-10 relative z-10">
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
                                } ${savingToolId === tool.id ? 'opacity-70 cursor-wait' : ''}`}
                                onClick={() => handlePrimaryAction(tool)}
                                disabled={savingToolId !== null}
                            >
                                {savingToolId === tool.id
                                    ? (tool.status === "connected" ? "Guardando..." : "Conectando...")
                                    : (tool.status === "connected" ? "Configurar" : "Conectar")}
                            </button>
                        </div>

                        {tool.status === "connected" && (
                            <button
                                onClick={() => openDeactivateConfirm(tool.id)}
                                disabled={savingToolId !== null}
                                className="mt-3 text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                                Desactivar
                            </button>
                        )}

                        {/* Glowing background effect */}
                        {tool.status === "connected" && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        )}
                    </div>
                ))}
            </div>

            {pendingDeactivateTool && (
                <ActionConfirmationPanel
                    message={copy.tools.deactivateConfirm(pendingDeactivateTool.name)}
                    details={copy.tools.deactivateDetails}
                    confirmLabel={copy.confirmation.labels.deactivate}
                    cancelLabel={copy.confirmation.cancel}
                    isLoading={savingToolId === pendingDeactivateTool.id}
                    onCancel={closeDeactivateConfirm}
                    onConfirm={() => {
                        void confirmDeactivateTool();
                    }}
                />
            )}

            {statusMessage && (
                <p className={`text-sm ${statusMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                    {statusMessage.text}
                </p>
            )}
        </div>
    );
}
