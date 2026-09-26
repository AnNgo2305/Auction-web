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
import {
  CreateAuctionDto,
  CreateAuctionProductDto,
} from '@modules/auction/dtos/create-auction.body.dto';
import {
  UpdateAuctionDto,
  UpdateAuctionProductDto,
} from '@modules/auction/dtos/update-auction.body.dto';
import { SearchAuctionsQueryDto } from '@modules/auction/dtos/search-auctions.query.dto';
import { CancelAuctionDto } from '@modules/auction/dtos/cancel-auction.body.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import {
  ERROR_AUCTION_ACCESS_DENIED,
  ERROR_AUCTION_CANNOT_CANCEL,
  ERROR_AUCTION_CANNOT_UPDATE,
  ERROR_AUCTION_DUPLICATE_PRODUCTS,
  ERROR_AUCTION_END_TIME_INVALID,
  ERROR_AUCTION_INVALID_STATUS,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_OPEN,
  ERROR_AUCTION_PRODUCT_ACCESS_DENIED,
  ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
  ERROR_AUCTION_PRODUCT_STATUS_INVALID,
  ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION,
  ERROR_AUCTION_PRODUCTS_NOT_FOUND,
  ERROR_AUCTION_START_TIME_INVALID,
} from '@modules/auction/constants/auction.constant';
import { SearchAuctionsResponseDto } from '@modules/auction/dtos/search-auctions.response.dto';
import { GetAuctionByIdResponseDto } from '@modules/auction/dtos/get-auction-by-id.response.dto';
import { PaginationResult } from '@common/types/pagination.interface';
import { AuctionLifecycleService } from '@modules/auction/services/auction-lifecycle.service';

