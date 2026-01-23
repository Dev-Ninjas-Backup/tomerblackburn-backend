-- AlterTable
ALTER TABLE "cost_codes" ADD COLUMN     "step" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "cost_codes_step_idx" ON "cost_codes"("step");
