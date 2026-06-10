/*
  Warnings:

  - You are about to drop the column `is_revoked` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `is_revoked`,
    ADD COLUMN `expires_at` TIMESTAMP(0) NOT NULL,
    ADD COLUMN `revoked_at` TIMESTAMP(0) NULL;
