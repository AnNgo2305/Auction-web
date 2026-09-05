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
  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;

  @IsOptional()
  @IsEnum(AuctionStatus, { message: 'Status must be a valid auction status' })
  status?: AuctionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Min(0, { message: 'Minimum price must be greater than or equal to 0' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Min(0, {
    message: 'Maximum price must be greater than or equal to 0',
  })
  maxPrice?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Start time from must be a valid date' })
  startTimeFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start time to must be a valid date' })
  startTimeTo?: string;

  @IsOptional()
  @IsString({ message: 'Cursor must be a string' })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit: number = 20;

  @IsOptional()
  @IsEnum(SortBy, {
    message: 'Sort by must be a valid sort field',
  })
  sortBy: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be either asc or desc' })
  sortOrder: SortOrder = SortOrder.DESC;
}
