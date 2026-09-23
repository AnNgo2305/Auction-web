import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuctionStatus } from '@generated/prisma/enums';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  CREATED_AT = 'createdAt',
  END_TIME = 'endTime',
  CURRENT_PRICE = 'currentPrice',
  BID_COUNT = 'bidCount',
}

export class SearchAuctionsQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword in auction title or product name',
    example: 'laptop',
  })
  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Filter auctions by status',
    enum: AuctionStatus,
    example: AuctionStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(AuctionStatus, { message: 'Status must be a valid auction status' })
  status?: AuctionStatus;

  @ApiPropertyOptional({
    description: 'Minimum current price',
    type: Number,
    minimum: 0,
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Min(0, { message: 'Minimum price must be greater than or equal to 0' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum current price',
    type: Number,
    minimum: 0,
    example: 5000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Min(0, {
    message: 'Maximum price must be greater than or equal to 0',
  })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter auctions starting from this time',
    format: 'date-time',
    example: '2026-09-23T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start time from must be a valid date' })
  startTimeFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter auctions starting before this time',
    format: 'date-time',
    example: '2026-10-01T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start time to must be a valid date' })
  startTimeTo?: string;

  @ApiPropertyOptional({
    description: 'Auction ID used as the pagination cursor',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString({ message: 'Cursor must be a string' })
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of auctions to return',
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field used to sort auctions',
    enum: SortBy,
    default: SortBy.CREATED_AT,
    example: SortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortBy, {
    message: 'Sort by must be a valid sort field',
  })
  sortBy: SortBy = SortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be either asc or desc' })
  sortOrder: SortOrder = SortOrder.DESC;
}
