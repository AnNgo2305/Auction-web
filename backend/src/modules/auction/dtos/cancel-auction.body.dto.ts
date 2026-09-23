import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelAuctionDto {
  @ApiProperty({
    description: 'Reason for canceling the auction',
    maxLength: 1000,
    example: 'Seller is unable to fulfill the auction order.',
  })
  @IsNotEmpty({ message: 'Cancel reason is required' })
  @IsString({ message: 'Cancel reason must be a string' })
  @MaxLength(1000, {
    message: 'Cancel reason must not exceed 1000 characters',
  })
  cancelReason!: string;
}
