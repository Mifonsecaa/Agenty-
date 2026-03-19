import { NextResponse } from "next/server";
import { processAudioTranscriptionBatch } from "@/services/ai/transcription-queue";
import { incrementOpsCounter, recordOpsDuration } from "@/lib/observability/ops-metrics";

function isAuthorized(req: Request) {
  const workerToken = process.env.TRANSCRIPTION_WORKER_TOKEN;
  if (!workerToken) return true;
  const incoming = req.headers.get("x-worker-token");
  return incoming === workerToken;
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    if (!isAuthorized(req)) {
      incrementOpsCounter("transcription.worker.unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const limitRaw = typeof body?.limit === "number" ? body.limit : 3;
    const limit = Math.max(1, Math.min(20, limitRaw));

    const processed = await processAudioTranscriptionBatch(limit);

    incrementOpsCounter("transcription.worker.process_requests");
    incrementOpsCounter("transcription.worker.jobs_processed", processed.length);
    recordOpsDuration("transcription.worker.request_latency_ms", Date.now() - startedAt);

    return NextResponse.json({
      success: true,
      processedCount: processed.length,
      processed,
    });
  } catch (error) {
    console.error("[Transcription Worker API] Error:", error);
    incrementOpsCounter("transcription.worker.error");
    recordOpsDuration("transcription.worker.error_latency_ms", Date.now() - startedAt);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

