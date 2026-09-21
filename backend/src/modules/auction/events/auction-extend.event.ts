export class AuctionExtendedEvent {
  constructor(
    public readonly auctionId: string,
    public readonly sellerId: string,
    public readonly endTime: Date,
  ) {}
}
