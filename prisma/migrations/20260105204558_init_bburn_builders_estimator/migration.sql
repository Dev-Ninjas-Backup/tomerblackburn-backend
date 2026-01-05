/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bathroom_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullDescription" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "imageFileId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bathroom_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bathroom_type_cost_codes" (
    "id" TEXT NOT NULL,
    "bathroomTypeId" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "isIncludedInBase" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "defaultQuantity" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bathroom_type_cost_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logoFileId" TEXT,
    "sendEmailOnSubmission" BOOLEAN NOT NULL DEFAULT true,
    "sendConfirmationToClient" BOOLEAN NOT NULL DEFAULT true,
    "dailySummaryReport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_codes" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unitType" TEXT,
    "colorTag" TEXT,
    "calculationType" TEXT,
    "requiresQuantity" BOOLEAN NOT NULL DEFAULT false,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliesToFp" BOOLEAN NOT NULL DEFAULT false,
    "appliesToTps" BOOLEAN NOT NULL DEFAULT false,
    "appliesToTpt" BOOLEAN NOT NULL DEFAULT false,
    "appliesToTp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_code_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_code_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_code_options" (
    "id" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "optionValue" TEXT,
    "priceModifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(10,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_code_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "emailType" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "submissionNumber" TEXT NOT NULL,
    "bathroomTypeId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "projectAddress" TEXT NOT NULL,
    "zipCode" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "additionalItemsTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "projectNotes" TEXT,
    "additionalDetails" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_items" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "itemType" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "userInputValue" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_media" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fileInstanceId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_idx" ON "activity_logs"("entityType");

-- CreateIndex
CREATE INDEX "activity_logs_entityId_idx" ON "activity_logs"("entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "bathroom_types_code_key" ON "bathroom_types"("code");

-- CreateIndex
CREATE INDEX "bathroom_types_code_idx" ON "bathroom_types"("code");

-- CreateIndex
CREATE INDEX "bathroom_types_isActive_idx" ON "bathroom_types"("isActive");

-- CreateIndex
CREATE INDEX "bathroom_type_cost_codes_bathroomTypeId_idx" ON "bathroom_type_cost_codes"("bathroomTypeId");

-- CreateIndex
CREATE INDEX "bathroom_type_cost_codes_costCodeId_idx" ON "bathroom_type_cost_codes"("costCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "bathroom_type_cost_codes_bathroomTypeId_costCodeId_key" ON "bathroom_type_cost_codes"("bathroomTypeId", "costCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_codes_code_key" ON "cost_codes"("code");

-- CreateIndex
CREATE INDEX "cost_codes_code_idx" ON "cost_codes"("code");

-- CreateIndex
CREATE INDEX "cost_codes_categoryId_idx" ON "cost_codes"("categoryId");

-- CreateIndex
CREATE INDEX "cost_codes_isActive_idx" ON "cost_codes"("isActive");

-- CreateIndex
CREATE INDEX "cost_codes_colorTag_idx" ON "cost_codes"("colorTag");

-- CreateIndex
CREATE UNIQUE INDEX "cost_code_categories_slug_key" ON "cost_code_categories"("slug");

-- CreateIndex
CREATE INDEX "cost_code_categories_slug_idx" ON "cost_code_categories"("slug");

-- CreateIndex
CREATE INDEX "cost_code_options_costCodeId_idx" ON "cost_code_options"("costCodeId");

-- CreateIndex
CREATE INDEX "cost_code_options_isDefault_idx" ON "cost_code_options"("isDefault");

-- CreateIndex
CREATE INDEX "email_logs_submissionId_idx" ON "email_logs"("submissionId");

-- CreateIndex
CREATE INDEX "email_logs_emailType_idx" ON "email_logs"("emailType");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_submissionNumber_key" ON "submissions"("submissionNumber");

-- CreateIndex
CREATE INDEX "submissions_submissionNumber_idx" ON "submissions"("submissionNumber");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_clientEmail_idx" ON "submissions"("clientEmail");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "submissions_bathroomTypeId_idx" ON "submissions"("bathroomTypeId");

-- CreateIndex
CREATE INDEX "submission_items_submissionId_idx" ON "submission_items"("submissionId");

-- CreateIndex
CREATE INDEX "submission_items_costCodeId_idx" ON "submission_items"("costCodeId");

-- CreateIndex
CREATE INDEX "submission_media_submissionId_idx" ON "submission_media"("submissionId");

-- CreateIndex
CREATE INDEX "submission_media_mediaType_idx" ON "submission_media"("mediaType");

-- CreateIndex
CREATE INDEX "submission_media_fileInstanceId_idx" ON "submission_media"("fileInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bathroom_types" ADD CONSTRAINT "bathroom_types_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bathroom_type_cost_codes" ADD CONSTRAINT "bathroom_type_cost_codes_bathroomTypeId_fkey" FOREIGN KEY ("bathroomTypeId") REFERENCES "bathroom_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bathroom_type_cost_codes" ADD CONSTRAINT "bathroom_type_cost_codes_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "cost_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_codes" ADD CONSTRAINT "cost_codes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "cost_code_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_code_options" ADD CONSTRAINT "cost_code_options_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "cost_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_bathroomTypeId_fkey" FOREIGN KEY ("bathroomTypeId") REFERENCES "bathroom_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "cost_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_items" ADD CONSTRAINT "submission_items_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "cost_code_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_media" ADD CONSTRAINT "submission_media_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_media" ADD CONSTRAINT "submission_media_fileInstanceId_fkey" FOREIGN KEY ("fileInstanceId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
