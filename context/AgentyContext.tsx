"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Agent {
    id: string;
    name: string;
    config: any;
    greeting?: string;
    systemPrompt?: string;
    [key: string]: any;
}

interface AgentyContextType {
    agents: Agent[];
    activeAgent: Agent | null;
    isLoading: boolean;
    refreshAgents: () => Promise<void>;
    switchAgent: (agentId: string) => void;
    updateActiveAgentConfig: (newConfig: any) => void;
}

const AgentyContext = createContext<AgentyContextType | undefined>(undefined);

export function AgentyProvider({ children }: { children: React.ReactNode }) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAgents = useCallback(async () => {
        try {
            const response = await fetch("/api/business");
            if (!response.ok) throw new Error("Error fetching agents");
            const data = await response.json();

            if (data.success && data.businesses) {
                const fetchedAgents = data.businesses;
                setAgents(fetchedAgents);

                // Sync active selection
                const activeId = localStorage.getItem("agenty_active_agent_id");
                let active = fetchedAgents.find((a: Agent) => a.id === activeId) || fetchedAgents[0];

                if (active) {
                    setActiveAgent(active);
                    localStorage.setItem("agenty_active_agent_id", active.id);
                    localStorage.setItem("agenty_config", JSON.stringify(active));
                }
            }
        } catch (error) {
            console.error("Failed to load agents:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAgents();
    }, [refreshAgents]);

    const switchAgent = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        setActiveAgent(agent);
        localStorage.setItem("agenty_active_agent_id", agent.id);
        localStorage.setItem("agenty_config", JSON.stringify(agent));

        // Trigger global event for components not using context yet
        window.dispatchEvent(new Event('agentSwitched'));
        toast.success(`Cambiado a ${agent.name || 'Agente'}`);
    };

    const updateActiveAgentConfig = (newConfig: any) => {
        if (!activeAgent) return;
        const updated = { ...activeAgent, ...newConfig };
        setActiveAgent(updated);
        localStorage.setItem("agenty_config", JSON.stringify(updated));

        // Update the agent in the list too
        setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
    };

    return (
        <AgentyContext.Provider value={{
            agents,
            activeAgent,
            isLoading,
            refreshAgents,
            switchAgent,
            updateActiveAgentConfig
        }}>
            {children}
        </AgentyContext.Provider>
    );
}

export function useAgenty() {
    const context = useContext(AgentyContext);
    if (context === undefined) {
        throw new Error('useAgenty must be used within an AgentyProvider');
    }
    return context;
}
