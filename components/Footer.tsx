"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // No mostrar footer en rutas de dashboard o auth si se desea
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
        return null;
    }

    return (
        <footer className="border-t border-white/10 bg-[#050505] text-white/60">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">brainia</span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Plataforma de IA nativa para automatizar ventas y soporte en WhatsApp. Entrena tu agente en segundos.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Producto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Precios</Link></li>
                            <li><Link href="/agents/default" className="hover:text-blue-400 transition-colors">Cómo funciona</Link></li>
                            <li><Link href="/dashboard/builder" className="hover:text-blue-400 transition-colors">Playground</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Recursos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/help" className="hover:text-blue-400 transition-colors">Centro de Ayuda</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacidad</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Términos</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>&copy; {new Date().getFullYear()} brainia Inc. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
