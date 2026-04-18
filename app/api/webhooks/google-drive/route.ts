import { NextRequest, NextResponse } from "next/server";
import { enqueueKnowledgeIngestion } from "@/lib/rag/queue";

function parseChannelToken(rawToken: string) {
  if (!rawToken) return {} as Record<string, unknown>;

  try {
    if (rawToken.trim().startsWith("{")) {
      return JSON.parse(rawToken) as Record<string, unknown>;
    }

    const decoded = Buffer.from(rawToken, "base64url").toString("utf-8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Google Drive webhook online" });
}

export async function POST(req: NextRequest) {
  try {
    const state = req.headers.get("x-goog-resource-state") || "";
    const channelId = req.headers.get("x-goog-channel-id") || "";
    const resourceId = req.headers.get("x-goog-resource-id") || "";
    const messageNumber = req.headers.get("x-goog-message-number") || "0";
    const tokenHeader = req.headers.get("x-goog-channel-token") || "";

    const token = parseChannelToken(tokenHeader);
    const businessIdFromToken = typeof token.businessId === "string" ? token.businessId : "";
    const parentFolderId = typeof token.parentFolderId === "string" ? token.parentFolderId : "";
    const webhookSecret = typeof token.secret === "string" ? token.secret : "";
    const businessId = businessIdFromToken || req.nextUrl.searchParams.get("businessId") || "";

    const expectedSecret = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET || "";
    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json({ error: "Webhook token invalido" }, { status: 401 });
    }

    if (!businessId) {
      return NextResponse.json({ error: "businessId faltante" }, { status: 400 });
    }

    const enqueue = await enqueueKnowledgeIngestion({
      businessId,
      action: "SYNC_GOOGLE_DRIVE",
      metadata: {
        action: "SYNC_GOOGLE_DRIVE",
        parentFolderId,
        webhook: {
          state,
          channelId,
          resourceId,
          messageNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      queued: !enqueue.deduplicated,
      deduplicated: enqueue.deduplicated,
      jobId: enqueue.job?.id || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error procesando webhook Google Drive" }, { status: 500 });
  }
}

