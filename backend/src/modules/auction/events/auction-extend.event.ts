import { AuctionEvent } from '@modules/auction/events/auction.event';

export class AuctionExtendedEvent extends AuctionEvent {
  constructor(
    eventId: string,
    auctionId: string,
    sellerId: string,
    title: string,
    public readonly endTime: Date,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
