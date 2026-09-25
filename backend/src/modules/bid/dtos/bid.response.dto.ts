import { ApiProperty } from '@nestjs/swagger';

export class BidResponseDto {
  @ApiProperty({
    description: 'Bid ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  bidId!: string;

  @ApiProperty({
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'Auction title',
    example: 'iPhone 17 Pro Max',
  })
  auctionTitle!: string;

  @ApiProperty({
    description: 'Bidder username',
    example: 'nguyenvana',
  })
  username!: string;

  @ApiProperty({
    description: 'Bidder profile image URL',
    example: 'https://example.com/images/avatar.jpg',
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    description: 'Bid amount',
    example: 23000000,
  })
  bidAmount!: number;

  @ApiProperty({
    description: 'Time when the bid was placed',
    example: '2026-09-23T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Current auction end time after placing the bid',
    example: '2026-09-23T12:00:00.000Z',
  })
  endTime?: Date;

  @ApiProperty({
    description: 'Whether the auction end time was extended by this bid',
    example: false,
  })
  extended?: boolean;
}
