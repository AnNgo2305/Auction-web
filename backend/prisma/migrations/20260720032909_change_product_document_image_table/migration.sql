/*
  Warnings:

  - You are about to drop the column `document_url` on the `product_documents` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `product_images` table. All the data in the column will be lost.
  - Added the required column `document_key` to the `product_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_key` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_documents` DROP COLUMN `document_url`,
    ADD COLUMN `document_key` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `product_images` DROP COLUMN `image_url`,
    ADD COLUMN `image_key` VARCHAR(255) NOT NULL;
