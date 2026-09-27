import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AUCTION_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import {
  AuctionCancelledEvent,
  AuctionClosedEvent,
  AuctionCreatedEvent,
  AuctionEndedEvent,
  AuctionResubmittedEvent,
  AuctionUpdatedEvent,
} from '@modules/auction/events/auction.event';
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
  async handleAuctionCreated(payload: AuctionCreatedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CREATED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_UPDATED)
  async handleAuctionUpdated(payload: AuctionUpdatedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_UPDATED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CANCELLED)
  async handleAuctionCancelled(payload: AuctionCancelledEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CANCELLED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_STARTED)
  async handleAuctionStarted(payload: AuctionStartedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_STARTED,
      {
        sellerId: payload.sellerId,
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_ENDED)
  async handleAuctionEnded(payload: AuctionEndedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_COMPLETED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
        isManual: payload.isManual,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_EXTENDED)
  async handleAuctionExtended(payload: AuctionExtendedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_EXTENDED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        title: payload.title,
        endTime: payload.endTime,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_REOPENED)
  async handleAuctionReopened(payload: AuctionReopenedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_REOPENED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CLOSED)
  async handleAuctionClosed(payload: AuctionClosedEvent): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_CLOSED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_RESUBMITTED)
  async handleAuctionResubmitted(
    payload: AuctionResubmittedEvent,
  ): Promise<void> {
    await this.notificationQueue.add(
      AUCTION_NOTIFICATION_QUEUE.JOBS.AUCTION_RESUBMITTED,
      {
        eventId: payload.eventId,
        auctionId: payload.auctionId,
        sellerId: payload.sellerId,
        title: payload.title,
      },
    );
  }
}
