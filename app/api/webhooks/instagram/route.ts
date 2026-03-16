// app/api/webhooks/instagram/route.ts
// Recibe mensajes entrantes desde Instagram Business y los procesa con el agente

import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/services/agent-execution";
import { sendInstagramMessage } from "@/services/instagram-sender";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ─── Webhook Verification (GET) ───────────────────────────────────────────────
// Meta sends a GET request to verify the webhook endpoint
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "agenty_webhook_token";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Instagram Webhook] Verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ─── Message Handler (POST) ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify signature from Meta
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifySignature(body, signature)) {
    console.warn("[Instagram Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Instagram messages come under the "instagram" object
  if (payload.object !== "instagram") {
    return NextResponse.json({ ok: true });
  }

  for (const entry of payload.entry || []) {
    const pageId = entry.id;

    for (const messagingEvent of entry.messaging || []) {
      const senderId = messagingEvent.sender?.id;
      const messageText = messagingEvent.message?.text;

      // Skip messages sent by the page itself (echoes)
      if (senderId === pageId) continue;
      if (!messageText) continue;

      try {
        const business = await prisma.business.findFirst({
          where: { instagramPageId: pageId },
          select: {
            id: true,
            instagramAccessToken: true,
          },
        });

        if (!business || !business.instagramAccessToken) {
          console.warn(`[Instagram Webhook] No business found for pageId: ${pageId}`);
          continue;
        }

        // Execute the AI agent
        const agentResponse = await executeAgent({
          businessId: business.id,
          platform: "instagram",
          userId: senderId,
          message: messageText,
          metadata: { pageId, senderId },
        });

        // Send response back to Instagram
        await sendInstagramMessage({
          accessToken: business.instagramAccessToken,
          recipientId: senderId,
          text: agentResponse,
        });
      } catch (error) {
        console.error(`[Instagram Webhook] Error processing message:`, error);
      }
    }
  }

  // Always return 200 quickly
  return NextResponse.json({ ok: true });
}

// ─── Signature Verification ───────────────────────────────────────────────────
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.warn("[Instagram Webhook] META_APP_SECRET not set, skipping signature check");
    return true; // Allow in dev without secret
  }

  const expectedSig = "sha256=" + crypto.createHmac("sha256", appSecret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}
