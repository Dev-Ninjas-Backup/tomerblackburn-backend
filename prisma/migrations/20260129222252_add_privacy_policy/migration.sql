-- CreateTable
CREATE TABLE "privacy_policy" (
    "id" TEXT NOT NULL DEFAULT 'privacy-policy-singleton',
    "title" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_policy_pkey" PRIMARY KEY ("id")
);
