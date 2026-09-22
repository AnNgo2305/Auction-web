import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '@generated/prisma/enums';

export class AddressResponseDto {
  @ApiProperty({
    description: 'Address ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  addressId!: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Nguyen Trai Street',
  })
  streetAddress!: string;

  @ApiProperty({
    description: 'City',
    example: 'Hanoi',
  })
  city!: string;

  @ApiPropertyOptional({
    description: 'State or province',
    nullable: true,
    example: 'Cau Giay',
  })
  state?: string | null;

  @ApiPropertyOptional({
    description: 'Postal code',
    nullable: true,
    example: '100000',
  })
  postalCode?: string | null;

  @ApiProperty({
    description: 'Country',
    example: 'Vietnam',
  })
  country!: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.Home,
  })
  addressType!: AddressType;

  @ApiProperty({
    description: 'Address creation date',
    example: '2026-09-21T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Address last update date',
    example: '2026-09-21T12:00:00.000Z',
  })
  updatedAt!: Date;
}
