"use client";

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
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
    Trash2,
    PanelLeftClose,
    PanelLeftOpen,
    User,
    CreditCard,
    Sparkles,
    Share2
} from 'lucide-react';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentyProvider, useAgenty } from "@/context/AgentyContext";

interface Agent {
    id: string;
    name: string;
    config: any;
    [key: string]: any;
}

interface DashboardShellProps {
    children: React.ReactNode;
    initialAgents: Agent[];
    userName?: string | null;
    userEmail?: string | null;
}

export default function DashboardShell({ children, initialAgents, userName, userEmail }: DashboardShellProps) {
    return (
        <AgentyProvider initialAgents={initialAgents}>
            <DashboardContent userName={userName} userEmail={userEmail}>
                {children}
            </DashboardContent>
        </AgentyProvider>
    );
}

function DashboardContent({ children, userName, userEmail }: { children: React.ReactNode, userName?: string | null, userEmail?: string | null }) {
    const pathname = usePathname();
    const { agents, activeAgent, switchAgent, refreshAgents } = useAgenty();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved === 'true') setIsCollapsed(true);
        setIsMounted(true);

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    const agentName = activeAgent?.name || "Mi Negocio";
    const initial = (activeAgent?.name || userName || "U").charAt(0).toUpperCase();

    const handleDeleteAgent = async (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation();
        if (!confirm("¿Estás seguro de eliminar este agente?")) return;
        
        try {
            const res = await fetch(`/api/business?id=${agentId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            await refreshAgents();
        } catch (error) {
            console.error("Error deleting agent:", error);
        }
    };

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/builder', label: 'Playground', icon: Bot },
        { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: Database },
        { href: '/dashboard/connections', label: 'Conexiones', icon: Share2 },
        { href: '/dashboard/tools', label: 'Tools Store', icon: Blocks },
        { href: '/dashboard/inbox', label: 'Live Inbox', icon: MessageSquare, badge: 3 },
    ];

    if (!isMounted) return null;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Sidebar - Collapsible Style */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
                className="flex-shrink-0 flex flex-col bg-[#050505] relative z-20 border-r border-white/5"
            >
                {/* Workspace / Agent Switcher */}
                <div className="h-16 flex items-center px-4 relative">
                    <button
                        onClick={() => !isCollapsed && setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center rounded-lg hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center p-2' : 'justify-between px-2 py-2'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <span className="text-xs font-bold text-white">{initial}</span>
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start truncate max-w-[120px]">
                                    <span className="font-medium text-sm text-white/90 leading-tight truncate w-full">{agentName}</span>
                                    <span className="text-[10px] text-white/40 font-medium tracking-wider">PLAN PRO</span>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={`w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && !isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-16 left-2 right-2 bg-[#0a0a0a] rounded-xl p-2 z-50 flex flex-col gap-1 max-h-[300px] overflow-y-auto shadow-2xl border border-white/5"
                            >
                                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 py-1">Tus Agentes</p>

                                {agents.map((ag) => (
                                    <div
                                        key={ag.id}
                                        className="group/btn relative flex items-center rounded-lg hover:bg-white/5 transition-all text-left group/item w-full"
                                    >
                                        <button
                                            onClick={() => {
                                                switchAgent(ag.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-2 py-2.5 flex-1 text-left min-w-0"
                                        >
                                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-bold text-white/70 group-hover:item:text-white">{ag.name?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col truncate w-full pr-6">
                                                <span className="font-medium text-xs text-white/80 group-hover:item:text-white truncate">{ag.name}</span>
                                                <span className="text-[9px] text-white/30 truncate">{ag.objective || 'AI Assistant'}</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteAgent(e, ag.id)}
                                            className="absolute right-2 p-1.5 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover/btn:opacity-100 z-10"
                                            title="Eliminar Agente"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                <div className="my-1 mx-2 h-px bg-white/5" />

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

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
                    {/* Botón para volver a la Home Pública */}
                    <div className={`mb-4 pb-4 ${!isCollapsed && 'border-b border-white/5'}`}>
                        <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group ${isCollapsed && 'justify-center'}`}>
                            <Home className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5" />
                            {!isCollapsed && <span>Regresar a la Home</span>}
                        </Link>
                    </div>

                    {!isCollapsed && (
                        <p className="px-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 mt-6">Principal</p>
                    )}

                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative
                                        ${isActive
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                                        }
                                        ${isCollapsed && 'justify-center'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110 group-hover:text-white/80'}`} />
                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors
                                                    ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white'}
                                                `}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {isActive && isCollapsed && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-sm font-medium group
                            ${pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}
                            ${isCollapsed && 'justify-center'}
                        `}
                    >
                        <Settings className={`w-4 h-4 shrink-0 transition-transform duration-500 group-hover:rotate-45 ${pathname === '/dashboard/settings' ? 'text-blue-400' : ''}`} />
                        {!isCollapsed && <span>Configuración</span>}
                    </Link>

                    {/* Botón de Contraer Menú Reubicado */}
                    <button
                        onClick={toggleCollapse}
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group ${isCollapsed && 'justify-center'}`}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-4 h-4 shrink-0" /> : <PanelLeftClose className="w-4 h-4 shrink-0" />}
                        {!isCollapsed && <span>Contraer Menú</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
                {/* Topbar */}
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-[#050505]/60 backdrop-blur-md relative z-30 border-b border-white/5">
                    <div className="flex items-center gap-4 text-sm text-white/40 font-medium">
                        <span className="text-white/80">{agentName}</span>
                        <span className="w-px h-3 bg-white/10" />
                        <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse transition-all shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            ONLINE
                        </span>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 text-white/40 hover:text-white transition-colors group"
                            >
                                <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl p-4 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-bold text-white/80">Notificaciones</h4>
                                            <span className="text-[10px] text-blue-400 cursor-pointer hover:underline">Limpiar todo</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/90 font-medium">¡Bienvenido al nuevo Dashboard!</p>
                                                    <p className="text-[10px] text-white/40">Explora las nuevas funciones de Agenty.ai</p>
                                                </div>
                                            </div>
                                            <p className="text-center py-4 text-[10px] text-white/20 italic">No hay más notificaciones</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 hover:ring-white/30 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {(userName || "U").charAt(0).toUpperCase()}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl p-2 overflow-hidden"
                                    >
                                        <div className="px-3 py-3 border-b border-white/5 mb-1">
                                            <p className="text-xs font-bold text-white truncate">{userName || "Usuario"}</p>
                                            <p className="text-[10px] text-white/30 truncate">{userEmail || "Sin email"}</p>
                                        </div>

                                        <div className="space-y-0.5">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium group">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Mi Perfil</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium group">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Facturación</span>
                                            </button>
                                            <div className="my-1 h-px bg-white/5" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs font-medium group"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="flex-1 overflow-y-auto p-10 relative scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="relative z-10 max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

