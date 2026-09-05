export class FollowAcceptEvent {
  constructor(
    public readonly bidderId: string,
    public readonly sellerId: string,
  ) {}
}
