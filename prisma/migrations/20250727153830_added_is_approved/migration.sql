-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_shopId_fkey`;

-- DropIndex
DROP INDEX `Product_shopId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `product` MODIFY `shopId` INTEGER NULL;

-- AlterTable
ALTER TABLE `shop` ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
