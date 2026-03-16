-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "instagramAccessToken" TEXT,
ADD COLUMN     "instagramAppSecret" TEXT,
ADD COLUMN     "instagramPageId" TEXT,
ADD COLUMN     "telegramBotToken" TEXT,
ADD COLUMN     "telegramBotUsername" TEXT,
ADD COLUMN     "whatsappAccessToken" TEXT,
ADD COLUMN     "whatsappPhoneNumberId" TEXT,
ADD COLUMN     "whatsappWebhookVerifyToken" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "aiProfile" TEXT,
ADD COLUMN     "lastProfileUpdate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "details" TEXT,
ADD COLUMN     "metadata" JSONB DEFAULT '{}';
