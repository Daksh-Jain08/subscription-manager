/*
  Warnings:

  - You are about to drop the column `reminderOffset` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `reminderOn` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "reminderOffset",
DROP COLUMN "reminderOn";
