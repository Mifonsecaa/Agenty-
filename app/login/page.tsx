"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);

    useEffect(() => {
        const registered = searchParams.get("registered") === "1";
        const verifyEmail = searchParams.get("verifyEmail") === "1";
        const verified = searchParams.get("verified") === "1";
        const incomingEmail = searchParams.get("email")?.trim() || "";
        const authError = searchParams.get("error");

        if (registered) {
            setSuccessMessage(
                verifyEmail
                    ? "Cuenta creada. Revisa tu correo y confirma tu registro antes de iniciar sesión."
                    : "Cuenta creada con éxito. Inicia sesión para continuar."
            );
        }

        if (verified) {
            setSuccessMessage("Correo confirmado correctamente. Ya puedes iniciar sesión.");
        }

        if (incomingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(incomingEmail)) {
            setEmail(incomingEmail.toLowerCase());
        }

        if (authError) {
            setShowResendButton(false);
            const oauthErrors: Record<string, string> = {
                OAuthSignin: "No se pudo iniciar el flujo con Google.",
                OAuthCallback: "La respuesta de Google fue inválida o incompleta.",
                OAuthAccountNotLinked: "Este correo ya existe con otro método de acceso.",
                Callback: "No se pudo completar la autenticación.",
                AccessDenied: "Acceso denegado por el proveedor.",
                Configuration: "Error de configuración de autenticación en el servidor.",
                invalid_verification_link: "El enlace de verificación es inválido.",
                verification_link_expired: "El enlace de verificación expiró. Solicita uno nuevo.",
            };
            setError(oauthErrors[authError] || "Error al iniciar sesión con Google.");
            if (authError === "verification_link_expired") {
                setShowResendButton(true);
            }
        }
    }, [searchParams]);

    const handleResendVerification = async () => {
        if (!email) {
            setError("Ingresa tu correo para reenviar la confirmación.");
            return;
        }

        setResendLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || "No se pudo reenviar el correo de confirmación.");
                return;
            }

            setSuccessMessage(data.message || "Te enviamos un nuevo correo de confirmación.");
            setShowResendButton(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo reenviar el correo de confirmación.");
        } finally {
            setResendLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setSuccessMessage("");
        setGoogleLoading(true);

        try {
            await signIn("google", {
                callbackUrl: "/dashboard",
                prompt: "select_account",
            });
        } catch (err) {
            setGoogleLoading(false);
            setError(err instanceof Error ? err.message : "Error al iniciar sesión con Google");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Usamos la función signIn de NextAuth
            const result = await signIn("credentials", {
                redirect: false, // Evita que la página recargue de golpe
                email,
                password,
            });

            if (result?.error) {
                if (result.error === "EMAIL_NOT_VERIFIED") {
                    setError("Debes confirmar tu correo antes de iniciar sesión.");
                    setShowResendButton(true);
                } else {
                    setError(result.error);
                }
                return;
            }

            // Si todo sale bien, lo mandamos al panel
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 relative">
            {/* Fondo Aurora */}
            <div className="aurora-bg" />

            {/* Formulario */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-white/60 text-center mb-8">
                        Inicia sesión para acceder a tu panel
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                                {error}
                                {showResendButton && (
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className="mt-3 w-full rounded-lg border border-red-400/40 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {resendLoading ? "Reenviando..." : "Reenviar correo de confirmación"}
                                    </button>
                                )}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm">
                                {successMessage}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </button>
                    </form>

                    {/* SECCIÓN DE GOOGLE */}
                    <div className="mt-6 flex items-center justify-between">
                        <span className="border-b border-white/10 w-1/5 lg:w-1/4"></span>
                        <span className="text-xs text-center text-white/40 uppercase">O inicia con</span>
                        <span className="border-b border-white/10 w-1/5 lg:w-1/4"></span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full mt-4 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? "Redirigiendo a Google..." : "Google"}
                    </button>

                    {/* Footer */}
                    <div className="mt-6 text-center text-white/60 text-sm">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="text-white hover:underline">
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
