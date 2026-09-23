import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@generated/prisma/enums';

import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { WatchlistService } from '@modules/watchlist/watchlist.service';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { ERROR_AUCTION_NOT_FOUND } from '@modules/auction/constants/auction.constant';
import {
  ERROR_AUCTION_ALREADY_IN_WATCHLIST,
  ERROR_AUCTION_NOT_IN_WATCHLIST,
} from '@modules/watchlist/watchlist.constant';
import {
  WatchlistItemResponseDto,
  WatchlistResponseDto,
} from '@modules/watchlist/dtos/get-watchlist.response.dto';

@ApiTags('Watchlist')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  WatchlistResponseDto,
  WatchlistItemResponseDto,
)
@Controller('watchlist')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.BIDDER)
  @Post(':auctionId')
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 100 },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add auction to watchlist',
    description: 'Adds an auction to the authenticated bidder watchlist.',
  })
  @ApiParam({
    name: 'auctionId',
    type: String,
    description: 'Auction ID',
  })
  @ApiCreatedResponse({
    description: 'Auction added to watchlist successfully',
    type: SuccessResponse,
    example: {
      statusCode: 201,
      message: 'Auction added to watchlist successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_AUCTION_ALREADY_IN_WATCHLIST.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_ALREADY_IN_WATCHLIST,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async addToWatchlist(
    @Req() req: Request,
    @Param('auctionId') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.watchlistService.addToWatchlist(req.user!.userId, auctionId);

    return {
      message: 'Auction added to watchlist successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.BIDDER)
  @Delete(':auctionId')
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove auction from watchlist',
    description: 'Removes an auction from the authenticated bidder watchlist.',
  })
  @ApiParam({ name: 'auctionId', type: String, description: 'Auction ID' })
  @ApiOkResponse({
    description: 'Auction removed from watchlist successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction removed from watchlist successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_IN_WATCHLIST.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_IN_WATCHLIST,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async removeFromWatchlist(
    @Req() req: Request,
    @Param('auctionId') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.watchlistService.removeFromWatchlist(
      req.user!.userId,
      auctionId,
    );

    return {
      message: 'Auction removed from watchlist successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.BIDDER)
  @Get('me')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my watchlist',
    description:
      'Retrieves the authenticated bidder watchlist using cursor-based pagination.',
  })
  @ApiOkResponse({
    description: 'Watchlist retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        { properties: { data: { $ref: getSchemaPath(WatchlistResponseDto) } } },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Watchlist retrieved successfully',
      data: {
        watchlists: [
          {
            watchlistId: '550e8400-e29b-41d4-a716-446655440000',
            auctionId: '660e8400-e29b-41d4-a716-446655440000',
            title: 'Vintage Camera Auction',
            status: 'OPEN',
            endTime: '2026-09-30T12:00:00.000Z',
            currentPrice: 1500000,
          },
        ],
        nextCursor: '770e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getMyWatchlist(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ResponsePayload> {
    const watchlists = await this.watchlistService.getMyWatchlist(
      req.user!.userId,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Watchlist retrieved successfully',
      data: watchlists,
    };
  }
}
