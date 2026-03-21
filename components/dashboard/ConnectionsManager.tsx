"use client";

import { useState, useEffect } from "react";
import ActionConfirmationPanel from "@/components/dashboard/ActionConfirmationPanel";
import { useSearchParams } from "next/navigation";
import { getDashboardCopy } from "@/components/dashboard/dashboardCopy";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "whatsapp" | "telegram" | "instagram";

interface ConnectionStatus {
  whatsapp: boolean;
  telegram: boolean;
  instagram: boolean;
}

interface ModalState {
  platform: Platform | null;
  open: boolean;
}

// ─── Platform Config ──────────────────────────────────────────────────────────
const PLATFORMS = {
  whatsapp: {
    name: "WhatsApp",
    color: "#25D366",
    bg: "rgba(37,211,102,0.08)",
    border: "rgba(37,211,102,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.072 23.927l6.244-1.437A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.374-.222-3.868.89.924-3.768-.243-.387A9.932 9.932 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    ),
    description: "Conecta tu WhatsApp escaneando un QR. Sin configuración técnica.",
    fields: [],
    docsUrl: "#",
    webhookPath: "/api/whatsapp/webhook",
  },
  telegram: {
    name: "Telegram",
    color: "#229ED9",
    bg: "rgba(34,158,217,0.08)",
    border: "rgba(34,158,217,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    description: "Conecta un bot de Telegram usando el token que te da @BotFather.",
    fields: [
      { key: "botToken", label: "Bot Token", placeholder: "1234567890:AAF...", type: "password" },
      { key: "botUsername", label: "Username del Bot", placeholder: "@mi_agente_bot", type: "text" },
    ],
    docsUrl: "https://core.telegram.org/bots/tutorial",
    webhookPath: "/api/telegram/webhook",
  },
  instagram: {
    name: "Instagram",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    description: "Conecta tu cuenta de Instagram Business mediante la API de Meta (Messenger Platform).",
    fields: [
      { key: "pageId", label: "Instagram Page ID", placeholder: "ej. 123456789", type: "text" },
      { key: "accessToken", label: "Access Token de Página", placeholder: "EAABs...", type: "password" },
      { key: "appSecret", label: "App Secret", placeholder: "tu_app_secret", type: "password" },
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login",
    webhookPath: "/api/webhooks/instagram",
  },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: connected ? "rgba(74,222,128,0.12)" : "rgba(148,163,184,0.1)",
        color: connected ? "#4ade80" : "#94a3b8",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: connected ? "#4ade80" : "#475569", boxShadow: connected ? "0 0 6px #4ade80" : "none" }}
      />
      {connected ? "Conectado" : "Sin conectar"}
    </span>
  );
}

