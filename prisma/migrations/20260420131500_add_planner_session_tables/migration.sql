-- Persistencia real para planner/executor: estado conversacional e idempotencia de operaciones.

CREATE TABLE IF NOT EXISTS "PlannerSession" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'INIT',
  "state" JSONB NOT NULL DEFAULT '{}',
  "criticalFlow" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlannerSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlannerSession_conversationId_key" ON "PlannerSession"("conversationId");
CREATE INDEX IF NOT EXISTS "PlannerSession_sessionId_idx" ON "PlannerSession"("sessionId");
CREATE INDEX IF NOT EXISTS "PlannerSession_stage_idx" ON "PlannerSession"("stage");

ALTER TABLE "PlannerSession"
  ADD CONSTRAINT "PlannerSession_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "PlannerOperation" (
  "id" TEXT NOT NULL,
  "plannerSessionId" TEXT NOT NULL,
  "operationId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMMITTED',
  "payload" JSONB NOT NULL DEFAULT '{}',
  "committedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlannerOperation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlannerOperation_plannerSessionId_operationId_key"
  ON "PlannerOperation"("plannerSessionId", "operationId");
CREATE INDEX IF NOT EXISTS "PlannerOperation_operationId_idx" ON "PlannerOperation"("operationId");

ALTER TABLE "PlannerOperation"
  ADD CONSTRAINT "PlannerOperation_plannerSessionId_fkey"
  FOREIGN KEY ("plannerSessionId") REFERENCES "PlannerSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

