import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuctionProductDto {
  @ApiProperty({
    description: 'ID of the product to include in the auction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product to auction',
    minimum: 1,
    example: 2,
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be greater than or equal to 1' })
  quantity!: number;
}

export class CreateAuctionDto {
  @ApiProperty({
    description: 'Title of the auction',
    maxLength: 255,
    example: 'MacBook Pro M4',
  })
  @IsNotEmpty({ message: 'Auction title is required' })
  @IsString({ message: 'Auction title must be a string' })
  @MaxLength(255, { message: 'Auction title must not exceed 255 characters' })
  title!: string;

  @ApiProperty({
    description: 'Auction start time',
    format: 'date-time',
    example: '2026-09-25T08:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime!: string;

  @ApiProperty({
    description: 'Auction end time',
    format: 'date-time',
    example: '2026-09-27T08:00:00.000Z',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid date' })
  endTime!: string;

  @ApiProperty({
    description: 'Initial price of the auction',
    minimum: 0,
    example: 20000000,
  })
  @IsNotEmpty({ message: 'Starting price is required' })
  @IsNumber({}, { message: 'Starting price must be a number' })
  @Min(0, {
    message: 'Starting price must be greater than or equal to 0',
  })
  startingPrice!: number;

  @ApiProperty({
    description: 'Minimum amount by which each bid must increase',
    minimum: 0,
    example: 500000,
  })
  @IsNotEmpty({ message: 'Minimum bid increment is required' })
  @IsNumber({}, { message: 'Minimum bid increment must be a number' })
  @Min(0, {
    message: 'Minimum bid increment must be greater than or equal to 0',
  })
  minimumBidIncrement!: number;

  @ApiProperty({
    description: 'Products included in the auction',
    type: [CreateAuctionProductDto],
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
      },
    ],
  })
  @IsArray({ message: 'Auction products must be an array' })
  @ArrayMinSize(1, { message: 'At least one auction product is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateAuctionProductDto)
  auctionProducts!: CreateAuctionProductDto[];
}
