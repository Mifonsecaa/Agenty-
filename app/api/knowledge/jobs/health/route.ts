import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authorizeBusinessAccessSession } from '@/lib/auth';

const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "RETRY"] as const;

function hasValidWorkerToken(req: Request) {
  const workerToken = process.env.KNOWLEDGE_WORKER_TOKEN;
  if (!workerToken) return false;
  const incoming = req.headers.get("x-worker-token");
  return incoming === workerToken;
}

function deriveHealthStatus(summary: {
  totals: { dlq: number };
  ageBuckets: { gte120m: number };
}) {
  // Conservative defaults: DLQ or very old active jobs means degraded.
  if (summary.totals.dlq > 0) return "degraded" as const;
  if (summary.ageBuckets.gte120m > 0) return "degraded" as const;
  return "ok" as const;
}

function getAgeBucket(createdAt: Date, nowMs: number) {
  const ageMs = nowMs - createdAt.getTime();
  const ageMinutes = ageMs / 60000;

  if (ageMinutes < 5) return "lt5m" as const;
  if (ageMinutes < 30) return "m5To30" as const;
  if (ageMinutes < 120) return "m30To120" as const;
  return "gte120m" as const;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const businessId = url.searchParams.get("businessId") || undefined;

    const workerAuthorized = hasValidWorkerToken(req);

    if (!workerAuthorized) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!businessId) {
        return NextResponse.json({ error: "businessId es requerido sin token de worker" }, { status: 400 });
      }

      try {
        await authorizeBusinessAccessSession(session, businessId as string);
      } catch (authErr: any) {
        return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
      }
    }

    const model = (prisma as any).knowledgeIngestionJob;
    if (!model || typeof model.groupBy !== "function" || typeof model.findMany !== "function") {
      const fallbackSummary = {
        totals: { all: 0, active: 0, completed: 0, failed: 0, dlq: 0 },
        ageBuckets: { lt5m: 0, m5To30: 0, m30To120: 0, gte120m: 0 },
        oldestActiveCreatedAt: null as string | null,
      };

      return NextResponse.json({
        success: true,
        data: {
          businessId,
          health: "degraded",
          backlog: 0,
          dlq: 0,
          failed: 0,
          oldestActiveCreatedAt: null,
          ageBuckets: fallbackSummary.ageBuckets,
          totals: fallbackSummary.totals,
          reason: "knowledge_queue_model_unavailable",
        },
        generatedAt: new Date().toISOString(),
      });
    }

    const where = businessId ? { businessId } : {};

    const grouped = await model.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });

    const countMap = new Map<string, number>();
    for (const row of grouped as Array<{ status: string; _count: { _all: number } }>) {
      countMap.set(row.status, row._count._all || 0);
    }

    const activeJobs = await model.findMany({
      where: {
        ...where,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 2000,
    });

    const nowMs = Date.now();
    const ageBuckets = {
      lt5m: 0,
      m5To30: 0,
      m30To120: 0,
      gte120m: 0,
    };

    for (const job of activeJobs as Array<{ createdAt: Date }>) {
      const bucket = getAgeBucket(job.createdAt, nowMs);
      ageBuckets[bucket] += 1;
    }

    const summary = {
      totals: {
        all: (countMap.get("PENDING") || 0) + (countMap.get("PROCESSING") || 0) + (countMap.get("RETRY") || 0) + (countMap.get("COMPLETED") || 0) + (countMap.get("FAILED") || 0) + (countMap.get("DLQ") || 0),
        active: (countMap.get("PENDING") || 0) + (countMap.get("PROCESSING") || 0) + (countMap.get("RETRY") || 0),
        completed: countMap.get("COMPLETED") || 0,
        failed: countMap.get("FAILED") || 0,
        dlq: countMap.get("DLQ") || 0,
      },
      ageBuckets,
      oldestActiveCreatedAt: activeJobs[0]?.createdAt?.toISOString() || null,
    };
    const health = deriveHealthStatus(summary);

    const response = {
      success: true,
      data: {
        businessId,
        health,
        backlog: summary.totals.active,
        dlq: summary.totals.dlq,
        failed: summary.totals.failed,
        oldestActiveCreatedAt: summary.oldestActiveCreatedAt,
        ageBuckets: summary.ageBuckets,
        totals: summary.totals,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Knowledge Queue Health] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

