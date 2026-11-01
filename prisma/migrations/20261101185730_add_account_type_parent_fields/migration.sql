/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_type` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PARENT', 'CHILD', 'TEEN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_type" "AccountType" NOT NULL,
ADD COLUMN     "date_of_birth" DATE NOT NULL,
ADD COLUMN     "email" VARCHAR(320) NOT NULL,
ADD COLUMN     "first_name" VARCHAR(40) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(40) NOT NULL,
ADD COLUMN     "phone_number" VARCHAR(20),
ADD COLUMN     "username" VARCHAR(20) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
