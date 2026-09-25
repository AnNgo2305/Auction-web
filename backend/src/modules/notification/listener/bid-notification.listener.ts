import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { BID_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { PrismaService } from '@common/services/prisma.service';
import { BidPlacedEvent } from '@modules/bid/events/bid-placed.event';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationPayload } from '@modules/notification/constants/notification.constant';
import { NotificationType } from '@generated/prisma/enums';

const BID_AGGREGATION_DELAY_MS = 10_000;

interface BidNotificationJobData {
  recipientIds: string[];
  auctionId: string;
  actorId: string;
}

@Injectable()
export class BidNotificationListener {
  constructor(
    @InjectQueue(BID_NOTIFICATION_QUEUE.NAME)
    private readonly notificationQueue: Queue,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(INTERNAL_EVENTS.BID_PLACED)
  async handleBidPlaced(payload: BidPlacedEvent): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: {
        auctionId: payload.auctionId,
      },
      select: {
        sellerId: true,
        watchlist: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!auction) {
      return;
    }

    const recipientIds = new Set<string>();

    // Seller
    if (auction.sellerId !== payload.userId) {
      recipientIds.add(auction.sellerId);
    }

    // Watchers
    for (const watcher of auction.watchlist) {
      if (watcher.userId !== payload.userId) {
        recipientIds.add(watcher.userId);
      }
    }

    if (recipientIds.size === 0) {
      return;
    }

    for (const recipientId of recipientIds) {
      const notificationPayload: NotificationPayload = {
        recipientId,
        actorId: payload.userId,
        type: NotificationType.BID_PLACED,
        entityId: payload.auctionId,
        entityType: 'AUCTION',
        metadata: {
          auctionTitle: payload.auctionTitle,
        },
      };

      await this.notificationService.addAggregationActor(notificationPayload);
    }

    const jobData: BidNotificationJobData = {
      recipientIds: [...recipientIds],
      auctionId: payload.auctionId,
      actorId: payload.userId,
    };

    await this.notificationQueue.add(
      BID_NOTIFICATION_QUEUE.JOBS.BID_PLACED,
      jobData,
      {
        delay: BID_AGGREGATION_DELAY_MS,
        jobId: `bid_${payload.auctionId}`,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }
}
