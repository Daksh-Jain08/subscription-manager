/*
  Warnings:

  - You are about to drop the column `date` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `snoozeTime` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `reminderTime` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "date",
DROP COLUMN "snoozeTime",
ADD COLUMN     "reminderTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "snoozeUntil" TIMESTAMP(3);
