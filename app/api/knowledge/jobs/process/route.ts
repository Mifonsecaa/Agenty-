import { NextResponse } from "next/server";
import { processKnowledgeQueueBatch } from "@/lib/rag/queue";

function isAuthorized(req: Request) {
  const workerToken = process.env.KNOWLEDGE_WORKER_TOKEN;
  if (!workerToken) return true;
  const incoming = req.headers.get("x-worker-token");
  return incoming === workerToken;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const limitRaw = typeof body?.limit === "number" ? body.limit : 3;
    const limit = Math.max(1, Math.min(20, limitRaw));

    const processed = await processKnowledgeQueueBatch(limit);

    return NextResponse.json({
      success: true,
      processedCount: processed.length,
      processed,
    });
  } catch (error) {
    console.error("[Knowledge Worker API] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

