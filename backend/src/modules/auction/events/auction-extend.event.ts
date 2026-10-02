import { AuctionEvent } from '@modules/auction/events/auction.event';
import type { AuctionStatus } from '@generated/prisma/enums';

export class AuctionExtendedEvent extends AuctionEvent {
  constructor(
    public readonly eventId: string,
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly title: string,
    public readonly endTime: Date,
    public readonly status: AuctionStatus,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
