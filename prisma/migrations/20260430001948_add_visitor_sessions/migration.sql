-- CreateTable
CREATE TABLE "visitor_sessions" (
    "id" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "page" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL,
    "disconnectedAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,

    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_sessions_connectedAt_idx" ON "visitor_sessions"("connectedAt");

-- CreateIndex
CREATE INDEX "visitor_sessions_ipAddress_idx" ON "visitor_sessions"("ipAddress");
