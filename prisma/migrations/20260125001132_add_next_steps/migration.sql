-- CreateTable
CREATE TABLE "next_steps" (
    "id" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "next_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "next_steps_stepNumber_key" ON "next_steps"("stepNumber");

-- CreateIndex
CREATE INDEX "next_steps_stepNumber_idx" ON "next_steps"("stepNumber");

-- CreateIndex
CREATE INDEX "next_steps_isActive_idx" ON "next_steps"("isActive");

-- CreateIndex
CREATE INDEX "next_steps_displayOrder_idx" ON "next_steps"("displayOrder");
