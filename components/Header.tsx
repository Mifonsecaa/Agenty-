"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const [isVisible, setIsVisible] = React.useState(true);
	const [lastScrollY, setLastScrollY] = React.useState(0);
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setIsScrolled(currentScrollY > 20);

			if (currentScrollY > lastScrollY && currentScrollY > 50) {
				setIsVisible(false);
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

	return (
		<>
			<header className={`fixed top-0 w-full z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
				<div className={`absolute inset-0 transition-all duration-300 ${isScrolled ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`} />

				<nav className="relative w-full max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<div className="flex-shrink-0 relative z-50">
							<Link href="/" className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
									<Bot className="w-5 h-5 text-white" />
								</div>
											<span className="font-bold text-lg tracking-tight text-white">brainia<span className="text-white/50">.ai</span></span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-8 relative z-50">
							<Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
								Características
							</Link>
							<Link href="/pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
								Precios
							</Link>
							<Link href="/help" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
								Ayuda
							</Link>
						</div>

						{/* Auth */}
						<div className="flex items-center gap-3 relative z-50">
							<div className="flex items-center gap-2">
								{status === 'loading' ? (
									<div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
								) : session ? (
									<div className="flex items-center gap-4">
										<Link
											href="/dashboard/builder"
											className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
										>
											Playground
										</Link>
										<span className="text-sm text-gray-300 hidden lg:inline-block">
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
						</div>
					</div>
				</nav>
			</header>
		</>
	);
};

export default Header;
