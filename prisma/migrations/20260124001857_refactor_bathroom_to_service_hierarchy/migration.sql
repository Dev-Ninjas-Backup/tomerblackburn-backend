-- CreateTable: service_types
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable: service_categories
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: services
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "imageFileId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable: service_cost_codes
CREATE TABLE "service_cost_codes" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "isIncludedInBase" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "defaultQuantity" DECIMAL(10,2),
    "priceOverride" DECIMAL(10,2),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_cost_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_types_isActive_idx" ON "service_types"("isActive");
CREATE INDEX "service_types_displayOrder_idx" ON "service_types"("displayOrder");

CREATE INDEX "service_categories_serviceTypeId_idx" ON "service_categories"("serviceTypeId");
CREATE INDEX "service_categories_isActive_idx" ON "service_categories"("isActive");
CREATE INDEX "service_categories_displayOrder_idx" ON "service_categories"("displayOrder");

CREATE UNIQUE INDEX "services_code_key" ON "services"("code");
CREATE INDEX "services_code_idx" ON "services"("code");
CREATE INDEX "services_serviceCategoryId_idx" ON "services"("serviceCategoryId");
CREATE INDEX "services_isActive_idx" ON "services"("isActive");
CREATE INDEX "services_displayOrder_idx" ON "services"("displayOrder");

CREATE UNIQUE INDEX "service_cost_codes_serviceId_costCodeId_key" ON "service_cost_codes"("serviceId", "costCodeId");
CREATE INDEX "service_cost_codes_serviceId_idx" ON "service_cost_codes"("serviceId");
CREATE INDEX "service_cost_codes_costCodeId_idx" ON "service_cost_codes"("costCodeId");
CREATE INDEX "service_cost_codes_isVisible_idx" ON "service_cost_codes"("isVisible");

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "service_cost_codes" ADD CONSTRAINT "service_cost_codes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_cost_codes" ADD CONSTRAINT "service_cost_codes_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "cost_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Create default ServiceType
INSERT INTO "service_types" ("id", "name", "description", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES ('default-service-type', 'Bathroom Renovation', 'Bathroom renovation services', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Data Migration: Create default ServiceCategory
INSERT INTO "service_categories" ("id", "serviceTypeId", "name", "description", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES ('default-bathroom-type', 'default-service-type', 'Bathroom Type', 'Different types of bathroom configurations', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Data Migration: Migrate bathroom_types to services
INSERT INTO "services" ("id", "serviceCategoryId", "code", "name", "shortDescription", "fullDescription", "basePrice", "imageFileId", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT "id", 'default-bathroom-type', "code", "name", "shortDescription", "fullDescription", "basePrice", "imageFileId", "displayOrder", "isActive", "createdAt", "updatedAt"
FROM "bathroom_types";

-- Data Migration: Migrate bathroom_type_cost_codes to service_cost_codes
INSERT INTO "service_cost_codes" ("id", "serviceId", "costCodeId", "isIncludedInBase", "isRequired", "isVisible", "defaultQuantity", "priceOverride", "displayOrder", "createdAt", "updatedAt")
SELECT "id", "bathroomTypeId", "costCodeId", "isIncludedInBase", "isRequired", "isVisible", "defaultQuantity", "priceOverride", "displayOrder", "createdAt", "updatedAt"
FROM "bathroom_type_cost_codes";

-- AlterTable: Add serviceId to submissions and migrate data
ALTER TABLE "submissions" ADD COLUMN "serviceId" TEXT;

-- Migrate bathroomTypeId to serviceId (they have same IDs after migration)
UPDATE "submissions" SET "serviceId" = "bathroomTypeId";

-- Make serviceId required
ALTER TABLE "submissions" ALTER COLUMN "serviceId" SET NOT NULL;

-- AddForeignKey for submissions.serviceId
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex for serviceId
CREATE INDEX "submissions_serviceId_idx" ON "submissions"("serviceId");

-- DropIndex and DropForeignKey for bathroomTypeId
DROP INDEX IF EXISTS "submissions_bathroomTypeId_idx";
ALTER TABLE "submissions" DROP CONSTRAINT IF EXISTS "submissions_bathroomTypeId_fkey";

-- DropColumn bathroomTypeId from submissions
ALTER TABLE "submissions" DROP COLUMN "bathroomTypeId";

-- DropTable old tables
DROP TABLE "bathroom_type_cost_codes";
DROP TABLE "bathroom_types";
