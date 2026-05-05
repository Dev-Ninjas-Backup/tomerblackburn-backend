-- CreateTable
CREATE TABLE "hear_about_us_options" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hear_about_us_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hear_about_us_settings" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hear_about_us_settings_pkey" PRIMARY KEY ("id")
);
