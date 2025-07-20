/*
  Warnings:

  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `discount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `originalPrice` DOUBLE NOT NULL,
    ADD COLUMN `rating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `seller` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;
