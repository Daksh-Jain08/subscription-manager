/*
  Warnings:

  - You are about to drop the column `reminderoffset` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "reminderoffset",
ADD COLUMN     "reminderOffset" INTEGER;
