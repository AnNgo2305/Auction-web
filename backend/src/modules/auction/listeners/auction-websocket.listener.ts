import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AuctionGateway } from '@modules/auction/auction.gateway';
import { AuctionEvent } from '@modules/auction/events/auction.event';
import { AuctionStartedEvent } from '@modules/auction/events/auction-start.event';
import { AuctionExtendedEvent } from '@modules/auction/events/auction-extend.event';

@Injectable()
export class AuctionWebSocketListener {
  constructor(private readonly auctionGateway: AuctionGateway) {}

  @OnEvent(INTERNAL_EVENTS.AUCTION_STARTED)
  handleAuctionStarted(payload: AuctionStartedEvent): void {
    this.auctionGateway.emitAuctionStarted({
      auctionId: payload.auctionId,
      startTime: payload.startTime,
      endTime: payload.endTime,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_EXTENDED)
  handleAuctionExtended(payload: AuctionExtendedEvent): void {
    this.auctionGateway.emitAuctionExtended({
      auctionId: payload.auctionId,
      endTime: payload.endTime,
    });
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_ENDED)
  handleAuctionCompleted(payload: AuctionEvent): void {
    this.auctionGateway.emitAuctionCompleted(payload.auctionId);
  }

  @OnEvent(INTERNAL_EVENTS.AUCTION_CLOSED)
  handleAuctionClosed(payload: AuctionEvent): void {
    this.auctionGateway.emitAuctionClosed(payload.auctionId);
  }
}
