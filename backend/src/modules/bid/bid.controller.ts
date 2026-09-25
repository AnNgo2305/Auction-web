import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@generated/prisma/enums';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SuccessResponse } from '@common/types/response.dto';
import { BidService } from './services/bid.service';
import { GetBidsQueryDto } from './dtos/get-bids.query.dto';
import { MyBidResponseDto } from './dtos/get-my-bids.response.dto';
import { AuctionBidResponseDto } from './dtos/get-auction-bids.response';
import {
  CursorPaginationMetaDto,
  PaginationResult,
} from '@common/types/pagination.interface';

@ApiTags('Bids')
@ApiExtraModels(
  SuccessResponse,
  PaginationResult,
  CursorPaginationMetaDto,
  MyBidResponseDto,
  AuctionBidResponseDto,
)
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get('me')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my bids',
    description: 'Retrieves the bidding history of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Bids retrieved successfully',
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
                        $ref: getSchemaPath(MyBidResponseDto),
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
      message: 'Bids retrieved successfully',
      data: {
        data: [
          {
            bidId: '550e8400-e29b-41d4-a716-446655440000',
            auctionId: '660e8400-e29b-41d4-a716-446655440000',
            auctionTitle: 'iPhone 17 Pro Max',
            bidAmount: 23000000,
            createdAt: '2026-09-23T10:30:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: false,
        },
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getMyBids(
    @Req() req: Request,
    @Query() query: GetBidsQueryDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const result = await this.bidService.getMyBids(userId as string, query);

    return {
      message: 'Bids retrieved successfully',
      data: result,
    };
  }

  @Get('auction/:auctionId')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get bids by auction',
    description: 'Retrieves the bidding history of an auction.',
  })
  @ApiParam({
    name: 'auctionId',
    type: String,
    description: 'Auction ID',
  })
  @ApiOkResponse({
    description: 'Auction bids retrieved successfully',
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
                        $ref: getSchemaPath(AuctionBidResponseDto),
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
      message: 'Auction bids retrieved successfully',
      data: {
        data: [
          {
            bidId: '550e8400-e29b-41d4-a716-446655440000',
            auctionId: '660e8400-e29b-41d4-a716-446655440000',
            username: 'nguyenvana',
            bidAmount: 23000000,
            createdAt: '2026-09-23T10:30:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: false,
        },
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getBidsByAuction(
    @Param('auctionId') auctionId: string,
    @Query() query: GetBidsQueryDto,
  ): Promise<ResponsePayload> {
    const result = await this.bidService.getBidsByAuction(auctionId, query);

    return {
      message: 'Auction bids retrieved successfully',
      data: result,
    };
  }
}
