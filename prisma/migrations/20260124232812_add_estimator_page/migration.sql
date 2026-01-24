-- CreateTable
CREATE TABLE "EstimatorPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "backgroundImageId" TEXT,
    "howItWorksTitle" TEXT NOT NULL DEFAULT 'How It Works',
    "whyChooseUsTitle" TEXT NOT NULL DEFAULT 'Why Choose Us',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimatorPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HowItWorksStep" (
    "id" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HowItWorksStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseUsFeature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseUsFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HowItWorksStep_stepNumber_idx" ON "HowItWorksStep"("stepNumber");

-- CreateIndex
CREATE INDEX "WhyChooseUsFeature_order_idx" ON "WhyChooseUsFeature"("order");

-- AddForeignKey
ALTER TABLE "EstimatorPage" ADD CONSTRAINT "EstimatorPage_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseUsFeature" ADD CONSTRAINT "WhyChooseUsFeature_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
