/*
  Warnings:

  - Added the required column `created_by_id` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `color` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    ADD COLUMN `created_by_id` CHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
