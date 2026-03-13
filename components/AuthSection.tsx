"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthSection() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300 hidden md:inline-block">
          Hola, <span className="text-white font-medium">{session.user?.name?.split(' ')[0] || session.user?.email}</span>
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2">
        Iniciar
      </Link>
      <Link href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all text-center">
        Prueba Gratis
      </Link>
    </>
  );
}

export function AuthSectionSkeleton() {
  return <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />;
}

export function MobileAuthSection({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <Link
          href="/dashboard"
          onClick={onClose}
          className="block text-center bg-blue-600 text-white py-4 rounded-2xl font-bold"
        >
          Ir al Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-center bg-white/5 text-white/50 py-4 rounded-2xl font-medium"
        >
          Cerrar Sesión
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        onClick={onClose}
        className="block text-center bg-white/5 text-white py-4 rounded-2xl font-bold"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/register"
        onClick={onClose}
        className="block text-center bg-blue-600 text-white py-4 rounded-2xl font-bold"
      >
        Registrarse Ahora
      </Link>
    </>
  );
}

