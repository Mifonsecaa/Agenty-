"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Book, MessageCircle, FileText, Video, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ... (Resto de los datos del componente se mantienen igual)
const categories = [
    { id: 'getting-started', name: 'Primeros Pasos', icon: Book },
    { id: 'billing', name: 'Facturación', icon: FileText },
    { id: 'integrations', name: 'Integraciones', icon: Video },
    { id: 'troubleshooting', name: 'Solución de Problemas', icon: MessageCircle },
];

const articles = [
    {
        id: 1,
        title: '¿Cómo conectar mi cuenta de WhatsApp?',
        category: 'getting-started',
        content: 'Para conectar tu cuenta de WhatsApp, ve a Configuración > Integraciones > WhatsApp y escanea el código QR desde tu aplicación móvil, tal como lo harías con WhatsApp Web.',
    },
    {
        id: 2,
        title: '¿Cómo cambiar mi método de pago?',
        category: 'billing',
        content: 'Puedes cambiar tu método de pago desde el panel de Facturación. Haz clic en "Añadir método de pago" y sigue las instrucciones en pantalla.',
    },
    {
        id: 3,
        title: 'El agente no responde a los mensajes',
        category: 'troubleshooting',
        content: 'Si tu agente ha dejado de responder, verifica primero que tu conexión a WhatsApp siga activa. A veces, las sesiones de WhatsApp Web caducan y necesitan ser reconectadas.',
    },
    {
        id: 4,
        title: 'Cómo entrenar a mi agente con mis propios datos',
        category: 'getting-started',
        content: 'Ve a la sección "Base de Conocimiento" y sube tus documentos PDF, Word o enlaces web. El agente tardará unos minutos en procesar la información y estará listo para responder.',
    },
];

function HelpPageContent() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('getting-started');
    const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);
    
    // Contact form state
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (searchParams.get('contact') === 'true') {
            setIsContactFormOpen(true);
            // Hacer scroll suave hacia el formulario si está abierto
            setTimeout(() => {
                document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [searchParams]);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              article.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = searchQuery === '' ? article.category === activeCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactEmail || !contactMessage) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Simular envío de correo a soporte
        try {
            // Aquí iría tu lógica real de envío (ej. fetch a tu API de emails)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSubmitStatus('success');
            setContactEmail('');
            setContactMessage('');
            
            // Cerrar formulario después de unos segundos
            setTimeout(() => {
                setIsContactFormOpen(false);
                setSubmitStatus('idle');
            }, 3000);
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-24 sm:pt-32 relative overflow-hidden transition-colors duration-500">
            {/* Background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-6 py-12 relative z-10 max-w-5xl">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        ¿En qué podemos ayudarte?
                    </h1>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-white/40" />
                            <input
                                type="text"
                                placeholder="Busca artículos, guías o soluciones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar / Categories */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-1 space-y-2"
                    >
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isActive = activeCategory === category.id && searchQuery === '';
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setActiveCategory(category.id);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                                        isActive 
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' 
                                        : 'text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{category.name}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Content Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-3 space-y-4"
                    >
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                                <div 
                                    key={article.id}
                                    className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a0a0a] overflow-hidden transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none"
                                >
                                    <button
                                        onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white/90 text-lg">{article.title}</span>
                                        {expandedArticle === article.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {expandedArticle === article.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-6 pb-6 text-gray-600 dark:text-white/60 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                                                    {article.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                                <p className="text-gray-500 dark:text-white/50">Intenta con otros términos de búsqueda o contáctanos directamente.</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Contact CTA & Form */}
                <motion.div 
                    id="contact-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-24 p-8 rounded-3xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 border border-blue-100 dark:border-blue-500/20 text-center"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¿Aún necesitas ayuda?</h2>
                    <p className="text-gray-600 dark:text-white/70 mb-8 max-w-lg mx-auto">
                        Nuestro equipo de soporte técnico está disponible 24/7 para ayudarte a resolver cualquier problema.
                    </p>
                    
                    <AnimatePresence mode="wait">
                        {!isContactFormOpen ? (
                            <motion.button 
                                key="contact-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsContactFormOpen(true)}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25"
                            >
                                Contactar Soporte
                            </motion.button>
                        ) : (
                            <motion.form 
                                key="contact-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleContactSubmit}
                                className="max-w-md mx-auto text-left space-y-4"
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tu correo electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        required
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="ejemplo@empresa.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ¿Cómo podemos ayudarte?
                                    </label>
                                    <textarea 
                                        id="message"
                                        required
                                        rows={4}
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white resize-none"
                                        placeholder="Describe tu problema o duda con detalle..."
                                    />
                                </div>
                                
                                {submitStatus === 'success' && (
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm flex items-center justify-center">
                                        ¡Mensaje enviado correctamente! Te contactaremos pronto.
                                    </div>
                                )}
                                
                                {submitStatus === 'error' && (
                                    <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center justify-center">
                                        Hubo un error al enviar el mensaje. Intenta nuevamente.
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsContactFormOpen(false);
                                            setSubmitStatus('idle');
                                        }}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Enviar <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export default function HelpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#050505] pt-24" />}>
            <HelpPageContent />
        </Suspense>
    );
}
