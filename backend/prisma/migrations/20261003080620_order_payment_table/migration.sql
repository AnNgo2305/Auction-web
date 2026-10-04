-- CreateTable
CREATE TABLE `orders` (
    `order_id` CHAR(36) NOT NULL,
    `order_code` VARCHAR(100) NOT NULL,
    `auction_id` CHAR(36) NOT NULL,
    `buyer_id` CHAR(36) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `orders_order_code_key`(`order_code`),
    UNIQUE INDEX `orders_auction_id_key`(`auction_id`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `payment_id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 2) NOT NULL,
    `transaction_ref` VARCHAR(100) NULL,
    `transaction_no` VARCHAR(100) NULL,
    `response_code` VARCHAR(20) NULL,
    `paid_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `payments_transaction_ref_key`(`transaction_ref`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_auction_id_fkey` FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`auction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;
