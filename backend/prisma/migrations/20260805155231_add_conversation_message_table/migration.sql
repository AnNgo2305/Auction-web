-- CreateTable
CREATE TABLE `conversations` (
    `conversation_id` CHAR(36) NOT NULL,
    `initiator_id` CHAR(36) NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `last_message_id` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `conversations_last_message_id_key`(`last_message_id`),
    INDEX `conversations_initiator_id_idx`(`initiator_id`),
    INDEX `conversations_recipient_id_idx`(`recipient_id`),
    UNIQUE INDEX `conversations_initiator_id_recipient_id_key`(`initiator_id`, `recipient_id`),
    PRIMARY KEY (`conversation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `message_id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `sender_id` CHAR(36) NOT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'FILE') NOT NULL DEFAULT 'TEXT',
    `content` TEXT NULL,
    `file_key` VARCHAR(255) NULL,
    `file_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(100) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_initiator_id_fkey` FOREIGN KEY (`initiator_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_last_message_id_fkey` FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`message_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
