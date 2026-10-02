import type { AuctionStatus } from '@generated/prisma/enums';

export class AuctionStartedEvent {
  constructor(
    public readonly eventId: string,
    public readonly sellerId: string,
    public readonly auctionId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly title: string,
    public readonly status: AuctionStatus,
  ) {}
}
