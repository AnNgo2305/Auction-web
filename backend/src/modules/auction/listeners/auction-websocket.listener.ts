import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AuctionGateway } from '@modules/auction/auction.gateway';
import {
  AuctionClosedEvent,
  AuctionEndedEvent,
} from '@modules/auction/events/auction.event';
import { AuctionStartedEvent } from '@modules/auction/events/auction-start.event';
import { AuctionExtendedEvent } from '@modules/auction/events/auction-extend.event';
import { AuctionWinnerEvent } from '@modules/auction/events/auction-winner.event';
import { AuctionReopenedEvent } from '@modules/auction/events/auction-reopen.event';

@Injectable()
export class AuctionWebSocketListener {
  constructor(private readonly auctionGateway: AuctionGateway) {}

  @OnEvent(INTERNAL_EVENTS.AUCTION_STARTED)
  async handleAuctionStarted(payload: AuctionStartedEvent): Promise<void> {
    this.auctionGateway.emitAuctionStarted({
      auctionId: payload.auctionId,
      startTime: payload.startTime,
      endTime: payload.endTime,
    });

    await this.auctionGateway.emitAuctionUpdated({
      auctionId: payload.auctionId,
      status: payload.status,
      endTime: payload.endTime,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_EXTENDED)
  async handleAuctionExtended(payload: AuctionExtendedEvent): Promise<void> {
    this.auctionGateway.emitAuctionExtended({
      auctionId: payload.auctionId,
      endTime: payload.endTime,
    });

    await this.auctionGateway.emitAuctionUpdated({
      auctionId: payload.auctionId,
      endTime: payload.endTime,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_ENDED)
  async handleAuctionCompleted(payload: AuctionEndedEvent): Promise<void> {
    this.auctionGateway.emitAuctionCompleted(payload.auctionId);

    await this.auctionGateway.emitAuctionUpdated({
      auctionId: payload.auctionId,
      status: payload.status,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CLOSED)
  async handleAuctionClosed(payload: AuctionClosedEvent): Promise<void> {
    this.auctionGateway.emitAuctionClosed(payload.auctionId);

    await this.auctionGateway.emitAuctionUpdated({
      auctionId: payload.auctionId,
      status: payload.status,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_WINNER)
  handleAuctionWinner(payload: AuctionWinnerEvent): void {
    this.auctionGateway.emitAuctionWinner({
      auctionId: payload.auctionId,
      winnerId: payload.winnerId,
      username: payload.username,
      bidAmount: payload.bidAmount,
      profileImageUrl: payload.profileImageUrl,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_REOPENED)
  async handleAuctionReopened(payload: AuctionReopenedEvent): Promise<void> {
    this.auctionGateway.emitAuctionReopened({
      auctionId: payload.auctionId,
      startTime: payload.startTime,
      endTime: payload.endTime,
    });

    await this.auctionGateway.emitAuctionUpdated({
      auctionId: payload.auctionId,
      status: payload.status,
      endTime: payload.endTime,
    });
  }
}
