-- CreateEnum
CREATE TYPE "AudioTranscriptionJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'RETRY', 'COMPLETED', 'FAILED', 'DLQ');

-- CreateTable
CREATE TABLE "AudioTranscriptionJob" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" "AudioTranscriptionJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AudioTranscriptionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudioTranscriptionJob_businessId_createdAt_idx" ON "AudioTranscriptionJob"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "AudioTranscriptionJob_status_nextRunAt_idx" ON "AudioTranscriptionJob"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "AudioTranscriptionJob_fingerprint_idx" ON "AudioTranscriptionJob"("fingerprint");

-- AddForeignKey
ALTER TABLE "AudioTranscriptionJob" ADD CONSTRAINT "AudioTranscriptionJob_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

