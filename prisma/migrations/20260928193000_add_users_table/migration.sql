-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM (
    'PENDING_EMAIL_VERIFY',
    'PENDING_PARENTAL_CONSENT',
    'PENDING_ID_VERIFICATION',
    'PARENT_ACTIVE',
    'ID_VERIFIED',
    'SUSPENDED',
    'DELETION_PENDING',
    'DELETED'
);

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PARENT', 'CHILD', 'TEEN');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_uid" VARCHAR(128) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_EMAIL_VERIFY',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "account_type" "AccountType" NOT NULL,
    "display_name" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "masjid_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_uid_key" ON "users"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_masjid" ON "users"("masjid_id");

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_masjid_id_fkey" FOREIGN KEY ("masjid_id") REFERENCES "masajid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
