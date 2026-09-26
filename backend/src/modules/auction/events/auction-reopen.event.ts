export class AuctionReopenedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {}
}
