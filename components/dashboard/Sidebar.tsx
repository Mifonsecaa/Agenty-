"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Database,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/dashboard' },
    { icon: Bot, label: 'Mis Agentes', href: '/dashboard/builder' },
    { icon: Database, label: 'Conocimiento', href: '/dashboard/knowledge' },
    { icon: MessageSquare, label: 'Conversaciones', href: '/dashboard/conversations' },
    { icon: Users, label: 'Contactos', href: '/dashboard/contacts' },
    { icon: BarChart3, label: 'Analíticas', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="relative h-screen bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 flex flex-col transition-colors duration-500"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-1.5 rounded-full text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
              brainia<span className="text-gray-500 dark:text-white/50">.ai</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-4`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border border-blue-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/40 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-sm whitespace-nowrap">Cerrar sesión</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;