import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { LoggerService } from '@common/services/logger.service';
import { PrismaService } from '@common/services/prisma.service';
import { AUCTION_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationsGateway } from '@modules/notification/notification.gateway';
import { NotificationPayload } from '@modules/notification/constants/notification.constant';
import { NotificationType } from '@generated/prisma/enums';

interface AuctionNotificationJobData {
  auctionId: string;
  sellerId: string;
}

@Processor(AUCTION_NOTIFICATION_QUEUE.NAME)
@Injectable()
export class AuctionNotificationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<AuctionNotificationJobData>): Promise<void> {
    switch (job.name) {
      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CREATED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_CREATED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_UPDATED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_UPDATED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CANCELLED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_CANCELLED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_STARTED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_STARTED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_EXTENDED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_EXTENDED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_COMPLETED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_COMPLETED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_REOPENED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_REOPENED,
        );
        break;

      case AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CLOSED:
        await this.handleAuctionNotification(
          job,
          NotificationType.AUCTION_CLOSED,
        );
        break;

      default:
        this.logger.warn(`Unknown notification job: ${job.name}`);
    }
  }

  private async handleAuctionNotification(
    job: Job<AuctionNotificationJobData>,
    type: NotificationType,
  ): Promise<void> {
    const { auctionId, sellerId } = job.data;

    this.logger.log(
      `Processing auction notification ${type} for auction ${auctionId}`,
    );

    const followers = await this.prisma.follow.findMany({
      where: {
        sellerId,
        status: 'ACTIVE',
      },
      select: {
        followerId: true,
      },
    });

    for (const follower of followers) {
      const payload: NotificationPayload = {
        recipientId: follower.followerId,
        type,
        actorId: sellerId,
        entityId: auctionId,
        entityType: 'AUCTION',
      };

      const notification =
        await this.notificationService.createNotification(payload);

      if (!notification) {
        continue;
      }

      const unreadCount = await this.notificationService.getUnreadCount(
        notification.recipientId,
      );

      this.notificationsGateway.emitNotification(notification.recipientId);

      this.notificationsGateway.emitUnreadCount(
        notification.recipientId,
        unreadCount,
      );
    }
  }
}
