import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationService } from '@modules/notification/notification.service';
import { LoggerService } from '@common/services/logger.service';
import { NotificationPayload } from '@modules/notification/constants/notification.constant';
import { Job } from 'bullmq';
import { FOLLOW_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '@modules/notification/notification.gateway';

@Processor(FOLLOW_NOTIFICATION_QUEUE.NAME)
@Injectable()
export class FollowNotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationPayload>): Promise<void> {
    switch (job.name) {
      case FOLLOW_NOTIFICATION_QUEUE.JOBS.FOLLOW_REQUESTED:
      case FOLLOW_NOTIFICATION_QUEUE.JOBS.FOLLOW_ACCEPTED:
        await this.handleFollowNotification(job);
        break;

      default:
        this.logger.warn(`Unknown notification job: ${job.name}`);
    }
  }

  private async handleFollowNotification(
    job: Job<NotificationPayload>,
  ): Promise<void> {
    const payload = job.data;

    this.logger.log(
      `Processing follow notification for user ${payload.recipientId}`,
    );

    const notification =
      await this.notificationService.createNotification(payload);

    if (!notification) {
      return;
    }

    try {
      const unreadCount = await this.notificationService.getUnreadCount(
        notification.recipientId,
      );

      this.notificationsGateway.emitNotification(notification);

      this.notificationsGateway.emitUnreadCount(
        notification.recipientId,
        unreadCount,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit follow notification for user ${notification.recipientId}`,
        error,
      );
    }
  }
}
