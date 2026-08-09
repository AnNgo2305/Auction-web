-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` CHAR(36) NOT NULL,
    `type` ENUM('MESSAGE') NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `entity_id` CHAR(36) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `metadata` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `read_at` TIMESTAMP(0) NULL,

    INDEX `notifications_recipient_id_created_at_idx`(`recipient_id`, `created_at`),
    INDEX `notifications_recipient_id_is_read_created_at_idx`(`recipient_id`, `is_read`, `created_at`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
