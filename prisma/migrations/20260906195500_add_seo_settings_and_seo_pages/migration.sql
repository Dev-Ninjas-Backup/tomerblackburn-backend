-- CreateTable
CREATE TABLE "seo_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'BBurn Builders',
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | BBurn Builders',
    "defaultTitle" TEXT NOT NULL DEFAULT 'BBurn Builders — Premier Custom Remodeling & Construction | Chicago, IL',
    "defaultDescription" TEXT NOT NULL DEFAULT 'Chicago''s premier residential remodeling and construction company. Specializing in luxury bathroom remodels, custom carpentry, plumbing, and whole-home renovations.',
    "defaultKeywords" TEXT NOT NULL DEFAULT 'home remodeling chicago, bathroom remodel chicago, custom carpentry, luxury renovations illinois, general contractor chicago, bburn builders',
    "siteUrl" TEXT NOT NULL DEFAULT 'https://bburnbuilders.com',
    "ogImageUrl" TEXT,
    "twitterHandle" TEXT DEFAULT '@bburnbuilders',
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "googleSiteVerification" TEXT,
    "bingSiteVerification" TEXT,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "canonicalUrl" TEXT DEFAULT 'https://bburnbuilders.com',
    "businessType" TEXT NOT NULL DEFAULT 'GeneralContractor',
    "businessPhone" TEXT NOT NULL DEFAULT '773-403-9950',
    "businessEmail" TEXT NOT NULL DEFAULT 'estimates@bburnbuilders.com',
    "businessStreetAddress" TEXT DEFAULT 'Chicago, IL',
    "businessCity" TEXT NOT NULL DEFAULT 'Chicago',
    "businessState" TEXT NOT NULL DEFAULT 'IL',
    "businessPostalCode" TEXT DEFAULT '60601',
    "businessCountry" TEXT NOT NULL DEFAULT 'US',
    "priceRange" TEXT NOT NULL DEFAULT '$$$',
    "openingHours" TEXT NOT NULL DEFAULT 'Mo-Sa 08:00-18:00',
    "geoLatitude" DOUBLE PRECISION DEFAULT 41.8781,
    "geoLongitude" DOUBLE PRECISION DEFAULT -87.6298,
    "serviceAreas" TEXT DEFAULT 'Chicago, Naperville, Evanston, Oak Park, Schaumburg, Hinsdale',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_pages" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "changeFreq" TEXT NOT NULL DEFAULT 'weekly',
    "structuredDataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_path_key" ON "seo_pages"("path");
