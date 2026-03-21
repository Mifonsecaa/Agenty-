// app/api/business/connections/route.ts
// GET /api/business/connections?businessId=xxx
// Returns connection status for all platforms

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { evolutionService } from "@/services/whatsapp/evolution";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId requerido" }, { status: 400 });
  }

  try {
    const userEmail = typeof session.user.email === "string" ? session.user.email : "";
    if (!userEmail) {
      return NextResponse.json({ error: "Sesion sin email" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id },
      select: {
        id: true,
        whatsappPhoneNumberId: true,
        whatsappAccessToken: true,
        telegramBotToken: true,
        instagramPageId: true,
        instagramAccessToken: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    let whatsappByQr = false;
    try {
      const evolutionState = await evolutionService.getInstanceStatus(business.id, { timeoutMs: 1200 });
      whatsappByQr = evolutionState?.instance?.state === "open";
    } catch (err) {
      console.warn("[GET /connections] No se pudo consultar estado QR de WhatsApp:", err);
    }

    return NextResponse.json({
      whatsapp: whatsappByQr || !!(business.whatsappPhoneNumberId && business.whatsappAccessToken),
      telegram: !!business.telegramBotToken,
      instagram: !!(business.instagramPageId && business.instagramAccessToken),
    });
  } catch (error) {
    console.error("[GET /connections]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
