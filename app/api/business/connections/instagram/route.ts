// app/api/webhooks/instagram/route.ts
// Recibe mensajes entrantes desde Instagram Business y los procesa con el agente

import { NextRequest, NextResponse } from "next/server";
import { sendInstagramMessage } from "@/services/instagram-sender";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { runAgentOrchestrator } from "@/services/agent-orchestrator";
import { aiService } from "@/lib/ai";

// ─── Webhook Verification (GET) ───────────────────────────────────────────────
// Meta sends a GET request to verify the webhook endpoint
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "brainia_webhook_token";

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

        const { conversation } = await getOrCreateInstagramConversation(business.id, senderId);

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "user",
            content: messageText,
          },
        });
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        const historyMessages = await buildConversationMessages(conversation.id);

        let agentResponse = "";
        try {
          agentResponse = await runAgentOrchestrator({
            businessId: business.id,
            channel: "instagram",
            conversationKey: conversation.id,
            customerPhone: senderId,
            messages: historyMessages,
          });
        } catch (orchestratorErr) {
          console.warn("[Instagram Webhook] Orchestrator fallback to aiService:", orchestratorErr);
          agentResponse = await aiService.generateResponse(business.id, [
            { role: "user", content: messageText },
          ]);
        }

        if (agentResponse?.trim()) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: "agent",
              content: agentResponse,
            },
          });
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
          });
        }

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

async function getOrCreateInstagramConversation(businessId: string, senderId: string) {
  let customer = await prisma.customer.findUnique({ where: { phone: senderId } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { phone: senderId, name: "Instagram User" },
    });
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      businessId,
      customerId: customer.id,
      channel: "INSTAGRAM",
      status: { not: "RESOLVED" },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        businessId,
        customerId: customer.id,
        channel: "INSTAGRAM",
        status: "ACTIVE",
      },
    });
  }

  return { customer, conversation };
}

async function buildConversationMessages(conversationId: string) {
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 24,
  });

  return rows.map((row) => {
    if (row.role === "user") return { role: "user" as const, content: row.content || "" };
    if (row.role === "system") return { role: "system" as const, content: row.content || "" };
    return { role: "assistant" as const, content: row.content || "" };
  });
}
