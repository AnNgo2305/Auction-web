-- CreateTable
CREATE TABLE `product_documents` (
    `product_document_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `document_name` VARCHAR(255) NOT NULL,
    `document_url` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `product_documents_product_id_idx`(`product_id`),
    PRIMARY KEY (`product_document_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_documents` ADD CONSTRAINT `product_documents_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;
