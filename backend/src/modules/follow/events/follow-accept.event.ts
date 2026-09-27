export class FollowAcceptEvent {
  constructor(
    public readonly eventId: string,
    public readonly bidderId: string,
    public readonly sellerId: string,
  ) {}
}
