import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAuctionProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product included in the auction',
    minimum: 1,
    example: 2,
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, {
    message: 'Quantity must be greater than or equal to 1',
  })
  quantity!: number;
}

export class UpdateAuctionDto {
  @ApiPropertyOptional({
    description: 'Auction title',
    maxLength: 255,
    example: 'MacBook Pro M4 - Updated',
  })
  @IsOptional()
  @IsString({ message: 'Auction title must be a string' })
  @MaxLength(255, {
    message: 'Auction title must not exceed 255 characters',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Auction start time',
    format: 'date-time',
    example: '2026-09-25T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Auction end time',
    format: 'date-time',
    example: '2026-09-27T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End time must be a valid date' })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Starting price of the auction',
    type: Number,
    minimum: 0,
    example: 20000000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Starting price must be a number' })
  @Min(0, {
    message: 'Starting price must be greater than or equal to 0',
  })
  startingPrice?: number;

  @ApiPropertyOptional({
    description: 'Minimum amount required for each subsequent bid',
    type: Number,
    minimum: 0,
    example: 500000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum bid increment must be a number' })
  @Min(0, {
    message: 'Minimum bid increment must be greater than or equal to 0',
  })
  minimumBidIncrement?: number;

  @ApiPropertyOptional({
    description: 'Products included in the auction',
    type: [UpdateAuctionProductDto],
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Auction products must be an array' })
  @ArrayMinSize(1, {
    message: 'At least one auction product is required',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateAuctionProductDto)
  auctionProducts?: UpdateAuctionProductDto[];
}
