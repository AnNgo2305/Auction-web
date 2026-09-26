export class AuctionWinnerEvent {
  constructor(
    public readonly auctionId: string,
    public readonly winnerId: string,
    public readonly username: string,
    public readonly winningBid: number,
    public readonly profileImageUrl: string | null,
  ) {}
}
