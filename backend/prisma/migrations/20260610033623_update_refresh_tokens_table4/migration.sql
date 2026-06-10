/*
  Warnings:

  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `userAgent`,
    ADD COLUMN `device_id` VARCHAR(150) NULL,
    ADD COLUMN `user_agent` TEXT NULL;
