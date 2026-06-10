/*
  Warnings:

  - Made the column `provider` on table `refresh_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `provider` VARCHAR(50) NOT NULL DEFAULT 'local';
