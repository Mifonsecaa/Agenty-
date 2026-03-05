"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

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

  // No mostrar el header en las páginas del dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="fixed top-0 w-full bg-black/50 backdrop-blur-md shadow-md z-50 border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Agenty<span className="text-white/50">.ai</span></span>
            </Link>
          </div>

          {/* Menus (Centrados) */}
          <div className="hidden md:flex flex-grow justify-center items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <button className="text-gray-300 hover:text-white focus:outline-none">
                  {item.title}
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-black rounded-md shadow-lg z-10
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-300">
                  <div className="py-1">
                    {item.links.map((link) => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm text-gray-300 
                                                                      hover:bg-purple-600 hover:text-white 
                                                                      hover:scale-105 transform transition-transform transition-colors duration-200">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Enlace de Precios */}
            <Link href="/pricing" className="text-gray-300 hover:text-white">
              Precios
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-24 h-8 bg-gray-700 rounded-md animate-pulse" />
            ) : session ? (
              <>
                <span className="text-gray-300">Hola, {session.user?.name || session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-300 border border-gray-500 px-4 py-2 rounded-md hover:text-white hover:border-white"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <p className="text-gray-300 hover:text-white">Iniciar</p>
                </Link>
                <Link href="/register">
                  <p className="text-gray-300 border border-gray-500 px-4 py-2 rounded-md hover:text-white hover:border-white">
                    Registrarse
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
