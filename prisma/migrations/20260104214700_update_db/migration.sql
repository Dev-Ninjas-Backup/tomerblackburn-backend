/*
  Warnings:

  - You are about to drop the `setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "setting" DROP CONSTRAINT "setting_logoImageId_fkey";

-- DropTable
DROP TABLE "setting";

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "logoImageId" TEXT,
    "contactNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
