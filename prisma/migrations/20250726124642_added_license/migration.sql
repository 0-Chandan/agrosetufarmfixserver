-- CreateTable
CREATE TABLE `Licenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shopLicense` JSON NOT NULL,
    `gstCertificate` JSON NOT NULL,
    `storagePermissionCertificate` JSON NOT NULL,
    `fassiLicense` JSON NOT NULL,
    `shopId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Licenses` ADD CONSTRAINT `Licenses_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
