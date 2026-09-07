import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@generated/prisma/enums';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { AuctionService } from '@modules/auction/services/auction.service';
import { CreateAuctionDto } from '@modules/auction/dtos/create-auction.body.dto';
import { UpdateAuctionDto } from '@modules/auction/dtos/update-auction.body.dto';
import { SearchAuctionsQueryDto } from '@modules/auction/dtos/search-auctions.query.dto';
import { CancelAuctionDto } from '@modules/auction/dtos/cancel-auction.body.dto';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Post()
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.CREATED)
  async createAuction(
    @Req() req: Request,
    @Body() dto: CreateAuctionDto,
  ): Promise<ResponsePayload> {
    await this.auctionService.createAuction(req.user!.userId, dto);

    return {
      message: 'Auction created successfully',
      data: {},
    };
  }

  @Get()
  @Throttle({
    short: { ttl: 1_000, limit: 15 },
    medium: { ttl: 10_000, limit: 75 },
    long: { ttl: 60_000, limit: 300 },
  })
  @HttpCode(HttpStatus.OK)
  async searchAuctions(
    @Query() query: SearchAuctionsQueryDto,
  ): Promise<ResponsePayload> {
    const auctions = await this.auctionService.searchAuctions(query);

    return {
      message: 'Auctions retrieved successfully',
      data: auctions,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Get('me')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  async getMyAuctions(
    @Req() req: Request,
    @Query() query: SearchAuctionsQueryDto,
  ): Promise<ResponsePayload> {
    const auctions = await this.auctionService.getMyAuctions(
      req.user!.userId,
      query,
    );

    return {
      message: 'Auctions retrieved successfully',
      data: auctions,
    };
  }

  @Get(':id')
  @Auth(AuthType.OPTIONAL)
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 500 },
  })
  @HttpCode(HttpStatus.OK)
  async getAuctionById(
    @Param('id') auctionId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const auction = await this.auctionService.getAuctionById(
      auctionId,
      req.user?.userId,
    );

    return {
      message: 'Auction retrieved successfully',
      data: auction,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put(':id')
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  async updateAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
    @Body() dto: UpdateAuctionDto,
  ): Promise<ResponsePayload> {
    await this.auctionService.updateAuction(req.user!.userId, auctionId, dto);

    return {
      message: 'Auction updated successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/cancel')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  async cancelAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
    @Body() dto: CancelAuctionDto,
  ): Promise<ResponsePayload> {
    await this.auctionService.cancelAuction(
      req.user!.userId,
      auctionId,
      dto.cancelReason,
    );

    return {
      message: 'Auction cancelled successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/resubmit')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  async resubmitAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionService.resubmitAuction(req.user!.userId, auctionId);

    return {
      message: 'Auction resubmitted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/end')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  async endAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionService.endAuction(req.user!.userId, auctionId);

    return {
      message: 'Auction ended successfully',
      data: {},
    };
  }
}
