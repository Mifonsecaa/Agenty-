import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorizeBusinessAccessSession } from "@/lib/auth";

function encodeState(state: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = req.nextUrl.searchParams.get("businessId") || "";
    const tool = req.nextUrl.searchParams.get("tool") || "google-calendar";
    if (!businessId) {
      return NextResponse.json({ error: "businessId requerido" }, { status: 400 });
    }

    await authorizeBusinessAccessSession(session, businessId);

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || `${req.nextUrl.origin}/api/integrations/google-drive/callback`;

    if (!clientId) {
      return NextResponse.json({ error: "Falta GOOGLE_DRIVE_CLIENT_ID o GOOGLE_CLIENT_ID" }, { status: 500 });
    }

    const state = encodeState({
      businessId,
      tool,
      userId: session.user.id,
      t: Date.now(),
    });

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("include_granted_scopes", "true");
    authUrl.searchParams.set("state", state);


    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error iniciando OAuth de Google Drive" }, { status: 500 });
  }
}

//ojala funciione
