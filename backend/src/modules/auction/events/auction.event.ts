import type { AuctionStatus } from '@generated/prisma/enums';

export class AuctionEvent {
  constructor(
    public readonly eventId: string,
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly title: string,
  ) {}
}

export class AuctionCreatedEvent extends AuctionEvent {}

export class AuctionUpdatedEvent extends AuctionEvent {}

export class AuctionCancelledEvent extends AuctionEvent {}

export class AuctionClosedEvent extends AuctionEvent {
  constructor(
    eventId: string,
    auctionId: string,
    sellerId: string,
    title: string,
    public readonly status: AuctionStatus,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}

export class AuctionResubmittedEvent extends AuctionEvent {}

export class AuctionEndedEvent extends AuctionEvent {
  constructor(
    eventId: string,
    auctionId: string,
    sellerId: string,
    title: string,
    public readonly isManual: boolean,
    public readonly status: AuctionStatus,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
