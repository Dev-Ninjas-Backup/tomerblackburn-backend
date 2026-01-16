/*
  Warnings:

  - You are about to drop the `company_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings_old` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "company_settings" DROP CONSTRAINT "company_settings_logoFileId_fkey";

-- DropForeignKey
ALTER TABLE "settings_old" DROP CONSTRAINT "settings_old_logoImageId_fkey";

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "pdfUrl" TEXT;

-- DropTable
DROP TABLE "company_settings";

-- DropTable
DROP TABLE "settings_old";
