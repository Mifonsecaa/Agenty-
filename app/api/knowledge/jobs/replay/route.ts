import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function hasValidWorkerToken(req: Request) {
  const workerToken = process.env.KNOWLEDGE_WORKER_TOKEN;
  if (!workerToken) return false;
  const incoming = req.headers.get("x-worker-token");
  return incoming === workerToken;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessId = typeof body.businessId === "string" ? body.businessId : undefined;
    const jobId = typeof body.jobId === "string" ? body.jobId : undefined;
    const limit = typeof body.limit === "number" ? body.limit : undefined;

    const workerAuthorized = hasValidWorkerToken(req);

    if (!workerAuthorized) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!businessId && !jobId) {
        return NextResponse.json(
          { error: "Debes enviar businessId o jobId para reintentar sin token de worker" },
          { status: 400 }
        );
      }

      if (businessId) {
        const business = await prisma.business.findFirst({
          where: { id: businessId, user: { email: session.user.email } },
          select: { id: true },
        });

        if (!business) {
          return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }
      }

      if (jobId && !businessId) {
        const model = (prisma as any).knowledgeIngestionJob;
        const job = await model.findUnique({ where: { id: jobId }, select: { businessId: true } });
        if (!job) {
          return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        const business = await prisma.business.findFirst({
          where: { id: job.businessId, user: { email: session.user.email } },
          select: { id: true },
        });

        if (!business) {
          return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }
      }
    }

    const model = (prisma as any).knowledgeIngestionJob;
    const safeLimit = Math.max(1, Math.min(200, limit ?? 50));
    const candidates = await model.findMany({
      where: {
        ...(businessId ? { businessId } : {}),
        ...(jobId ? { id: jobId } : {}),
        status: { in: ["DLQ", "FAILED"] },
      },
      orderBy: { createdAt: "asc" },
      take: safeLimit,
      select: { id: true },
    });

    const ids = candidates.map((job: { id: string }) => job.id);
    let replayedCount = 0;

    if (ids.length > 0) {
      const updated = await model.updateMany({
        where: { id: { in: ids } },
        data: {
          status: "RETRY",
          nextRunAt: new Date(),
          finishedAt: null,
        },
      });
      replayedCount = updated.count;
    }

    const response = {
      success: true,
      replayedCount,
      replayedIds: ids,
      businessId,
      jobId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Knowledge Jobs Replay] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

