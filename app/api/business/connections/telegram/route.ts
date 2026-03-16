// app/api/business/connections/telegram/route.ts
// POST  - Guardar token del bot de Telegram y registrar webhook
// DELETE - Desconectar Telegram

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { businessId, botToken, botUsername } = body;

  if (!businessId || !botToken) {
    return NextResponse.json({ error: "businessId y botToken son requeridos" }, { status: 400 });
  }

  try {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: (session.user as any).id },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
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

    // Save to database
    await prisma.business.update({
      where: { id: businessId },
      data: {
        telegramBotToken: botToken,
        telegramBotUsername: resolvedUsername,
      },
    });

    // Register webhook with Telegram
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    if (baseUrl) {
      const webhookRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `${baseUrl}/api/telegram/webhook?businessId=${businessId}`,
          allowed_updates: ["message", "callback_query"],
        }),
      });
      const webhookData = await webhookRes.json();

      if (!webhookData.ok) {
        console.warn("[Telegram] Webhook registration failed:", webhookData.description);
        // Still save the token — user might be on localhost
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bot @${resolvedUsername} conectado exitosamente`,
      botUsername: resolvedUsername,
    });
  } catch (error) {
    console.error("[POST /connections/telegram]", error);
    return NextResponse.json({ error: "Error interno al guardar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { businessId } = await req.json();
  if (!businessId) {
    return NextResponse.json({ error: "businessId requerido" }, { status: 400 });
  }

  try {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: (session.user as any).id },
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
