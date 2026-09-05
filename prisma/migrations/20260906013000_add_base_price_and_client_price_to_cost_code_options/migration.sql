-- AlterTable
ALTER TABLE "cost_code_options" ADD COLUMN     "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "clientPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Backfill clientPrice from existing priceModifier
UPDATE "cost_code_options" SET "clientPrice" = "priceModifier" WHERE "clientPrice" = 0 AND "priceModifier" != 0;
