-- Add admin notification email settings to site_settings
ALTER TABLE "site_settings" ADD COLUMN "notificationEmail" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "notifyOnNewSubmission" BOOLEAN NOT NULL DEFAULT false;
