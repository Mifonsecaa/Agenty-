"use client";
import Link from 'next/link';
import {
    Bot,
    LayoutDashboard,
    Settings,
    MessageSquare,
    Database,
    Blocks,
    LogOut,
    Bell,
    ChevronDown,
    Home,
    PlusCircle,
    Trash2
} from 'lucide-react';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [agentName, setAgentName] = useState("Mi Negocio Principal");
    const [initial, setInitial] = useState("A");
    const [agents, setAgents] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const loadAgentsData = async () => {
        try {
            const response = await fetch("/api/business");
            if (!response.ok) {
                console.error("Error fetching businesses", response.statusText);
                return;
            }
            const data = await response.json();

            if (data.success && data.businesses && data.businesses.length > 0) {
                const fetchedAgents = data.businesses;
                setAgents(fetchedAgents);

                // Preserve active selection from localStorage or default to latest
                const activeId = localStorage.getItem("agenty_active_agent_id");
                let active = fetchedAgents.find((a: any) => a.id === activeId);

                if (!active) {
                    active = fetchedAgents[0];
                    localStorage.setItem("agenty_active_agent_id", active.id);
                }

                if (active) {
                    const activeName = active.name || (active.config && active.config.businessName) || "Mi Negocio";
                    setAgentName(activeName);
                    setInitial(activeName.charAt(0).toUpperCase());

                    // Asegurar que el config real se guarde para que el resto del dashboard (Playground/Overview) lo lea bien
                    const fullConfigToSave = {
                        ...active,
                        name: activeName
                    };
                    localStorage.setItem("agenty_config", JSON.stringify(fullConfigToSave));

                    // Si el usuario eliminó un agente y este loadActive resolvió a un fallback, actualizamos el ID activo ref
                    localStorage.setItem("agenty_active_agent_id", active.id);
                }
            } else {
                setAgents([]);
                setAgentName("Sin Agentes");
                setInitial("-");
                localStorage.removeItem("agenty_active_agent_id");
                localStorage.removeItem("agenty_config");
            }
        } catch (e) {
            console.error("Error loading agents from database", e);
        }
    };

    useEffect(() => {
        loadAgentsData();
        window.addEventListener('agentSwitched', loadAgentsData);
        return () => window.removeEventListener('agentSwitched', loadAgentsData);
    }, []);

    const handleSwitchAgent = (agent: any) => {
        localStorage.setItem("agenty_active_agent_id", agent.id);

        // Push the full agent config so child pages immediately read the new data
        const activeName = agent.name || (agent.config && agent.config.businessName) || "Mi Negocio";
        const fullConfigToSave = {
            ...agent,
            name: activeName
        };
        localStorage.setItem("agenty_config", JSON.stringify(fullConfigToSave));

        setIsDropdownOpen(false);
        // Let the rest of the application know the active profile changed
        window.dispatchEvent(new Event('agentSwitched'));
    };

    const handleDeleteAgent = async (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation(); // Prevent switching to the agent before deleting

        try {
            // Delete from database first
            const res = await fetch(`/api/business?id=${agentId}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete from database");

            // Find current agents
            const updatedAgents = agents.filter(a => a.id !== agentId);

            // Update local state
            setAgents(updatedAgents);

            // Update localStorage
            localStorage.setItem("agenty_agents", JSON.stringify(updatedAgents));

            // Handle case where we delete the active agent
            const activeId = localStorage.getItem("agenty_active_agent_id");
            if (activeId === agentId) {
                if (updatedAgents.length > 0) {
                    localStorage.setItem("agenty_active_agent_id", updatedAgents[0].id);
                } else {
                    localStorage.removeItem("agenty_active_agent_id");
                    localStorage.removeItem("agenty_config");
                }
            }

            // Notify app to resync active agent globally
            window.dispatchEvent(new Event('agentSwitched'));

        } catch (error) {
            console.error("Error deleting agent:", error);
            alert("No se pudo eliminar el agente. Por favor intenta de nuevo.");
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">

            {/* Sidebar - Linear Style */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0a0a0a] relative z-20">
                {/* Workspace / Agent Switcher */}
                <div className="h-16 flex items-center px-4 border-b border-white/10 relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-inner">
                                <span className="text-[10px] font-bold text-white">{initial}</span>
                            </div>
                            <div className="flex flex-col items-start truncate max-w-[120px]">
                                <span className="font-medium text-sm text-white/90 leading-tight truncate w-full">{agentName}</span>
                                <span className="text-[10px] text-white/40 font-medium">Plan Pro</span>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-16 left-2 right-2 bg-[#121212] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 max-h-[300px] overflow-y-auto"
                            >
                                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 py-1">Tus Agentes</p>

                                {agents.map((ag) => <div
                                    key={ag.id}
                                    className="group/btn relative flex items-center rounded-lg hover:bg-white/5 transition-all text-left group/item w-full"
                                >
                                    <button
                                        onClick={() => handleSwitchAgent(ag)}
                                        className="flex items-center gap-3 px-2 py-2.5 flex-1 text-left min-w-0"
                                    >
                                        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="text-[9px] font-bold text-white/70 group-hover/item:text-white">{ag.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col truncate w-full pr-6">
                                            <span className="font-medium text-xs text-white/80 group-hover/item:text-white truncate">{ag.name}</span>
                                            <span className="text-[9px] text-white/30 truncate">{ag.objective || 'AI Assistant'}</span>
                                        </div>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDeleteAgent(e, ag.id)}
                                        className="absolute right-2 p-1.5 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover/btn:opacity-100 z-10"
                                        title="Eliminar Agente"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                )}

                                <div className="h-px bg-white/10 my-1 mx-2" />

                                <Link
                                    href="/"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left text-xs font-medium text-white/50 hover:text-white"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Crear Nuevo Agente
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">

                    {/* Botón para volver a la Home Pública */}
                    <div className="mb-4 pb-4 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                            <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                            <span className="group-hover:translate-x-1 transition-transform">Regresar a la Home</span>
                        </Link>
                    </div>

                    <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 mt-2">Agente Actual</p>

                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 text-white font-medium transition-colors text-sm group">
                        <LayoutDashboard className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                        <span className="group-hover:translate-x-1 transition-transform">Overview</span>
                    </Link>

                    <Link href="/dashboard/builder" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">Playground</span>
                    </Link>

                    <Link href="/dashboard/knowledge" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <Database className="w-4 h-4 group-hover:scale-110 transition-transform text-white/60 icon-pulse" />
                        <span className="group-hover:translate-x-1 transition-transform">Knowledge Base</span>
                    </Link>

                    <Link href="/dashboard/tools" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <Blocks className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">Tools Store</span>
                    </Link>

                    <Link href="/dashboard/inbox" className="flex items-center justify-between px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="group-hover:translate-x-1 transition-transform">Live Inbox</span>
                        </div>
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">3</span>
                    </Link>
                </nav>

                <div className="p-3 border-t border-white/10">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                        <span className="group-hover:translate-x-1 transition-transform">Settings</span>
                    </Link>
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all mt-0.5 text-sm font-medium group">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Topbar */}
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4 text-sm text-white/60 font-medium">
                        <span>{agentName}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-emerald-400 flex items-center gap-1.5 border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Agent Online
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20"></div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                    {children}
                </div>
            </main>
        </div>
    );
}
