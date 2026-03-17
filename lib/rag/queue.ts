import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { ingestionService } from "@/lib/rag/ingestion";

type EnqueuePayload = {
  businessId: string;
  text: string;
  metadata?: Record<string, unknown>;
};

type QueueJob = {
  id: string;
  businessId: string;
  attempts: number;
  maxAttempts: number;
  payload: EnqueuePayload;
};

const QUEUE_STATUS_ORDER = ["PENDING", "PROCESSING", "RETRY", "COMPLETED", "FAILED", "DLQ"] as const;
const ACTIVE_QUEUE_STATUSES = ["PENDING", "PROCESSING", "RETRY"] as const;

const RETRYABLE_ERROR_MATCHERS = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ENOTFOUND",
  "429",
  "rate limit",
  "temporarily",
  "timeout",
];

function sanitizeText(value: string) {
  // Remove invalid control chars that can break UTF-8 writes.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function buildFingerprint({ businessId, text, metadata }: EnqueuePayload) {
  const normalized = JSON.stringify({
    businessId,
    text: sanitizeText(text).trim(),
    metadata: metadata || {},
  });
  return createHash("sha256").update(normalized).digest("hex");
}

function isMissingQueueTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('relation "KnowledgeIngestionJob" does not exist');
}

function isRetryableError(error: unknown) {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return RETRYABLE_ERROR_MATCHERS.some((matcher) => message.includes(matcher.toLowerCase()));
}

function computeNextRetryDate(attempt: number) {
  const baseMs = 5000;
  const maxMs = 5 * 60 * 1000;
  const expMs = Math.min(baseMs * Math.pow(2, Math.max(0, attempt - 1)), maxMs);
  const jitterMs = Math.floor(Math.random() * 1500);
  return new Date(Date.now() + expMs + jitterMs);
}

function getAgeBucket(createdAt: Date, nowMs: number) {
  const ageMs = nowMs - createdAt.getTime();
  const ageMinutes = ageMs / 60000;

  if (ageMinutes < 5) return "lt5m" as const;
  if (ageMinutes < 30) return "m5To30" as const;
  if (ageMinutes < 120) return "m30To120" as const;
  return "gte120m" as const;
}

