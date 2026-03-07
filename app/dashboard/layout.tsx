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
    Home
} from 'lucide-react';

import { useState, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [agentName, setAgentName] = useState("Mi Negocio Principal");
    const [initial, setInitial] = useState("A");

    useEffect(() => {
        const savedConfig = localStorage.getItem("agenty_config");
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.name) {
                    setAgentName(config.name);
                    setInitial(config.name.charAt(0).toUpperCase());
                }
            } catch (e) {
                console.error("Error parsing config", e);
            }
        }
    }, []);
    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">

            {/* Sidebar - Linear Style */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0a0a0a] relative z-20">
                {/* Workspace / Agent Switcher */}
                <div className="h-16 flex items-center px-4 border-b border-white/10">
                    <button className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-inner">
                                <span className="text-[10px] font-bold text-white">{initial}</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-medium text-sm text-white/90 leading-tight">{agentName}</span>
                                <span className="text-[10px] text-white/40 font-medium">Plan Pro</span>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/40" />
                    </button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">

                    {/* Botón para volver a la Home Pública */}
                    <div className="mb-4 pb-4 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                            <Home className="w-4 h-4" />
                            Regresar a la Home
                        </Link>
                    </div>

                    <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 mt-2">Agente Actual</p>

                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 text-white font-medium transition-colors text-sm">
                        <LayoutDashboard className="w-4 h-4 text-white/70" />
                        Overview
                    </Link>

                    <Link href="/dashboard/builder" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <Bot className="w-4 h-4" />
                        Playground
                    </Link>

                    <Link href="/dashboard/knowledge" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <Database className="w-4 h-4" />
                        Knowledge Base
                    </Link>

                    <Link href="/dashboard/tools" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <Blocks className="w-4 h-4" />
                        Tools Store
                    </Link>

                    <Link href="/dashboard/inbox" className="flex items-center justify-between px-3 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium group">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4" />
                            Live Inbox
                        </div>
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">3</span>
                    </Link>
                </nav>

                <div className="p-3 border-t border-white/10">
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-0.5 text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        Sign Out
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
