"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  startedAtMs: number;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
  startedAtMs: Date.now(),
};

export default function HelpPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (key: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 429) {
          setError("Has enviado varias solicitudes seguidas. Espera un momento e inténtalo de nuevo.");
          return;
        }
        setError(data?.error || "No pudimos enviar tu solicitud. Intenta de nuevo.");
        return;
      }

      setSuccess(data?.data?.message || "Tu mensaje fue enviado correctamente.");
      setForm({ ...initialState, startedAtMs: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 relative">
      <div className="aurora-bg" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Centro de Ayuda</h1>
          <p className="text-white/60 text-center mb-8">
            Cuéntanos qué necesitas y el equipo de desarrollo te responderá por correo.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <input
              type="text"
              value={form.website}
              onChange={(e) => onChange("website", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <input
              type="hidden"
              value={form.startedAtMs}
              readOnly
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                Asunto
              </label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => onChange("subject", e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Resumen corto de tu solicitud"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                ¿Qué necesitas?
              </label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none"
                placeholder="Describe tu caso para ayudarte mejor..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Enviando solicitud..." : "Enviar solicitud"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

