export class BidPlacedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly bidAmount: number,
    public readonly auctionTitle: string,
  ) {}
}
