-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "estimateEmailSubject" TEXT DEFAULT 'Your Estimate Has Been Received — Next Steps',
ADD COLUMN "estimateEmailIntro" TEXT,
ADD COLUMN "estimateEmailBody" TEXT,
ADD COLUMN "estimateEmailClosing" TEXT;
