import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationsGateway } from './notification.gateway';
import { MessageNotificationListener } from './listener/message-notification.listener';
import { MessageNotificationProcessor } from './processor/message-notification.processor';
import { CommonModule } from '@common/common.module';
import { DeleteOldNotificationsScheduler } from '@modules/notification/scheduler/delete-old-notifications.scheduler';

@Module({
  imports: [CommonModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationsGateway,
    MessageNotificationListener,
    MessageNotificationProcessor,
    DeleteOldNotificationsScheduler,
  ],

  exports: [NotificationService, NotificationsGateway],
})
export class NotificationModule {}
