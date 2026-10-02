-- AlterTable
ALTER TABLE `auctions` ADD COLUMN `latest_bidder_id` CHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `auctions` ADD CONSTRAINT `auctions_latest_bidder_id_fkey` FOREIGN KEY (`latest_bidder_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
