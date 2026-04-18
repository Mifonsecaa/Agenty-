import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorizeBusinessAccessSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveGoogleDriveTokensForBusiness } from "@/services/google-drive";

function decodeState(value: string) {
  try {
    const raw = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const TOOL_ID_BY_SLUG: Record<string, number> = {
  "google-calendar": 1,
  "knowledge-excel-viewer": 5,
};

export async function GET(req: NextRequest) {
  const dashboardUrl = new URL("/dashboard/tools", req.nextUrl.origin);

  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.email || !session?.user?.id) {
      dashboardUrl.searchParams.set("googleDrive", "unauthorized");
      return NextResponse.redirect(dashboardUrl);
    }

    const code = req.nextUrl.searchParams.get("code") || "";
    const stateRaw = req.nextUrl.searchParams.get("state") || "";
    const state = decodeState(stateRaw);

    const businessId = typeof state?.businessId === "string" ? state.businessId : "";
    const tool = typeof state?.tool === "string" ? state.tool : "google-calendar";
    const stateUserId = typeof state?.userId === "string" ? state.userId : "";

    if (!code || !businessId || !stateUserId || stateUserId !== session.user.id) {
      dashboardUrl.searchParams.set("googleDrive", "invalid_state");
      return NextResponse.redirect(dashboardUrl);
    }

    await authorizeBusinessAccessSession(session, businessId);

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || `${req.nextUrl.origin}/api/integrations/google-drive/callback`;

    if (!clientId || !clientSecret) {
      dashboardUrl.searchParams.set("googleDrive", "oauth_not_configured");
      return NextResponse.redirect(dashboardUrl);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenRes.json().catch(() => ({} as any));
    if (!tokenRes.ok || !tokenData?.access_token) {
      dashboardUrl.searchParams.set("googleDrive", "token_error");
      return NextResponse.redirect(dashboardUrl);
    }

    const expiresIn = Number(tokenData.expires_in || 3600);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    await saveGoogleDriveTokensForBusiness(businessId, {
      accessToken: String(tokenData.access_token),
      refreshToken: typeof tokenData.refresh_token === "string" ? tokenData.refresh_token : undefined,
      expiresAt,
      scope: typeof tokenData.scope === "string" ? tokenData.scope : undefined,
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { config: true },
    });

    const rawConfig = business?.config && typeof business.config === "object" && !Array.isArray(business.config)
      ? (business.config as Record<string, unknown>)
      : {};

    const existingRecommended = Array.isArray(rawConfig.recommendedTools)
      ? rawConfig.recommendedTools.filter((x) => Number.isFinite(Number(x))).map((x) => Number(x))
      : [];

    const toolId = TOOL_ID_BY_SLUG[tool] || TOOL_ID_BY_SLUG["google-calendar"];
    const recommendedTools = Array.from(new Set([...existingRecommended, toolId]));

    await prisma.business.update({
      where: { id: businessId },
      data: {
        config: {
          ...rawConfig,
          recommendedTools,
        },
      },
    });

    dashboardUrl.searchParams.set("googleDrive", "connected");
    dashboardUrl.searchParams.set("tool", tool);
    return NextResponse.redirect(dashboardUrl);
  } catch {
    dashboardUrl.searchParams.set("googleDrive", "error");
    return NextResponse.redirect(dashboardUrl);
  }
}

