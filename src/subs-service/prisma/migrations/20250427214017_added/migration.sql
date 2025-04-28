/*
  Warnings:

  - You are about to drop the column `deleted` on the `Subscription` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "deleted",
ADD COLUMN     "reminderOn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminderoffset" INTEGER,
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
