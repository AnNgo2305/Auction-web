import { AuctionEvent } from '@modules/auction/events/auction.event';
import type { AuctionStatus } from '@generated/prisma/enums';

export class AuctionReopenedEvent extends AuctionEvent {
  constructor(
    public readonly eventId: string,
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly status: AuctionStatus,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
