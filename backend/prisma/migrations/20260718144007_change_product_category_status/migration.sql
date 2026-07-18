/*
  Warnings:

  - You are about to alter the column `name` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(100)`.
  - You are about to alter the column `status` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(5))`.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `categories` MODIFY `name` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `status` ENUM('DRAFT', 'READY', 'AUCTIONING', 'SOLD', 'REMOVED') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX `categories_name_key` ON `categories`(`name`);
