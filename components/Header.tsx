"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Menu, X, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';

const menuItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    links: [
      { href: '/dashboard', label: 'Overview' },
      { href: '/dashboard/builder', label: 'Playground' },
      { href: '/dashboard/knowledge', label: 'Conocimiento (RAG)' },
      { href: '/dashboard/tools', label: 'Tienda de Tools' },
      { href: '/dashboard/inbox', label: 'Inbox en Vivo' },
    ],
  },
  {
    id: 'services',
    title: 'Servicios',
    links: [
      { href: '/services/default-agents', label: 'Agentes predeterminados' },
      { href: '/?demo=true', label: 'Prueba interactiva' },
    ],
  },
  {
    id: 'about',
    title: 'Nosotros',
    links: [
      { href: '/about/team', label: 'Equipo' },
      { href: '/about/history', label: 'Nuestra Historia' },
    ],
  },
  {
    id: 'sources',
    title: 'Fuentes',
    links: [
      { href: '/sources/blog', label: 'Blog' },
      { href: '/sources/news', label: 'Noticias' },
    ],
  },
];

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // No mostrar el header en las páginas del dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="absolute inset-0 bg-transparent" />

        <nav className="relative w-full max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0 relative z-50">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Agenty<span className="text-white/50">.ai</span></span>
              </Link>
            </div>

            {/* Desktop Menus (Centrados) */}
            <div className="hidden lg:flex flex-grow justify-center items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group px-2">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {item.title}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown - Works with groups on desktop hover OR click on tablet */}
                  <div className={`absolute left-0 mt-2 w-64 bg-[#050505] rounded-xl z-50
                                  transition-all duration-200 backdrop-blur-md overflow-hidden
                                  ${activeDropdown === item.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:translate-y-0'}`}>
                    <div className="p-2 space-y-1">
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => {
                            setActiveDropdown(null);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block px-4 py-2.5 text-sm text-gray-400 rounded-lg hover:bg-white/5 hover:text-white transition-all"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Precios
              </Link>
            </div>

            {/* Auth & Mobile Toggle */}
            <div className="flex items-center gap-3 relative z-50">
              <div className="hidden sm:flex items-center gap-2">
                {status === 'loading' ? (
                  <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
                ) : session ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300 hidden md:inline-block">
                      Hola, <span className="text-white font-medium">{session.user?.name?.split(' ')[0] || session.user?.email}</span>
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2">
                      Iniciar
                    </Link>
                    <Link href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all text-center">
                      Prueba Gratis
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
                aria-label="Menu de navegación"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer - Outside the header to avoid transform context issues */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505] z-[100] overflow-y-auto lg:hidden"
          >
            {/* Header duplicate inside drawer for "X" toggle and Logo */}
            <div className="flex items-center justify-between px-6 py-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Agenty<span className="text-white/50">.ai</span></span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="p-6 space-y-8 pb-32">
              {menuItems.map((item) => (
                <div key={item.id} className="space-y-4">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest px-4">{item.title}</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-4 pt-4">
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-300 hover:text-white"
                >
                  Precios
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="sm:hidden space-y-3 pt-6">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center bg-blue-600 text-white py-4 rounded-2xl font-bold"
                    >
                      Ir al Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-center bg-white/5 text-white/50 py-4 rounded-2xl font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center bg-white/5 text-white py-4 rounded-2xl font-bold"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center bg-blue-600 text-white py-4 rounded-2xl font-bold"
                    >
                      Registrarse Ahora
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
