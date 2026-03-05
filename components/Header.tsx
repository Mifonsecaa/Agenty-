"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const menuItems = [
  {
    title: 'Servicios',
    links: [
      { href: '/services/service-a', label: 'Servicio A' },
      { href: '/services/service-b', label: 'Servicio B' },
    ],
  },
  {
    title: 'Nosotros',
    links: [
      { href: '/about/team', label: 'Equipo' },
      { href: '/about/history', label: 'Nuestra Historia' },
    ],
  },
  {
    title: 'Fuentes',
    links: [
      { href: '/sources/blog', label: 'Blog' },
      { href: '/sources/news', label: 'Noticias' },
    ],
  },
];

const Header = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="bg-transparent shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.png" // Asegúrate de que tu logo esté en /public/logo.png
                alt="Agenty Logo"
                width={100} // Tamaño prudente, puedes ajustarlo
                height={40}
                className="h-10 w-auto" // Mantiene la proporción
              />
            </Link>
          </div>

          {/* Menus (Centrados) */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            {menuItems.map((item) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.title)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button className="text-gray-300 hover:text-white focus:outline-none">
                  {item.title}
                </button>
                {openMenu === item.title && (
                  <div className="absolute left-0 mt-2 w-48 bg-black rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {item.links.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <p className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                            {link.label}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <p className="text-gray-300 hover:text-white">Iniciar</p>
            </Link>
            <Link href="/register">
              <p className="text-gray-300 border border-gray-500 px-4 py-2 rounded-md hover:text-white hover:border-white">
                Registrarse
              </p>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
