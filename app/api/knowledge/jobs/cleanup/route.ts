import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authorizeBusinessAccessSession } from '@/lib/auth';

function hasValidWorkerToken(req: Request) {
  const workerToken = process.env.KNOWLEDGE_WORKER_TOKEN;
  if (!workerToken) return false;
  const incoming = req.headers.get("x-worker-token");
  return incoming === workerToken;
}

function resolveRetentionDays(input: unknown) {
  const value = typeof input === "number" ? input : Number(input ?? 14);
  if (!Number.isFinite(value)) return 14;
  return Math.max(1, Math.min(365, Math.floor(value)));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessId = typeof body.businessId === "string" ? body.businessId : undefined;
    const retentionDays = resolveRetentionDays(body.retentionDays);

    const workerAuthorized = hasValidWorkerToken(req);

    if (!workerAuthorized) {
      const session = await getServerSession(authOptions) as any;
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Without worker token, cleanup must be scoped to one owned business.
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

    const model = (prisma as any).knowledgeIngestionJob;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await model.deleteMany({
      where: {
        ...(businessId ? { businessId } : {}),
        status: { in: ["COMPLETED", "FAILED", "DLQ"] },
        OR: [
          { finishedAt: { not: null, lt: cutoff } },
          { finishedAt: null, createdAt: { lt: cutoff } },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      retentionDays,
      businessId,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    console.error("[Knowledge Jobs Cleanup] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

