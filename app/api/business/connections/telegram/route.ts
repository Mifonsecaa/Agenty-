// app/api/business/connections/telegram/route.ts
// POST  - Guardar token del bot de Telegram y registrar webhook
// DELETE - Desconectar Telegram

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authorizeBusinessAccessSession } from '@/lib/auth';

type ResolvedWebhookBase = {
  baseUrl: string | null;
  source: string;
};

function normalizeBaseUrl(raw?: string | null) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    // Telegram requiere HTTPS para webhooks.
    if (url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function resolveWebhookBaseUrl(req: NextRequest): Promise<ResolvedWebhookBase> {
  const envCandidates: Array<{ value?: string | null; source: string }> = [
    { value: process.env.PUBLIC_BASE_URL, source: "PUBLIC_BASE_URL" },
    { value: process.env.WEBHOOK_BASE_URL, source: "WEBHOOK_BASE_URL" },
    { value: process.env.NEXTAUTH_URL, source: "NEXTAUTH_URL" },
    { value: process.env.VERCEL_URL, source: "VERCEL_URL" },
  ];

  for (const candidate of envCandidates) {
    const normalized = normalizeBaseUrl(candidate.value);
    if (normalized) {
      return { baseUrl: normalized, source: candidate.source };
    }
  }

  const requestOrigin = normalizeBaseUrl(req.nextUrl.origin);
  if (requestOrigin && !requestOrigin.includes("localhost") && !requestOrigin.includes("127.0.0.1")) {
    return { baseUrl: requestOrigin, source: "request_origin" };
  }

  const ngrokApiBases = [
    process.env.NGROK_API_URL,
    "http://127.0.0.1:4040",
    "http://localhost:4040",
    "http://host.docker.internal:4040",
  ].filter(Boolean) as string[];

  for (const ngrokApiBase of ngrokApiBases) {
    try {
      const apiUrl = ngrokApiBase.endsWith("/api/tunnels") ? ngrokApiBase : `${ngrokApiBase.replace(/\/$/, "")}/api/tunnels`;
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      const tunnels = Array.isArray(data?.tunnels) ? data.tunnels : [];

      const httpsTunnel = tunnels.find((t: any) => {
        const publicUrl = typeof t?.public_url === "string" ? t.public_url : "";
        return publicUrl.startsWith("https://");
      });

      if (httpsTunnel?.public_url) {
        const normalized = normalizeBaseUrl(httpsTunnel.public_url);
        if (normalized) {
          return { baseUrl: normalized, source: `ngrok:${ngrokApiBase}` };
        }
      }
    } catch {
      // Intentamos el siguiente endpoint de ngrok.
    }
  }

  return { baseUrl: null, source: "not_found" };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { businessId, botToken, botUsername } = body;

  if (!businessId || !botToken) {
    return NextResponse.json({ error: "businessId y botToken son requeridos" }, { status: 400 });
  }

    try {
      try {
        await authorizeBusinessAccessSession(session, businessId);
      } catch (authErr: any) {
        return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
      }

    // Validate token with Telegram API
    const testRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const testData = await testRes.json();

    if (!testData.ok) {
      return NextResponse.json(
        { error: "Token de Telegram inválido. Verifica que sea correcto." },
        { status: 400 }
      );
    }

    const resolvedUsername = testData.result?.username || botUsername;
    const resolved = await resolveWebhookBaseUrl(req);

    if (!resolved.baseUrl) {
      return NextResponse.json(
        {
          error: "No se encontró un túnel HTTPS activo de ngrok ni una URL pública configurada.",
          details: "Inicia ngrok y vuelve a intentar. Opcional: define PUBLIC_BASE_URL en .env.",
        },
        { status: 400 }
      );
    }

    const webhookUrl = `${resolved.baseUrl}/api/telegram/webhook?businessId=${businessId}`;
    const webhookRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    const webhookData = await webhookRes.json().catch(() => ({}));

    if (!webhookData.ok) {
      return NextResponse.json(
        {
          error: "No se pudo registrar el webhook en Telegram.",
          details: webhookData?.description || "Error desconocido al registrar webhook",
          webhookUrl,
        },
        { status: 400 }
      );
    }

    // Save to database only after webhook registration succeeds.
    await prisma.business.update({
      where: { id: businessId },
      data: {
        telegramBotToken: botToken,
        telegramBotUsername: resolvedUsername,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Bot @${resolvedUsername} conectado exitosamente`,
      botUsername: resolvedUsername,
      webhookUrl,
      webhookSource: resolved.source,
    });
  } catch (error) {
    console.error("[POST /connections/telegram]", error);
    return NextResponse.json({ error: "Error interno al guardar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { businessId } = await req.json();
  if (!businessId) {
    return NextResponse.json({ error: "businessId requerido" }, { status: 400 });
  }

    try {
      try {
        await authorizeBusinessAccessSession(session, businessId);
      } catch (authErr: any) {
        return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
      }

      const business = await prisma.business.findFirst({
        where: { id: businessId },
        select: { telegramBotToken: true },
      });

      if (!business) {
        return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
      }

    // Delete webhook from Telegram before removing token
    if (business.telegramBotToken) {
      await fetch(`https://api.telegram.org/bot${business.telegramBotToken}/deleteWebhook`).catch(() => {});
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        telegramBotToken: null,
        telegramBotUsername: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /connections/telegram]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
