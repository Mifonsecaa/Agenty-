import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PlannerState } from "@/lib/planner-executor-client";

function baseState(sessionId: string): PlannerState {
  return {
    session_id: sessionId,
    stage: "INIT",
    reservation: {},
    pending_action: "append_row",
    turn: 0,
    reask_count: 0,
    max_reasks: 2,
    committed_operation_ids: [],
    critical_flow: false,
  };
}

function normalizeState(input: unknown, sessionId: string): PlannerState {
  const state = (input && typeof input === "object") ? (input as PlannerState) : {};
  const committed = Array.isArray(state.committed_operation_ids)
    ? state.committed_operation_ids.map((x) => String(x || "")).filter(Boolean).slice(-50)
    : [];

  return {
    ...baseState(sessionId),
    ...state,
    session_id: sessionId,
    committed_operation_ids: committed,
  };
}

async function ensurePlannerSession(params: {
  conversationId: string;
  sessionId: string;
  state: PlannerState;
}) {
  const normalized = normalizeState(params.state, params.sessionId);
  const stage = String(normalized.stage || "INIT");
  const criticalFlow = Boolean(normalized.critical_flow);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "PlannerSession"
        ("id", "conversationId", "sessionId", "stage", "state", "criticalFlow", "updatedAt", "createdAt")
      VALUES
        (${`ps_${params.conversationId}`}, ${params.conversationId}, ${params.sessionId}, ${stage}, ${normalized}::jsonb, ${criticalFlow}, NOW(), NOW())
      ON CONFLICT ("conversationId")
      DO UPDATE SET
        "sessionId" = EXCLUDED."sessionId",
        "stage" = EXCLUDED."stage",
        "state" = EXCLUDED."state",
        "criticalFlow" = EXCLUDED."criticalFlow",
        "updatedAt" = NOW()
    `
  );
}

export async function loadPlannerStatePersistent(conversationId: string, sessionId: string): Promise<PlannerState> {
  const rows = await prisma.$queryRaw<Array<{ state: unknown }>>(
    Prisma.sql`
      SELECT "state"
      FROM "PlannerSession"
      WHERE "conversationId" = ${conversationId}
      LIMIT 1
    `
  );

  const row = rows[0];
  if (!row?.state || typeof row.state !== "object" || Array.isArray(row.state)) {
    return baseState(sessionId);
  }

  return normalizeState(row.state, sessionId);
}

export async function savePlannerStatePersistent(
  conversationId: string,
  sessionId: string,
  state: PlannerState
): Promise<void> {
  await ensurePlannerSession({
    conversationId,
    sessionId,
    state,
  });
}

export async function isPlannerOperationCommitted(conversationId: string, operationId: string): Promise<boolean> {
  const cleanOperationId = String(operationId || "").trim();
  if (!cleanOperationId) return false;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT op."id"
      FROM "PlannerOperation" op
      JOIN "PlannerSession" ps ON ps."id" = op."plannerSessionId"
      WHERE ps."conversationId" = ${conversationId}
        AND op."operationId" = ${cleanOperationId}
      LIMIT 1
    `
  );

  return Boolean(rows[0]?.id);
}

export async function commitPlannerOperation(params: {
  conversationId: string;
  sessionId: string;
  operationId: string;
  payload?: Record<string, unknown>;
  nextState?: PlannerState;
}): Promise<void> {
  const operationId = String(params.operationId || "").trim();
  if (!operationId) return;

  await ensurePlannerSession({
    conversationId: params.conversationId,
    sessionId: params.sessionId,
    state: params.nextState || baseState(params.sessionId),
  });

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id"
      FROM "PlannerSession"
      WHERE "conversationId" = ${params.conversationId}
      LIMIT 1
    `
  );

  const plannerSessionId = rows[0]?.id;
  if (!plannerSessionId) return;

  const payload = (params.payload && typeof params.payload === "object") ? params.payload : {};

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "PlannerOperation"
        ("id", "plannerSessionId", "operationId", "status", "payload", "committedAt")
      VALUES
        (${`po_${plannerSessionId}_${operationId}`.slice(0, 120)}, ${plannerSessionId}, ${operationId}, 'COMMITTED', ${payload}::jsonb, NOW())
      ON CONFLICT ("plannerSessionId", "operationId")
      DO UPDATE SET
        "status" = 'COMMITTED',
        "payload" = EXCLUDED."payload",
        "committedAt" = NOW()
    `
  );
}
