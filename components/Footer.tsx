import React from 'react';
import Link from 'next/link';
import { Bot, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-white/5 pt-16 pb-8 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">brainia<span className="text-gray-500 dark:text-white/50">.ai</span></span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Automatiza tu atención al cliente y ventas con agentes de IA expertos en tu negocio.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Producto</h4>
                        <ul className="space-y-3">
                            <li><Link href="/#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Características</Link></li>
                            <li><Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Precios</Link></li>
                            <li><Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integraciones</Link></li>
                            <li><Link href="/changelog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Actualizaciones</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recursos</h4>
                        <ul className="space-y-3">
                            <li><Link href="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Centro de Ayuda</Link></li>
                            <li><Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentación API</Link></li>
                            <li><Link href="/community" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Comunidad</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacidad</Link></li>
                            <li><Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Términos de Uso</Link></li>
                            <li><Link href="/security" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Seguridad</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        © {new Date().getFullYear()} brainia.ai. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <span>Hecho con</span>
                        <span className="text-red-500">♥</span>
                        <span>para el futuro</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;