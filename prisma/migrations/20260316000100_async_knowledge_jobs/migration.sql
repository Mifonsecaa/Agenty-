-- CreateEnum
CREATE TYPE "KnowledgeIngestionJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'RETRY', 'COMPLETED', 'FAILED', 'DLQ');

-- CreateTable
CREATE TABLE "KnowledgeIngestionJob" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" "KnowledgeIngestionJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "chunkCount" INTEGER,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeIngestionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeIngestionJob_businessId_createdAt_idx" ON "KnowledgeIngestionJob"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeIngestionJob_status_nextRunAt_idx" ON "KnowledgeIngestionJob"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "KnowledgeIngestionJob_fingerprint_idx" ON "KnowledgeIngestionJob"("fingerprint");

-- AddForeignKey
ALTER TABLE "KnowledgeIngestionJob" ADD CONSTRAINT "KnowledgeIngestionJob_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

