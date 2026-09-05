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
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  productId!: string;

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, {
    message: 'Quantity must be greater than or equal to 1',
  })
  quantity!: number;
}

export class UpdateAuctionDto {
  @IsOptional()
  @IsString({ message: 'Auction title must be a string' })
  @MaxLength(255, {
    message: 'Auction title must not exceed 255 characters',
  })
  title?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start time must be a valid date' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End time must be a valid date' })
  endTime?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Starting price must be a number' })
  @Min(0, {
    message: 'Starting price must be greater than or equal to 0',
  })
  startingPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum bid increment must be a number' })
  @Min(0, {
    message: 'Minimum bid increment must be greater than or equal to 0',
  })
  minimumBidIncrement?: number;

  @IsOptional()
  @IsArray({ message: 'Auction products must be an array' })
  @ArrayMinSize(1, {
    message: 'At least one auction product is required',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateAuctionProductDto)
  auctionProducts?: UpdateAuctionProductDto[];
}
