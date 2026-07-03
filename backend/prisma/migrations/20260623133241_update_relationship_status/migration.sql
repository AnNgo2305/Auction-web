/*
  Warnings:

  - The values [UNFOLLOWED] on the enum `follows_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `follows` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'BLOCKED', 'INACTIVE', 'DECLINED') NOT NULL DEFAULT 'PENDING';