@ApiTags('Auctions')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  SearchAuctionsResponseDto,
  PaginationResult,
  GetAuctionByIdResponseDto,
  CreateAuctionDto,
  CreateAuctionProductDto,
  UpdateAuctionDto,
  UpdateAuctionProductDto,
  CancelAuctionDto,
)
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly auctionLifecycleService: AuctionLifecycleService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Post()
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create auction',
    description:
      'Creates a new auction, reserves the specified product stock, and schedules the auction start and completion.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiBody({
    type: CreateAuctionDto,
  })
  @ApiCreatedResponse({
    description: 'Auction created successfully',
    type: SuccessResponse,
    example: {
      statusCode: 201,
      message: 'Auction created successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: 'Auction creation data is invalid',
    type: ErrorResponse,
    examples: {
      invalidStartTime: {
        summary: 'Invalid auction start time',
        value: ERROR_AUCTION_START_TIME_INVALID,
      },
      invalidEndTime: {
        summary: 'Invalid auction end time',
        value: ERROR_AUCTION_END_TIME_INVALID,
      },
      duplicateProducts: {
        summary: 'Duplicate products',
        value: ERROR_AUCTION_DUPLICATE_PRODUCTS,
      },
      productsNotFound: {
        summary: 'Products not found',
        value: ERROR_AUCTION_PRODUCTS_NOT_FOUND,
      },
      invalidProductStatus: {
        summary: 'Invalid product status',
        value: ERROR_AUCTION_PRODUCT_STATUS_INVALID,
      },
      invalidProductQuantity: {
        summary: 'Insufficient product stock',
        value: ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to use one or more products',
    type: ErrorResponse,
    example: ERROR_AUCTION_PRODUCT_ACCESS_DENIED,
  })
  @ApiConflictResponse({
    description:
      'One or more products are already assigned to an active auction',
    type: ErrorResponse,
    example: ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION,
  })
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
  @ApiOperation({
    summary: 'Search auctions',
    description:
      'Searches and filters public auctions with cursor-based pagination and configurable sorting.',
  })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PaginationResult) },
                {
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(SearchAuctionsResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Auctions retrieved successfully',
      data: {
        data: [
          {
            auctionId: '550e8400-e29b-41d4-a716-446655440000',
            title: 'MacBook Pro M4',
            startTime: '2026-09-25T08:00:00.000Z',
            endTime: '2026-09-27T08:00:00.000Z',
            startingPrice: 20000000,
            currentPrice: 22500000,
            bidCount: 5,
            status: 'OPEN',
            thumbnail: 'https://example.com/images/macbook.jpg',
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: false,
          nextCursor: null,
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Search auctions',
    description:
      'Searches and filters public auctions with cursor-based pagination and configurable sorting.',
  })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PaginationResult) },
                {
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(SearchAuctionsResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Auctions retrieved successfully',
      data: {
        data: [
          {
            auctionId: '550e8400-e29b-41d4-a716-446655440000',
            title: 'MacBook Pro M4',
            startTime: '2026-09-25T08:00:00.000Z',
            endTime: '2026-09-27T08:00:00.000Z',
            startingPrice: 20000000,
            currentPrice: 22500000,
            bidCount: 5,
            status: 'OPEN',
            thumbnail: 'https://example.com/images/macbook.jpg',
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: false,
          nextCursor: null,
        },
      },
    },
  })
  @ApiCookieAuth('access_token')
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
  @ApiOperation({
    summary: 'Get auction by ID',
    description:
      'Retrieves an auction by ID. Publicly available auctions can be viewed anonymously, while the seller can also view their own unavailable auction.',
  })
  @ApiCookieAuth('access_token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Auction retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(GetAuctionByIdResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Auction retrieved successfully',
      data: {
        auctionId: '550e8400-e29b-41d4-a716-446655440000',
        sellerId: '550e8400-e29b-41d4-a716-446655440002',
        title: 'MacBook Pro M4',
        startTime: '2026-09-25T08:00:00.000Z',
        endTime: '2026-09-27T08:00:00.000Z',
        startingPrice: 20000000,
        minimumBidIncrement: 500000,
        currentPrice: 22500000,
        bidCount: 5,
        status: 'OPEN',
        isInWatchlist: true,
        auctionProducts: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440001',
            name: 'MacBook Pro M4 14-inch',
            quantity: 1,
            thumbnailUrl: 'https://example.com/images/macbook.jpg',
            stockQuantity: 9,
          },
        ],
        createdAt: '2026-09-23T08:00:00.000Z',
        updatedAt: '2026-09-23T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
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
  @ApiOperation({
    summary: 'Update auction',
    description:
      'Updates a pending or ready auction. The seller can modify auction information and its associated products.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateAuctionDto,
  })
  @ApiOkResponse({
    description: 'Auction updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction updated successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiForbiddenResponse({
    description:
      'User does not have permission to update the auction or use one or more products',
    type: ErrorResponse,
    examples: {
      auctionAccessDenied: {
        summary: 'Auction access denied',
        value: ERROR_AUCTION_ACCESS_DENIED,
      },
      productAccessDenied: {
        summary: 'Product access denied',
        value: ERROR_AUCTION_PRODUCT_ACCESS_DENIED,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Auction update data is invalid',
    type: ErrorResponse,
    examples: {
      invalidStatus: {
        summary: 'Auction cannot be updated in its current status',
        value: ERROR_AUCTION_CANNOT_UPDATE,
      },
      invalidStartTime: {
        summary: 'Invalid auction start time',
        value: ERROR_AUCTION_START_TIME_INVALID,
      },
      invalidEndTime: {
        summary: 'Invalid auction end time',
        value: ERROR_AUCTION_END_TIME_INVALID,
      },
      duplicateProducts: {
        summary: 'Duplicate products',
        value: ERROR_AUCTION_DUPLICATE_PRODUCTS,
      },
      productsNotFound: {
        summary: 'Products not found',
        value: ERROR_AUCTION_PRODUCTS_NOT_FOUND,
      },
      invalidProductStatus: {
        summary: 'Invalid product status',
        value: ERROR_AUCTION_PRODUCT_STATUS_INVALID,
      },
      invalidProductQuantity: {
        summary: 'Insufficient product stock',
        value: ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
      },
    },
  })
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
  @ApiOperation({
    summary: 'Cancel auction',
    description:
      'Cancels an auction, restores the reserved product stock, and removes scheduled auction jobs.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CancelAuctionDto,
  })
  @ApiOkResponse({
    description: 'Auction cancelled successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction cancelled successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiForbiddenResponse({
    description: ERROR_AUCTION_ACCESS_DENIED.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_ACCESS_DENIED,
  })
  @ApiBadRequestResponse({
    description: ERROR_AUCTION_CANNOT_CANCEL.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_CANNOT_CANCEL,
  })
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
  @ApiOperation({
    summary: 'Resubmit auction',
    description:
      'Resubmits a canceled auction for admin review by changing its status to PENDING.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Auction resubmitted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction resubmitted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiForbiddenResponse({
    description: ERROR_AUCTION_ACCESS_DENIED.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_ACCESS_DENIED,
  })
  @ApiBadRequestResponse({
    description: 'Auction resubmission data is invalid',
    type: ErrorResponse,
    examples: {
      invalidStatus: {
        summary: 'Auction is not canceled',
        value: ERROR_AUCTION_INVALID_STATUS,
      },
      invalidStartTime: {
        summary: 'Invalid auction start time',
        value: ERROR_AUCTION_START_TIME_INVALID,
      },
      invalidEndTime: {
        summary: 'Invalid auction end time',
        value: ERROR_AUCTION_END_TIME_INVALID,
      },
      invalidProductQuantity: {
        summary: 'Insufficient product stock',
        value: ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
      },
    },
  })
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
  @ApiOperation({
    summary: 'End auction',
    description:
      'Manually ends an open auction and completes the auction process.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Auction ended successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction ended successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiForbiddenResponse({
    description: ERROR_AUCTION_ACCESS_DENIED.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_ACCESS_DENIED,
  })
  @ApiBadRequestResponse({
    description: ERROR_AUCTION_NOT_OPEN.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_OPEN,
  })
  async endAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionLifecycleService.endAuction(req.user!.userId, auctionId);

    return {
      message: 'Auction ended successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/confirm')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm auction',
    description: 'Confirms a pending auction and changes its status to READY.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Auction confirmed successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction confirmed successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_AUCTION_INVALID_STATUS.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_INVALID_STATUS,
  })
  async confirmAuction(
    @Req() req: Request,
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionLifecycleService.confirmAuction(
      req.user!.userId,
      auctionId,
    );

    return {
      message: 'Auction confirmed successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id/reopen')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reopen auction',
    description:
      'Reopens a closed auction for a new bidding round: hides previous bids, resets the price and bid count, and schedules a new completion time preserving the original duration.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Auction reopened successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Auction reopened successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_AUCTION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_AUCTION_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: 'Auction is not closed',
    type: ErrorResponse,
    example: ERROR_AUCTION_INVALID_STATUS,
  })
  async reopenAuction(
    @Param('id') auctionId: string,
  ): Promise<ResponsePayload> {
    await this.auctionLifecycleService.reopenAuction(auctionId);

    return {
      message: 'Auction reopened successfully',
      data: {},
    };
  }
}
