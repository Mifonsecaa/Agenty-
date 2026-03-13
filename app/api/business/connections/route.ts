// app/api/business/connections/route.ts
// GET /api/business/connections?businessId=xxx
// Returns connection status for all platforms

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

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
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: (session.user as any).id },
      select: {
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

    return NextResponse.json({
      whatsapp: !!(business.whatsappPhoneNumberId && business.whatsappAccessToken),
      telegram: !!business.telegramBotToken,
      instagram: !!(business.instagramPageId && business.instagramAccessToken),
    });
  } catch (error) {
    console.error("[GET /connections]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
