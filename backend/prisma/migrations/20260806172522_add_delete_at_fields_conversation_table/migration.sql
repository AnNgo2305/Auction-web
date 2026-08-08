-- AlterTable
ALTER TABLE `conversations` ADD COLUMN `deleted_by_initiator_at` TIMESTAMP(0) NULL,
    ADD COLUMN `deleted_by_recipient_at` TIMESTAMP(0) NULL;
