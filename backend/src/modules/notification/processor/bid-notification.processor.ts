import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { LoggerService } from '@common/services/logger.service';
import { BID_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationsGateway } from '@modules/notification/notification.gateway';
import { NotificationType } from '@generated/prisma/enums';

interface BidNotificationJobData {
  recipientIds: string[];
  auctionId: string;
  actorId: string;
}

@Processor(BID_NOTIFICATION_QUEUE.NAME)
@Injectable()
export class BidNotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<BidNotificationJobData>): Promise<void> {
    switch (job.name) {
      case BID_NOTIFICATION_QUEUE.JOBS.BID_PLACED:
        await this.handleBidPlaced(job);
        break;

      default:
        this.logger.warn(`Unknown notification job: ${job.name}`);
    }
  }

  private async handleBidPlaced(
    job: Job<BidNotificationJobData>,
  ): Promise<void> {
    const { recipientIds, auctionId, actorId } = job.data;

    this.logger.log(`Processing bid notifications for auction ${auctionId}`);

    for (const recipientId of recipientIds) {
      const notification = await this.notificationService.aggregateNotification(
        {
          recipientId,
          type: NotificationType.BID_PLACED,
          entityId: auctionId,
          entityType: 'AUCTION',
          actorId: actorId,
        },
      );

      if (!notification) {
        continue;
      }

      const unreadCount =
        await this.notificationService.getUnreadCount(recipientId);

      this.notificationsGateway.emitNotification(recipientId);

      this.notificationsGateway.emitUnreadCount(recipientId, unreadCount);
    }
  }
}
