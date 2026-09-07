import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelAuctionDto {
  @IsNotEmpty({ message: 'Cancel reason is required' })
  @IsString({ message: 'Cancel reason must be a string' })
  @MaxLength(1000, {
    message: 'Cancel reason must not exceed 1000 characters',
  })
  cancelReason!: string;
}
