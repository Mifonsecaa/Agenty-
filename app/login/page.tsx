"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // <-- 1. Importar signIn

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 3. Usar signIn de next-auth para credenciales
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.ok) {
                router.push("/dashboard"); // Redirigir al dashboard
            } else {
                setError(res?.error || "Email o contraseña inválidos.");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="aurora-bg" />
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-white/60 text-center mb-8">
                        Inicia sesión para acceder a tu panel
                    </p>

                    {/* 2. Botón de Google */}
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full bg-white/10 border border-white/20 text-white/80 font-medium py-3 rounded-xl hover:bg-white/20 transition-all duration-200 mb-6 flex items-center justify-center gap-2"
                    >
                        {/* Puedes añadir un SVG del logo de Google aquí */}
                        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.902,35.688,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        Continuar con Google
                    </button>

                    <div className="flex items-center mb-6">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="mx-4 text-white/40 text-sm">O</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" placeholder="tu@email.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">Contraseña</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" placeholder="••••••••" />
                        </div>
                        {error && (<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>)}
                        <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-white/60 text-sm">
                        ¿No tienes cuenta? <Link href="/register" className="text-white hover:underline">Regístrate</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
