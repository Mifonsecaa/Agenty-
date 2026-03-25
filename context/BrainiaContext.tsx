"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Agent {
    id: string;
    name: string;
    config: any;
    greeting?: string;
    systemPrompt?: string;
    [key: string]: any;
}

interface BrainiaContextType {
    agents: Agent[];
    activeAgent: Agent | null;
    isLoading: boolean;
    refreshAgents: () => Promise<void>;
    switchAgent: (agentId: string) => void;
    updateActiveAgentConfig: (newConfig: any) => void;
    saveAgent: (agentId: string, name: string, config: any) => Promise<boolean>;
}

const BrainiaContext = createContext<BrainiaContextType | undefined>(undefined);

export function BrainiaProvider({ 
    children, 
    initialAgents = [] 
}: { 
    children: React.ReactNode;
    initialAgents?: Agent[];
}) {
    const { status } = useSession();
    const [agents, setAgents] = useState<Agent[]>(initialAgents);
    const [activeAgent, setActiveAgent] = useState<Agent | null>(initialAgents.length > 0 ? initialAgents[0] : null);
    const [isLoading, setIsLoading] = useState(initialAgents.length === 0); // Only loading if no initial data

    const refreshAgents = useCallback(async () => {
        // Prevent re-fetching if initialAgents are already set and we are authenticated
        if (initialAgents.length > 0 && isLoading === false) {
             return; // Skip explicit fetch
        }
        
        // Only fetch if authenticated
        if (status !== "authenticated" && initialAgents.length === 0) {
            if (status === "unauthenticated") {
                setIsLoading(false);
            }
            return;
        }

        try {
            console.log("[BrainiaProvider] Fetching agents...");
            const response = await fetch("/api/business");

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("[BrainiaProvider] API Error:", response.status, errorData);
                throw new Error(errorData.error || "Error fetching agents");
            }

            const data = await response.json();

            if (data.success && data.businesses) {
                const fetchedAgents = data.businesses;
                setAgents(fetchedAgents);

                // Sync active selection
                const activeId = localStorage.getItem("brainia_active_agent_id");
                let active = fetchedAgents.find((a: Agent) => a.id === activeId) || fetchedAgents[0];

                if (active) {
                    setActiveAgent(active);
                    localStorage.setItem("brainia_active_agent_id", active.id);
                    localStorage.setItem("brainia_config", JSON.stringify(active));
                }
            }
        } catch (error) {
            console.error("Failed to load agents:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            refreshAgents();
        } else if (status === "unauthenticated") {
            setIsLoading(false);
        }
    }, [refreshAgents, status]);

    const switchAgent = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        setActiveAgent(agent);
        localStorage.setItem("brainia_active_agent_id", agent.id);
        localStorage.setItem("brainia_config", JSON.stringify(agent));

        // Trigger global event for components not using context yet
        window.dispatchEvent(new Event('agentSwitched'));
        toast.success(`Cambiado a ${agent.name || 'Agente'}`);
    };

    const updateActiveAgentConfig = (newConfig: any) => {
        if (!activeAgent) return;
        const updated = { ...activeAgent, ...newConfig };
        setActiveAgent(updated);
        localStorage.setItem("brainia_config", JSON.stringify(updated));

        // Update the agent in the list too
        setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
    };

    const saveAgent = async (agentId: string, name: string, config: any) => {
        try {
            const response = await fetch("/api/business", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: agentId, name, config })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al guardar el agente");
            }

            const data = await response.json();
            if (data.success && data.business) {
                // Actualizar estado local si es el agente activo
                if (activeAgent?.id === agentId) {
                    setActiveAgent(data.business);
                    localStorage.setItem("brainia_config", JSON.stringify(data.business));
                }

                // Actualizar en la lista de agentes
                setAgents(prev => prev.map(a => a.id === agentId ? data.business : a));
                return true;
            }
            return false;
        } catch (error) {
            console.error("[BrainiaProvider] Error saving agent:", error);
            toast.error(error instanceof Error ? error.message : "Error al guardar");
            return false;
        }
    };

    return (
        <BrainiaContext.Provider value={{
            agents,
            activeAgent,
            isLoading,
            refreshAgents,
            switchAgent,
            updateActiveAgentConfig,
            saveAgent
        }}>
            {children}
        </BrainiaContext.Provider>
    );
}

export function useBrainia() {
    const context = useContext(BrainiaContext);
    if (context === undefined) {
        // If we're on the server during prerender, return a safe fallback so pages can be
        // prerendered without the provider. This avoids build-time errors. Client usage
        // should always be wrapped by BrainiaProvider.
        if (typeof window === 'undefined') {
            return {
                agents: [],
                activeAgent: null,
                isLoading: false,
                refreshAgents: async () => {},
                switchAgent: () => {},
                updateActiveAgentConfig: () => {},
                saveAgent: async () => false,
            } as BrainiaContextType;
        }
        throw new Error('useBrainia must be used within a BrainiaProvider');
    }
    return context;
}

