import { WorkerHost } from '@nestjs/bullmq';
import { NotificationService } from '@modules/notification/notification.service';
import { LoggerService } from '@common/services/logger.service';
import { NotificationPayload } from '@modules/notification/notification.constant';
import { Job } from 'bullmq';
import { MESSAGE_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '@modules/notification/notification.gateway';

@Injectable()
export class MessageNotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationPayload>): Promise<void> {
    switch (job.name) {
      case MESSAGE_NOTIFICATION_QUEUE.JOBS.MESSAGE_SENT:
        await this.handleMessageSent(job);
        break;

      default:
        this.logger.warn(`Unknown notification job: ${job.name}`);
    }
  }

  private async handleMessageSent(
    job: Job<NotificationPayload>,
  ): Promise<void> {
    const payload = job.data;
    this.logger.log(
      `Processing message notification for conversation ${payload.entityId}`,
    );

    const notification =
      await this.notificationService.aggregateNotification(payload);

    if (!notification) {
      return;
    }

    this.notificationsGateway.emitNotification(
      notification.recipientId,
      notification,
    );
  }
}
