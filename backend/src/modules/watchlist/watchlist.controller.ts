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
  async getMyWatchlist(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ResponsePayload> {
    const watchlists = await this.watchlistService.getMyWatchlist(
      req.user!.userId,
      cursor,
      limit,
    );

    return {
      message: 'Watchlist retrieved successfully',
      data: watchlists,
    };
  }
}
