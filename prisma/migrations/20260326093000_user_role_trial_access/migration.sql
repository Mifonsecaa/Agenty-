-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "trialStartedAt" TIMESTAMP(3),
ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- Backfill trial window for current non-admin users without trial values
UPDATE "User"
SET "trialStartedAt" = COALESCE("trialStartedAt", NOW()),
    "trialEndsAt" = COALESCE("trialEndsAt", NOW() + INTERVAL '7 days')
WHERE "role" = 'USER';
