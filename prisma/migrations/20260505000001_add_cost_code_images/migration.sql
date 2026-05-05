-- CreateTable
CREATE TABLE "cost_code_images" (
    "id" TEXT NOT NULL,
    "costCodeId" TEXT NOT NULL,
    "fileInstanceId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_code_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cost_code_images_costCodeId_idx" ON "cost_code_images"("costCodeId");

-- AddForeignKey
ALTER TABLE "cost_code_images" ADD CONSTRAINT "cost_code_images_costCodeId_fkey" FOREIGN KEY ("costCodeId") REFERENCES "cost_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_code_images" ADD CONSTRAINT "cost_code_images_fileInstanceId_fkey" FOREIGN KEY ("fileInstanceId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
