import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AUCTION_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { AuctionEvent } from '@modules/auction/events/auction.event';
import { AuctionStartedEvent } from '@modules/auction/events/auction-start.event';
import { AuctionExtendedEvent } from '@modules/auction/events/auction-extend.event';
import { AuctionReopenedEvent } from '@modules/auction/events/auction-reopen.event';

@Injectable()
export class AuctionNotificationListener {
  constructor(
    @InjectQueue(AUCTION_NOTIFICATION_QUEUE.NAME)
    private readonly notificationQueue: Queue,
  ) {}

  @OnEvent(INTERNAL_EVENTS.AUCTION_CREATED)
  async handleAuctionCreated(payload: AuctionEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CREATED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_UPDATED)
  async handleAuctionUpdated(payload: AuctionEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_UPDATED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CANCELLED)
  async handleAuctionCancelled(payload: AuctionEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CANCELLED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_STARTED)
  async handleAuctionStarted(payload: AuctionStartedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_STARTED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_ENDED)
  async handleAuctionCompleted(payload: AuctionEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_COMPLETED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_EXTENDED)
  async handleAuctionExtended(payload: AuctionExtendedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_EXTENDED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_REOPENED)
  async handleAuctionReopened(payload: AuctionReopenedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_REOPENED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CLOSED)
  async handleAuctionClosed(payload: AuctionEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CLOSED,
      {
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }
}
