export class FollowRequestEvent {
  constructor(
    public readonly bidderId: string,
    public readonly sellerId: string,
  ) {}
}
