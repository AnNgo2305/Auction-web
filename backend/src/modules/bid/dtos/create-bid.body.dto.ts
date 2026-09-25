import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateBidDto {
  @IsUUID()
  auctionId!: string;

  @IsUUID()
  tempId!: string;

  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'Bid amount must be a number',
    },
  )
  @Min(0, {
    message: 'Bid amount must be greater than or equal to 0',
  })
  bidAmount!: number;
}
