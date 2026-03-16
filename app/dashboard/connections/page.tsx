"use client";

import ConnectionsManager from "@/components/dashboard/ConnectionsManager";
import { useAgenty } from "@/context/AgentyContext";

export default function ConnectionsPage() {
    const { activeAgent } = useAgenty();

    if (!activeAgent) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-muted-foreground">
                <p className="text-lg">Selecciona un agente para configurar sus conexiones.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Conexiones</h1>
                <p className="text-muted-foreground">
                    Configura los canales de comunicación para tu agente <span className="font-semibold text-foreground">{activeAgent.name}</span>.
                </p>
            </div>
            
            <ConnectionsManager businessId={activeAgent.id} />
        </div>
    );
}
