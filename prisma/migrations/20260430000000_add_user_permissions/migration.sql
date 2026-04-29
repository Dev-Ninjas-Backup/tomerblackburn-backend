-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionsView" BOOLEAN NOT NULL DEFAULT true,
    "submissionsEdit" BOOLEAN NOT NULL DEFAULT false,
    "submissionsDelete" BOOLEAN NOT NULL DEFAULT false,
    "contactsView" BOOLEAN NOT NULL DEFAULT true,
    "contactsEdit" BOOLEAN NOT NULL DEFAULT false,
    "contactsDelete" BOOLEAN NOT NULL DEFAULT false,
    "costManagementView" BOOLEAN NOT NULL DEFAULT true,
    "costManagementEdit" BOOLEAN NOT NULL DEFAULT false,
    "costManagementDelete" BOOLEAN NOT NULL DEFAULT false,
    "projectManagementView" BOOLEAN NOT NULL DEFAULT true,
    "projectManagementEdit" BOOLEAN NOT NULL DEFAULT false,
    "projectManagementDelete" BOOLEAN NOT NULL DEFAULT false,
    "webView" BOOLEAN NOT NULL DEFAULT false,
    "webEdit" BOOLEAN NOT NULL DEFAULT false,
    "settingsView" BOOLEAN NOT NULL DEFAULT true,
    "dataBackupAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_key" ON "user_permissions"("userId");

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
