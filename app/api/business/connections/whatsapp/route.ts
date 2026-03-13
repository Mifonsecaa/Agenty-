// app/api/business/connections/whatsapp/route.ts
// POST  - Guardar credenciales de WhatsApp
// DELETE - Desconectar WhatsApp

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { businessId, phoneNumberId, accessToken, webhookVerifyToken } = body;

  if (!businessId || !phoneNumberId || !accessToken || !webhookVerifyToken) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  try {
    // Verify the business belongs to this user
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: (session.user as any).id },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    // Validate the token with Meta's API before saving
    const testRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}?access_token=${accessToken}`
    );
    if (!testRes.ok) {
      return NextResponse.json(
        { error: "Credenciales de WhatsApp inválidas. Verifica tu Phone Number ID y Access Token." },
        { status: 400 }
      );
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        whatsappPhoneNumberId: phoneNumberId,
        whatsappAccessToken: accessToken,
        whatsappWebhookVerifyToken: webhookVerifyToken,
      },
    });

    // Register webhook with Meta
    try {
      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;

      if (appId && appSecret && baseUrl) {
        await fetch(
          `https://graph.facebook.com/v19.0/${appId}/subscriptions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              object: "whatsapp_business_account",
              callback_url: `${baseUrl}/api/webhooks/whatsapp`,
              verify_token: webhookVerifyToken,
              fields: ["messages"],
              access_token: `${appId}|${appSecret}`,
            }),
          }
        );
      }
    } catch (webhookErr) {
      console.warn("[WhatsApp] Webhook registration warning:", webhookErr);
      // Non-fatal: user can configure webhook manually
    }

    return NextResponse.json({ success: true, message: "WhatsApp conectado exitosamente" });
  } catch (error) {
    console.error("[POST /connections/whatsapp]", error);
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
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        whatsappPhoneNumberId: null,
        whatsappAccessToken: null,
        whatsappWebhookVerifyToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /connections/whatsapp]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
