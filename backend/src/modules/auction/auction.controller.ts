import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionBodyDto } from './dtos/create-auction.body.dto';
import { CreateAuctionResponseDto } from './dtos/create-auction.response.dto';
import { GetAuctionDetailResponseDto } from './dtos/get-auction-detail.response.dto';
import { CancelAuctionDto } from './dtos/cancel-auction.body.dto';
import { UpdateAuctionBodyDto } from './dtos/update-auction.body.dto';
import { SearchAuctionQueryDto } from './dtos/search-auction.query.dto';
import { PaginationResult } from '@common/types/pagination.interface';
import { AuctionListItemDto } from './dtos/search-auction.response.dto';
import { Request } from 'express';
import { AuthType } from '@common/types/auth-type.enum';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@generated/prisma/enums';
import { ResponsePayload } from '@common/types/response.interface';
import { ExtendAuctionDto } from '@modules/auction/dtos/extend-auction.body.dto';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  async createAuction(
    @Req() req: Request,
    @Body() dto: CreateAuctionBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const auction: CreateAuctionResponseDto =
      await this.auctionService.createAuction(userId as string, dto);
    return {
      message: 'Auction created successfully',
      data: auction,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAuctionDetail(
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    const auction: GetAuctionDetailResponseDto =
      await this.auctionService.getAuctionDetail(auctionId);
    return {
      message: 'Auction detail retrieved successfully',
      data: auction,
    };
  }

  @Patch(':id/confirm')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async confirmAuction(
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionService.confirmAuction(auctionId);
    return {
      message: 'Auction confirmed successfully',
      data: {},
    };
  }

  @Patch(':id/cancel')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cancelAuction(
    @Param('id') auctionId: string,
    @Body() dto: CancelAuctionDto,
  ): Promise<ResponsePayload> {
    await this.auctionService.cancelAuction(auctionId, dto);
    return {
      message: 'Auction canceled successfully',
      data: {},
    };
  }

  @Put(':id')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.OK)
  async updateAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
    @Body() dto: UpdateAuctionBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    await this.auctionService.updateAuction(userId, auctionId, dto);
    return {
      message: 'Auction updated successfully',
      data: {},
    };
  }

  @Patch(':id/close')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER, Role.ADMIN)
  async closeAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    await this.auctionService.closeAuction(
      userId as string,
      userRole as Role,
      auctionId,
    );
    return {
      message: 'Auction closed successfully',
      data: null,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async searchAuctions(
    @Query() dto: SearchAuctionQueryDto,
  ): Promise<ResponsePayload> {
    const result: PaginationResult<AuctionListItemDto> =
      await this.auctionService.searchAuctions(dto);
    return {
      message: 'Auctions retrieved successfully',
      data: result,
    };
  }

  @Patch(':id/reopen')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reopenAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as Role;

    await this.auctionService.reopenAuction(userId, userRole, auctionId);
    return {
      message: 'Auction reopened successfully',
      data: {},
    };
  }

  @Patch(':id/extend')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.OK)
  async extendAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
    @Body() dto: ExtendAuctionDto,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId as string;
    await this.auctionService.extendAuction(sellerId, auctionId, dto);
    return {
      message: 'Auction extended successfully',
      data: {},
    };
  }
}
