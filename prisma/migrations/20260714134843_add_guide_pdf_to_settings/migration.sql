-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "guidePdfId" TEXT;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_guidePdfId_fkey" FOREIGN KEY ("guidePdfId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
