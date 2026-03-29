import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOpsMetricsSnapshot } from "@/lib/observability/ops-metrics";

function hasValidWorkerToken(req: Request) {
  const incoming = req.headers.get("x-worker-token");
  if (!incoming) return false;

  const allowedTokens = [process.env.KNOWLEDGE_WORKER_TOKEN, process.env.TRANSCRIPTION_WORKER_TOKEN]
    .filter((token): token is string => Boolean(token));

  return allowedTokens.includes(incoming);
}

export async function GET(req: Request) {
  try {
    const workerAllowed = hasValidWorkerToken(req);
    if (!workerAllowed) {
      const session = await getServerSession(authOptions) as any;
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json({
      success: true,
      data: getOpsMetricsSnapshot(),
    });
  } catch (error) {
    console.error("[Ops Metrics] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

