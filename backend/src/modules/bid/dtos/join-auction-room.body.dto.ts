import { IsUUID } from 'class-validator';

export class JoinAuctionRoomDto {
  @IsUUID()
  auctionId!: string;
}