export async function enqueueKnowledgeIngestion(payload: EnqueuePayload) {
  const model = (prisma as any).knowledgeIngestionJob;
  const fingerprint = buildFingerprint(payload);

  try {
    const existing = await model.findFirst({
      where: {
        businessId: payload.businessId,
        fingerprint,
        status: { in: ["PENDING", "PROCESSING", "RETRY", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return { job: existing, deduplicated: true, missingQueueTable: false };
    }

    const job = await model.create({
      data: {
        businessId: payload.businessId,
        payload,
        fingerprint,
        status: "PENDING",
        attempts: 0,
        maxAttempts: 3,
        nextRunAt: new Date(),
      },
    });

    return { job, deduplicated: false, missingQueueTable: false };
  } catch (error) {
    if (isMissingQueueTable(error)) {
      return { job: null, deduplicated: false, missingQueueTable: true };
    }
    throw error;
  }
}

export async function getKnowledgeJob(jobId: string) {
  const model = (prisma as any).knowledgeIngestionJob;
  return model.findUnique({ where: { id: jobId } });
}

async function claimNextKnowledgeJob(): Promise<QueueJob | null> {
  const rows = (await prisma.$queryRawUnsafe(
    `
    UPDATE "KnowledgeIngestionJob" j
    SET status = 'PROCESSING',
        "startedAt" = COALESCE(j."startedAt", NOW()),
        "updatedAt" = NOW()
    WHERE j.id = (
      SELECT id
      FROM "KnowledgeIngestionJob"
      WHERE status IN ('PENDING', 'RETRY')
        AND "nextRunAt" <= NOW()
      ORDER BY "nextRunAt" ASC, "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING j.id, j."businessId", j.attempts, j."maxAttempts", j.payload
    `
  )) as Array<{ id: string; businessId: string; attempts: number; maxAttempts: number; payload: EnqueuePayload }>;

  if (!rows?.length) return null;
  return rows[0];
}

export async function processNextKnowledgeJob() {
  const model = (prisma as any).knowledgeIngestionJob;
  const job = await claimNextKnowledgeJob();
  if (!job) {
    return { processed: false as const };
  }

  try {
    const payload = job.payload || { businessId: job.businessId, text: "", metadata: {} };
    const text = sanitizeText(payload.text || "");

    if (!text.trim()) {
      throw new Error("EMPTY_TEXT_PAYLOAD");
    }

    const chunkCount = await ingestionService.ingestText(job.businessId, text, payload.metadata || {});

    await model.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        chunkCount,
        finishedAt: new Date(),
        lastError: null,
      },
    });

    return { processed: true as const, jobId: job.id, status: "COMPLETED", chunkCount };
  } catch (error) {
    const attempt = job.attempts + 1;
    const canRetry = attempt < job.maxAttempts && isRetryableError(error);
    const nextStatus = canRetry ? "RETRY" : "DLQ";

    await model.update({
      where: { id: job.id },
      data: {
        attempts: attempt,
        status: nextStatus,
        lastError: error instanceof Error ? error.message : String(error),
        nextRunAt: canRetry ? computeNextRetryDate(attempt) : new Date(),
        finishedAt: canRetry ? null : new Date(),
      },
    });

    return {
      processed: true as const,
      jobId: job.id,
      status: nextStatus,
      error: error instanceof Error ? error.message : String(error),
      attempt,
    };
  }
}

export async function processKnowledgeQueueBatch(limit = 3) {
  const results: Array<Record<string, unknown>> = [];
  for (let i = 0; i < limit; i++) {
    const result = await processNextKnowledgeJob();
    if (!result.processed) break;
    results.push(result as unknown as Record<string, unknown>);
  }
  return results;
}

export async function getKnowledgeQueueSummary(params?: { businessId?: string }) {
  const model = (prisma as any).knowledgeIngestionJob;
  const where = params?.businessId ? { businessId: params.businessId } : {};

  try {
    const grouped = await model.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });

    const countMap = new Map<string, number>();
    for (const row of grouped as Array<{ status: string; _count: { _all: number } }>) {
      countMap.set(row.status, row._count._all || 0);
    }

    const byStatus = QUEUE_STATUS_ORDER.map((status) => ({
      status,
      count: countMap.get(status) || 0,
    }));

    const activeJobs = await model.findMany({
      where: {
        ...where,
        status: { in: [...ACTIVE_QUEUE_STATUSES] },
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

    const totalsAll = byStatus.reduce((sum, row) => sum + row.count, 0);
    const totalsActive = ACTIVE_QUEUE_STATUSES.reduce((sum, status) => sum + (countMap.get(status) || 0), 0);

    return {
      businessId: params?.businessId,
      totals: {
        all: totalsAll,
        active: totalsActive,
        completed: countMap.get("COMPLETED") || 0,
        failed: countMap.get("FAILED") || 0,
        dlq: countMap.get("DLQ") || 0,
      },
      byStatus,
      ageBuckets,
      oldestActiveCreatedAt: activeJobs[0]?.createdAt?.toISOString() || null,
      missingQueueTable: false,
    };
  } catch (error) {
    if (isMissingQueueTable(error)) {
      return {
        businessId: params?.businessId,
        totals: { all: 0, active: 0, completed: 0, failed: 0, dlq: 0 },
        byStatus: QUEUE_STATUS_ORDER.map((status) => ({ status, count: 0 })),
        ageBuckets: { lt5m: 0, m5To30: 0, m30To120: 0, gte120m: 0 },
        oldestActiveCreatedAt: null,
        missingQueueTable: true,
      };
    }
    throw error;
  }
}

export async function replayKnowledgeJobs(params?: {
  businessId?: string;
  jobId?: string;
  limit?: number;
}) {
  const model = (prisma as any).knowledgeIngestionJob;
  const limit = Math.max(1, Math.min(200, params?.limit ?? 50));

  const candidates = await model.findMany({
    where: {
      ...(params?.businessId ? { businessId: params.businessId } : {}),
      ...(params?.jobId ? { id: params.jobId } : {}),
      status: { in: ["DLQ", "FAILED"] },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  if (!candidates.length) {
    return { count: 0, ids: [] as string[] };
  }

  const ids = candidates.map((job: { id: string }) => job.id);
  const updated = await model.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "RETRY",
      nextRunAt: new Date(),
      finishedAt: null,
    },
  });

  return { count: updated.count as number, ids };
}

