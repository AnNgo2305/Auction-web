export class AuctionWinnerEvent {
  constructor(
    public readonly eventId: string,
    public readonly auctionId: string,
    public readonly winnerId: string,
    public readonly username: string,
    public readonly bidAmount: number,
    public readonly profileImageUrl: string | null,
  ) {}
}