function ConnectionModal({
  platform,
  businessId,
  onClose,
  onSave,
  onConnected,
}: {
  platform: Platform;
  businessId: string;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<any>;
  onConnected: (platform: Platform) => void;
}) {
  const config = PLATFORMS[platform];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waState, setWaState] = useState<"IDLE" | "INITIALIZING" | "READY" | "CONNECTED" | "ERROR">("IDLE");
  const [waMessage, setWaMessage] = useState("");

  const isWhatsAppQrFlow = platform === "whatsapp";
  const qrSrc = qrCode ? (qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`) : null;

  const syncWhatsAppConnectResult = (data: any) => {
    if (data.state === "CONNECTED") {
      setWaState("CONNECTED");
      setWaMessage("WhatsApp conectado correctamente.");
      onConnected("whatsapp");
      setTimeout(() => onClose(), 900);
      return;
    }

    if (data.state === "READY" && data.qrcode) {
      setQrCode(data.qrcode);
      setWaState("READY");
      setWaMessage("Escanea este QR con tu WhatsApp.");
      return;
    }

    setWaState("INITIALIZING");
    setWaMessage(data?.message || "Inicializando conexión...");
  };

  const pollWhatsAppStatus = async () => {
    const res = await fetch(`/api/whatsapp/connect?agentId=${businessId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    if (data.state === "CONNECTED") {
      setWaState("CONNECTED");
      setWaMessage("WhatsApp conectado correctamente.");
      onConnected("whatsapp");
      setTimeout(() => onClose(), 900);
    }
  };

  const refreshWhatsAppQr = async () => {
    const res = await fetch("/api/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: businessId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || "No se pudo regenerar el QR de WhatsApp.");
    }

    syncWhatsAppConnectResult(data);
  };

  const startWhatsAppQrFlow = async () => {
    setWaState("INITIALIZING");
    setWaMessage("Generando QR...");
    setQrCode(null);
    await refreshWhatsAppQr();
  };

  useEffect(() => {
    if (!isWhatsAppQrFlow || (waState !== "READY" && waState !== "INITIALIZING")) return;
    const timer = setInterval(() => {
      void pollWhatsAppStatus();

      // Si Evolution aún está iniciando y no hay QR visible, reintentamos obtenerlo.
      if (waState === "INITIALIZING" && !qrCode) {
        void refreshWhatsAppQr().catch((err) => {
          console.warn("[ConnectionsManager] QR refresh warning:", err);
        });
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [isWhatsAppQrFlow, waState, qrCode]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (isWhatsAppQrFlow) {
        await startWhatsAppQrFlow();
      } else {
        await onSave(formData);
        onClose();
      }
    } catch (e: any) {
      if (isWhatsAppQrFlow) setWaState("ERROR");
      setError(e.message || "Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const allFilled = isWhatsAppQrFlow ? true : config.fields.every((f) => formData[f.key]?.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #0f172a, #1e293b)",
          border: `1px solid ${config.border}`,
          boxShadow: `0 0 60px ${config.color}15`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
            >
              {config.icon}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Conectar {config.name}</h2>
              <p className="text-slate-400 text-xs">{config.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isWhatsAppQrFlow && (
          <div
            className="rounded-xl p-3 mb-5"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <p className="text-xs text-slate-400 mb-1 font-medium">URL de Webhook a configurar en la plataforma:</p>
            <code className="text-indigo-400 text-xs break-all">
              {typeof window !== "undefined" ? window.location.origin : "https://tu-dominio.com"}
              {config.webhookPath}
            </code>
          </div>
        )}

        {!isWhatsAppQrFlow && (
          <div className="space-y-4 mb-5">
            {config.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                  style={{
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(148,163,184,0.15)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = config.color + "80")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.15)")}
                />
                {field.type === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPasswords[field.key] ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            ))}
          </div>
        )}

        {isWhatsAppQrFlow && (
          <div className="mb-5 rounded-xl p-4" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(37,211,102,0.2)" }}>
            <p className="text-sm text-slate-300 mb-3">Pulsa en <strong>Generar QR</strong>, escanea con tu WhatsApp y listo.</p>
            {waMessage && <p className="text-xs text-slate-400 mb-3">{waMessage}</p>}
            {qrSrc && (
              <div className="rounded-lg bg-white p-3 inline-block">
                <img src={qrSrc} alt="QR WhatsApp" className="w-56 h-56 object-contain" />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {!isWhatsAppQrFlow ? (
            <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
              Ver documentación →
            </a>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(148,163,184,0.08)" }}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!allFilled || saving || waState === "CONNECTED"}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: allFilled && !saving ? config.color : "#334155" }}
            >
              {saving ? "Conectando..." : isWhatsAppQrFlow ? (waState === "READY" ? "Regenerar QR" : waState === "CONNECTED" ? "Conectado" : "Generar QR") : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConnectionsManager({ businessId }: { businessId: string }) {
  const searchParams = useSearchParams();
  const copy = getDashboardCopy(searchParams.get("lang") || undefined);

  const [status, setStatus] = useState<ConnectionStatus>({ whatsapp: false, telegram: false, instagram: false });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ platform: null, open: false });
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);
  const [pendingDisconnectPlatform, setPendingDisconnectPlatform] = useState<Platform | null>(null);

  // Fetch connection status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/business/connections?businessId=${businessId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Error fetching connection status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [businessId]);

  const handleSave = async (platform: Platform, formData: Record<string, string>) => {
    if (platform === "whatsapp") {
      return { success: true };
    }

    const res = await fetch(`/api/business/connections/${platform}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...formData }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.details ? `${data.error || "Error al guardar"} ${data.details}` : (data?.error || "Error al guardar");
      throw new Error(message);
    }

    setStatus((p) => ({ ...p, [platform]: true }));

    if (platform === "telegram" && data?.webhookUrl) {
      console.log(`[Telegram] Webhook configurado en: ${data.webhookUrl} (${data?.webhookSource || "unknown"})`);
    }

    return data;
  };

  const handleDisconnect = async (platform: Platform) => {
    setDisconnecting(platform);
    try {
      const res = await fetch(`/api/business/connections/${platform}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (res.ok) setStatus((p) => ({ ...p, [platform]: false }));
    } catch (err) {
      console.error(copy.connections.disconnectError, err);
    } finally {
      setDisconnecting(null);
    }
  };

  const openDisconnectConfirm = (platform: Platform) => {
    if (disconnecting) return;
    setPendingDisconnectPlatform(platform);
  };

  const closeDisconnectConfirm = () => {
    if (disconnecting) return;
    setPendingDisconnectPlatform(null);
  };

  const confirmDisconnect = async () => {
    if (!pendingDisconnectPlatform) return;
    await handleDisconnect(pendingDisconnectPlatform);
    setPendingDisconnectPlatform(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl">Canales de Comunicacion</h2>
        <p className="text-slate-400 text-sm mt-1">Conecta tu agente a las plataformas donde estan tus clientes.</p>
      </div>

      <div className="grid gap-4">
        {(Object.keys(PLATFORMS) as Platform[]).map((platform) => {
          const config = PLATFORMS[platform];
          const isConnected = status[platform];
          const isDisconnecting = disconnecting === platform;

          return (
            <div
              key={platform}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: isConnected ? config.bg : "rgba(15,23,42,0.5)",
                border: `1px solid ${isConnected ? config.border : "rgba(148,163,184,0.1)"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isConnected ? config.bg : "rgba(30,41,59,0.8)",
                      color: isConnected ? config.color : "#475569",
                      border: `1px solid ${isConnected ? config.border : "rgba(71,85,105,0.3)"}`,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-semibold">{config.name}</span>
                      {!loading && <StatusBadge connected={isConnected} />}
                    </div>
                    <p className="text-slate-500 text-xs max-w-xs">{config.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {loading ? (
                    <div className="w-20 h-8 rounded-lg animate-pulse" style={{ background: "rgba(148,163,184,0.1)" }} />
                  ) : isConnected ? (
                    <>
                      <button
                        onClick={() => setModal({ platform, open: true })}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all"
                        style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.15)" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDisconnectConfirm(platform)}
                        disabled={isDisconnecting}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        {isDisconnecting ? "..." : "Desconectar"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setModal({ platform, open: true })}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: config.color }}
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>

              {isConnected && (
                <div
                  className="mt-4 pt-4 flex items-center gap-2 text-xs text-slate-500"
                  style={{ borderTop: `1px solid ${config.border}` }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Webhook activo en
                  <code className="text-slate-400">{config.webhookPath}</code>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pendingDisconnectPlatform && (
        <ActionConfirmationPanel
          message={copy.connections.disconnectConfirm(PLATFORMS[pendingDisconnectPlatform].name)}
          details={copy.connections.disconnectDetails}
          confirmLabel={copy.confirmation.labels.disconnect}
          cancelLabel={copy.confirmation.cancel}
          isLoading={disconnecting === pendingDisconnectPlatform}
          onCancel={closeDisconnectConfirm}
          onConfirm={() => {
            void confirmDisconnect();
          }}
        />
      )}

      {modal.open && modal.platform && (
        <ConnectionModal
          platform={modal.platform}
          businessId={businessId}
          onClose={() => setModal({ platform: null, open: false })}
          onSave={(data) => handleSave(modal.platform!, data)}
          onConnected={(platform) => setStatus((prev) => ({ ...prev, [platform]: true }))}
        />
      )}
    </div>
  );
}
