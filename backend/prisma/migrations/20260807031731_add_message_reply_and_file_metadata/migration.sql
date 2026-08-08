-- AlterTable
ALTER TABLE `messages` ADD COLUMN `file_size` INTEGER NULL,
    ADD COLUMN `reply_to_message_id` CHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_reply_to_message_id_fkey` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages`(`message_id`) ON DELETE SET NULL ON UPDATE CASCADE;
