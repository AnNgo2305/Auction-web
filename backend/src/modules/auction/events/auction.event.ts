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

export class AuctionClosedEvent extends AuctionEvent {}

export class AuctionResubmittedEvent extends AuctionEvent {}

export class AuctionEndedEvent extends AuctionEvent {
  constructor(
    eventId: string,
    auctionId: string,
    sellerId: string,
    title: string,
    public readonly isManual: boolean,
  ) {
    super(eventId, auctionId, sellerId, title);
  }
}
