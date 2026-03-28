import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getKnowledgeQueueSummary } from "@/lib/rag/queue";
import { authorizeBusinessAccessSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const businessId = url.searchParams.get("businessId") || undefined;

    const workerToken = process.env.KNOWLEDGE_WORKER_TOKEN;
    const incomingWorkerToken = req.headers.get("x-worker-token");
    const workerAuthorized = Boolean(workerToken && incomingWorkerToken === workerToken);

    if (!workerAuthorized) {
      const session = await getServerSession(authOptions) as any;
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!businessId) {
        return NextResponse.json(
          { error: "businessId es requerido sin token de worker" },
          { status: 400 }
        );
      }

      try {
        await authorizeBusinessAccessSession(session, businessId as string);
      } catch (authErr: any) {
        return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
      }
    }

    const summary = await getKnowledgeQueueSummary({ businessId });

    const response = {
      success: true,
      data: summary,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Knowledge Queue Summary] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

