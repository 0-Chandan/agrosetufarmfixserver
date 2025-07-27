-- CreateTable
CREATE TABLE `Officer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `officerId` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `place` VARCHAR(191) NOT NULL,
    `role` ENUM('SDM', 'CO', 'AGRICULTURE_OFFICER', 'TEHSILDAR') NOT NULL DEFAULT 'SDM',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Officer_officerId_key`(`officerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MandiPrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cropName` VARCHAR(191) NOT NULL,
    `currentPrice` VARCHAR(191) NOT NULL,
    `lastPrice` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
