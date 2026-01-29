-- CreateTable
CREATE TABLE "terms_of_service" (
    "id" TEXT NOT NULL DEFAULT 'terms-of-service-singleton',
    "title" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_of_service_pkey" PRIMARY KEY ("id")
);
