-- Add maintenance mode flag to site_settings
ALTER TABLE "site_settings" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
