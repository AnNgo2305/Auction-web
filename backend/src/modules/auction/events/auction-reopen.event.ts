import { AuctionEvent } from '@modules/auction/events/auction.event';

export class AuctionReopenedEvent extends AuctionEvent {
  constructor(
    eventId: string,
    auctionId: string,
    sellerId: string,
    title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
