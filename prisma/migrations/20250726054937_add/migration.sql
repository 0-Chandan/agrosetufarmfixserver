/*
  Warnings:

  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `amount` VARCHAR(191) NOT NULL;
