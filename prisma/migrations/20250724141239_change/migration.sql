-- AlterTable
ALTER TABLE `address` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `cartitem` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `order` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `payment` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `product` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `returnrequest` MODIFY `isActive` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` MODIFY `isActive` BOOLEAN NULL DEFAULT true;
