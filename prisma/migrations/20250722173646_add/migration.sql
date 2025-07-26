-- AlterTable
ALTER TABLE `address` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `returnrequest` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NULL DEFAULT false;
