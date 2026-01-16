/*
  Warnings:

  - You are about to drop the column `finalPrice` on the `cost_code_options` table. All the data in the column will be lost.
  - You are about to drop the column `appliesToFp` on the `cost_codes` table. All the data in the column will be lost.
  - You are about to drop the column `appliesToTp` on the `cost_codes` table. All the data in the column will be lost.
  - You are about to drop the column `appliesToTps` on the `cost_codes` table. All the data in the column will be lost.
  - You are about to drop the column `appliesToTpt` on the `cost_codes` table. All the data in the column will be lost.
  - You are about to drop the column `calculationType` on the `cost_codes` table. All the data in the column will be lost.
  - You are about to drop the column `colorTag` on the `cost_codes` table. All the data in the column will be lost.
  - The `unitType` column on the `cost_codes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `itemType` on the `submission_items` table. All the data in the column will be lost.
  - The `mediaType` column on the `submission_media` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ContactUs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Portfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `bathroom_type_cost_codes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('WHITE', 'BLUE', 'GREEN', 'ORANGE', 'YELLOW', 'RED', 'PURPLE');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('FIXED', 'PER_SQFT', 'PER_EACH', 'PER_LOT', 'PER_SET', 'PER_UPGRADE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'VIEW_ONLY');

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_imageId_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_logoImageId_fkey";

-- DropIndex
DROP INDEX "cost_codes_colorTag_idx";

-- AlterTable
ALTER TABLE "bathroom_type_cost_codes" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceOverride" DECIMAL(10,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isIncludedInBase" SET DEFAULT false;

-- AlterTable
ALTER TABLE "bathroom_types" ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "cost_code_categories" ADD COLUMN     "stepNumber" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "cost_code_options" DROP COLUMN "finalPrice",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "cost_codes" DROP COLUMN "appliesToFp",
DROP COLUMN "appliesToTp",
DROP COLUMN "appliesToTps",
DROP COLUMN "appliesToTpt",
DROP COLUMN "calculationType",
DROP COLUMN "colorTag",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isIncludedInBase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'WHITE',
DROP COLUMN "unitType",
ADD COLUMN     "unitType" "UnitType" NOT NULL DEFAULT 'FIXED';

-- AlterTable
ALTER TABLE "submission_items" DROP COLUMN "itemType",
ADD COLUMN     "itemDescription" TEXT,
ADD COLUMN     "itemName" TEXT,
ADD COLUMN     "questionType" "QuestionType",
ADD COLUMN     "selectedOptionName" TEXT;

-- AlterTable
ALTER TABLE "submission_media" DROP COLUMN "mediaType",
ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'PHOTO';

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarFileId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "ContactUs";

-- DropTable
DROP TABLE "Portfolio";

-- DropTable
DROP TABLE "settings";

-- CreateTable
CREATE TABLE "contact_us" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_images" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT,
    "logoImageId" TEXT,
    "contactNumber" TEXT,
    "contactEmail" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_old" (
    "id" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "logoImageId" TEXT,
    "contactNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_old_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_us_email_idx" ON "contact_us"("email");

-- CreateIndex
CREATE INDEX "contact_us_phone_idx" ON "contact_us"("phone");

-- CreateIndex
CREATE INDEX "contact_us_isRead_idx" ON "contact_us"("isRead");

-- CreateIndex
CREATE INDEX "contact_us_createdAt_idx" ON "contact_us"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_categories_slug_key" ON "portfolio_categories"("slug");

-- CreateIndex
CREATE INDEX "portfolio_categories_slug_idx" ON "portfolio_categories"("slug");

-- CreateIndex
CREATE INDEX "portfolio_categories_isActive_idx" ON "portfolio_categories"("isActive");

-- CreateIndex
CREATE INDEX "portfolio_images_categoryId_idx" ON "portfolio_images"("categoryId");

-- CreateIndex
CREATE INDEX "portfolio_images_fileId_idx" ON "portfolio_images"("fileId");

-- CreateIndex
CREATE INDEX "bathroom_type_cost_codes_isVisible_idx" ON "bathroom_type_cost_codes"("isVisible");

-- CreateIndex
CREATE INDEX "bathroom_types_displayOrder_idx" ON "bathroom_types"("displayOrder");

-- CreateIndex
CREATE INDEX "cost_code_categories_stepNumber_idx" ON "cost_code_categories"("stepNumber");

-- CreateIndex
CREATE INDEX "cost_code_options_isActive_idx" ON "cost_code_options"("isActive");

-- CreateIndex
CREATE INDEX "cost_codes_questionType_idx" ON "cost_codes"("questionType");

-- CreateIndex
CREATE INDEX "cost_codes_displayOrder_idx" ON "cost_codes"("displayOrder");

-- CreateIndex
CREATE INDEX "submission_items_selectedOptionId_idx" ON "submission_items"("selectedOptionId");

-- CreateIndex
CREATE INDEX "submission_media_mediaType_idx" ON "submission_media"("mediaType");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_clientPhone_idx" ON "submissions"("clientPhone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- AddForeignKey
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "portfolio_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings_old" ADD CONSTRAINT "settings_old_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
