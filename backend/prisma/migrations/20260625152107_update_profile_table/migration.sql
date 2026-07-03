-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `bio` VARCHAR(500) NULL,
    ADD COLUMN `cover_image_url` VARCHAR(191) NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL;
