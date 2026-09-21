export class AuctionEvent {
  constructor(
    public readonly auctionId: string,
    public readonly sellerId: string,
  ) {}
}
