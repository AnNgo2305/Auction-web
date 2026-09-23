import {
  Controller,
  Post,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { Roles } from '@common/decorators/roles.decorator';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Role } from '@generated/prisma/enums';
import { Request } from 'express';
import { ResponsePayload } from '@common/types/response.interface';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import {
  ERROR_ALREADY_BLOCKED,
  ERROR_ALREADY_FOLLOWED,
  ERROR_ALREADY_REQUESTED,
  ERROR_BIDDER_NOT_FOUND,
  ERROR_CANNOT_BLOCK_SELF,
  ERROR_CANNOT_CANCEL_SELF,
  ERROR_CANNOT_DECLINE_SELF,
  ERROR_CANNOT_FOLLOW_SELF,
  ERROR_CANNOT_UNBLOCK_SELF,
  ERROR_CANNOT_UNFOLLOW_SELF,
  ERROR_FOLLOW_BLOCKED,
  ERROR_NO_FOLLOW_REQUEST,
  ERROR_NOT_BLOCKED,
  ERROR_NOT_FOLLOWING,
  ERROR_SELLER_NOT_FOUND,
  ERROR_UNFOLLOW_BLOCKED,
} from '@modules/follow/follow.constant';
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';
import { BlockedUsersResponseDto } from '@modules/follow/dtos/get-blocked-users.response.dto';
import { FollowersResponseDto } from '@modules/follow/dtos/get-followers.response.dto';
import { FollowingsResponseDto } from '@modules/follow/dtos/get-followings.response.dto';
import { ReceivedFollowRequestsCursorResponseDto } from '@modules/follow/dtos/get-received-follow-requests.response.dto';
import { SentFollowRequestsResponseDto } from '@modules/follow/dtos/get-sent-follow-requests.response.dto';

@ApiTags('Follows')
@ApiExtraModels(
  FollowUserDto,
  BlockedUsersResponseDto,
  FollowersResponseDto,
  FollowingsResponseDto,
  ReceivedFollowRequestsCursorResponseDto,
  SentFollowRequestsResponseDto,
)
@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow/:sellerId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Follow a seller',
    description: 'Sends a follow request to a seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'sellerId',
    type: String,
    format: 'uuid',
    description: 'Seller ID to follow',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Follow request sent successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Follow request sent successfully',
      data: {},
    },
  })
  @ApiForbiddenResponse({
    description: 'Follow request is blocked',
    type: ErrorResponse,
    example: ERROR_FOLLOW_BLOCKED,
  })
  @ApiNotFoundResponse({
    description: 'Bidder or seller was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
    },
  })
  @ApiConflictResponse({
    description: 'Follow request cannot be created',
    type: ErrorResponse,
    examples: {
      cannotFollowSelf: {
        summary: 'Cannot follow yourself',
        value: ERROR_CANNOT_FOLLOW_SELF,
      },
      alreadyRequested: {
        summary: 'Follow request already exists',
        value: ERROR_ALREADY_REQUESTED,
      },
      alreadyFollowed: {
        summary: 'Already following seller',
        value: ERROR_ALREADY_FOLLOWED,
      },
    },
  })
  async follow(
    @Req() req: Request,
    @Param('sellerId') sellerId: string,
  ): Promise<ResponsePayload> {
    const bidderId = req.user?.userId;
    await this.followService.follow(bidderId as string, sellerId);
    return {
      message: 'Follow request sent successfully',
      data: {},
    };
  }

  @Post('unfollow/:sellerId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unfollow a seller',
    description: 'Stops following a seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'sellerId',
    type: String,
    format: 'uuid',
    description: 'Seller ID to unfollow',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Unfollow successful',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Unfollow successful',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder or seller was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Unfollow request is blocked',
    type: ErrorResponse,
    example: ERROR_UNFOLLOW_BLOCKED,
  })
  @ApiConflictResponse({
    description: 'Unfollow request cannot be completed',
    type: ErrorResponse,
    examples: {
      cannotUnfollowSelf: {
        summary: 'Cannot unfollow yourself',
        value: ERROR_CANNOT_UNFOLLOW_SELF,
      },
      notFollowing: {
        summary: 'Not following seller',
        value: ERROR_NOT_FOLLOWING,
      },
    },
  })
  async unfollow(
    @Req() req: Request,
    @Param('sellerId') sellerId: string,
  ): Promise<ResponsePayload> {
    const bidderId = req.user?.userId;
    await this.followService.unfollow(bidderId as string, sellerId);
    return {
      message: 'Unfollow successful',
      data: {},
    };
  }

  @Post('accept/:bidderId')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept a follow request',
    description: 'Accepts a pending follow request from a bidder.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'bidderId',
    type: String,
    format: 'uuid',
    description: 'Bidder ID whose follow request should be accepted',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Follow request accepted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Follow request accepted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder or seller was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Unfollow request is blocked',
    type: ErrorResponse,
    example: ERROR_UNFOLLOW_BLOCKED,
  })
  @ApiConflictResponse({
    description: 'Unfollow request cannot be completed',
    type: ErrorResponse,
    examples: {
      cannotUnfollowSelf: {
        summary: 'Cannot unfollow yourself',
        value: ERROR_CANNOT_UNFOLLOW_SELF,
      },
      notFollowing: {
        summary: 'Not following seller',
        value: ERROR_NOT_FOLLOWING,
      },
    },
  })
  async accept(
    @Req() req: Request,
    @Param('bidderId') bidderId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.accept(sellerId as string, bidderId);

    return {
      message: 'Follow request accepted successfully',
      data: {},
    };
  }

  @Post('decline/:bidderId')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decline a follow request',
    description: 'Declines a pending follow request from a bidder.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'bidderId',
    type: String,
    format: 'uuid',
    description: 'Bidder ID whose follow request should be declined',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Decline successful',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Decline successful',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder, seller, or pending follow request was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
      noFollowRequest: {
        summary: 'Follow request not found',
        value: ERROR_NO_FOLLOW_REQUEST,
      },
    },
  })
  @ApiConflictResponse({
    description: ERROR_CANNOT_DECLINE_SELF.message,
    type: ErrorResponse,
    example: ERROR_CANNOT_DECLINE_SELF,
  })
  async decline(
    @Req() req: Request,
    @Param('bidderId') bidderId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.decline(sellerId as string, bidderId);
    return {
      message: 'Decline successful',
      data: {},
    };
  }

  @Post('cancel/:sellerId')
  @Roles(Role.BIDDER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a follow request',
    description: 'Cancels a pending follow request sent to a seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'sellerId',
    type: String,
    format: 'uuid',
    description: 'Seller ID whose follow request should be cancelled',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Cancel follow request successful',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Cancel follow request successful',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder, seller, or follow request was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
      noFollowRequest: {
        summary: 'Follow request not found',
        value: ERROR_NO_FOLLOW_REQUEST,
      },
    },
  })
  @ApiConflictResponse({
    description: ERROR_CANNOT_CANCEL_SELF.message,
    type: ErrorResponse,
    example: ERROR_CANNOT_CANCEL_SELF,
  })
  async cancel(
    @Req() req: Request,
    @Param('sellerId') sellerId: string,
  ): Promise<ResponsePayload> {
    const bidderId = req.user?.userId;

    await this.followService.cancel(bidderId as string, sellerId);

    return {
      message: 'Cancel follow request successful',
      data: {},
    };
  }

  @Post('block/:bidderId')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Block a bidder',
    description: 'Blocks a bidder from following the seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'bidderId',
    type: String,
    format: 'uuid',
    description: 'Bidder ID to block',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Block successful',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Block successful',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder or seller was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
    },
  })
  @ApiConflictResponse({
    description: 'Block request cannot be completed',
    type: ErrorResponse,
    examples: {
      cannotBlockSelf: {
        summary: 'Cannot block yourself',
        value: ERROR_CANNOT_BLOCK_SELF,
      },
      alreadyBlocked: {
        summary: 'Bidder is already blocked',
        value: ERROR_ALREADY_BLOCKED,
      },
    },
  })
  async block(
    @Req() req: Request,
    @Param('bidderId') bidderId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.block(sellerId as string, bidderId);
    return {
      message: 'Block successful',
      data: {},
    };
  }

  @Post('unblock/:bidderId')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unblock a bidder',
    description: 'Removes a bidder from the seller’s blocked list.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'bidderId',
    type: String,
    format: 'uuid',
    description: 'Bidder ID to unblock',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Unblock successful',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Unblock successful',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Bidder, seller, or blocked relationship was not found',
    type: ErrorResponse,
    examples: {
      bidderNotFound: {
        summary: 'Bidder not found',
        value: ERROR_BIDDER_NOT_FOUND,
      },
      sellerNotFound: {
        summary: 'Seller not found',
        value: ERROR_SELLER_NOT_FOUND,
      },
      notBlocked: {
        summary: 'Bidder is not blocked',
        value: ERROR_NOT_BLOCKED,
      },
    },
  })
  @ApiConflictResponse({
    description: ERROR_CANNOT_UNBLOCK_SELF.message,
    type: ErrorResponse,
    example: ERROR_CANNOT_UNBLOCK_SELF,
  })
  async unblock(
    @Req() req: Request,
    @Param('bidderId') bidderId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;

    await this.followService.unblock(sellerId as string, bidderId);

    return {
      message: 'Unblock successful',
      data: {},
    };
  }

  @Get('followers/:sellerId')
  @Auth(AuthType.OPTIONAL)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get seller followers',
    description: 'Retrieves a paginated list of users following a seller.',
  })
  @ApiParam({
    name: 'sellerId',
    type: String,
    format: 'uuid',
    description: 'Seller ID whose followers should be retrieved',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of followers to return',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for the next page',
  })
  @ApiOkResponse({
    description: 'Followers fetched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(FollowersResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Followers fetched successfully',
      data: {
        bidders: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440000',
            username: 'john_doe',
            role: 'BIDDER',
            profileImageUrl: 'https://example.com/profile.jpg',
            relation: {
              status: 'FOLLOWING',
              friendshipId: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        nextCursor: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_SELLER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_SELLER_NOT_FOUND,
  })
  async getFollowers(
    @Req() req: Request,
    @Param('sellerId') sellerId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const viewerId = req.user?.userId;

    const result = await this.followService.getFollowers(
      sellerId,
      viewerId,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Followers fetched successfully',
      data: result,
    };
  }

  @Get('followings/:bidderId')
  @Auth(AuthType.OPTIONAL)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get bidder followings',
    description: 'Retrieves a paginated list of sellers followed by a bidder.',
  })
  @ApiParam({
    name: 'bidderId',
    type: String,
    format: 'uuid',
    description: 'Bidder ID whose followings should be retrieved',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of followings to return',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for the next page',
  })
  @ApiOkResponse({
    description: 'Followings fetched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(FollowingsResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Followings fetched successfully',
      data: {
        sellers: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440000',
            username: 'john_doe',
            role: 'SELLER',
            profileImageUrl: 'https://example.com/profile.jpg',
            relation: {
              status: 'FOLLOWING',
              friendshipId: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        nextCursor: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_BIDDER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_BIDDER_NOT_FOUND,
  })
  async getFollowings(
    @Req() req: Request,
    @Param('bidderId') bidderId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const viewerId = req.user?.userId;

    const result = await this.followService.getFollowings(
      bidderId,
      viewerId,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Followings fetched successfully',
      data: result,
    };
  }

  @Get('blocked')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get blocked users',
    description: 'Retrieves a paginated list of bidders blocked by the seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiOkResponse({
    description: 'Blocked users fetched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(BlockedUsersResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Blocked users fetched successfully',
      data: {
        blockedUsers: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440000',
            username: 'blocked_user',
            role: 'BIDDER',
            profileImageUrl: 'https://example.com/profile.jpg',
            relation: {
              status: 'BLOCKED',
              friendshipId: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        nextCursor: null,
      },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of blocked users to return',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for the next page',
  })
  async getBlockedUsers(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;

    const result = await this.followService.getBlockedUsers(
      sellerId as string,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Blocked users fetched successfully',
      data: result,
    };
  }

  @Get('pending')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get pending follow requests',
    description:
      'Retrieves a paginated list of pending follow requests received by the seller.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of follow requests to return',
  })
  @ApiQuery({
    name: 'createdAt',
    required: false,
    type: String,
    format: 'date-time',
    example: '2026-09-23T08:00:00.000Z',
    description: 'Creation timestamp used as part of the pagination cursor',
  })
  @ApiQuery({
    name: 'followId',
    required: false,
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Follow ID used as part of the pagination cursor',
  })
  @ApiOkResponse({
    description: 'Pending follow requests fetched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(ReceivedFollowRequestsCursorResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Pending follow requests fetched successfully',
      data: {
        receivedFollowRequests: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440000',
            username: 'john_doe',
            role: 'BIDDER',
            profileImageUrl: 'https://example.com/profile.jpg',
            relation: {
              status: 'PENDING',
              friendshipId: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        nextCursor: {
          createdAt: '2026-09-23T08:00:00.000Z',
          followId: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  async getPendingReceivedFollowRequests(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('createdAt') createdAt?: string,
    @Query('followId') followId?: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;

    const cursor =
      createdAt && followId
        ? {
            createdAt,
            followId,
          }
        : undefined;

    const result = await this.followService.getPendingReceivedFollowRequests(
      sellerId as string,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Pending follow requests fetched successfully',
      data: result,
    };
  }

  @Get('sent')
  @Roles(Role.BIDDER)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get sent follow requests',
    description:
      'Retrieves a paginated list of follow requests sent by the bidder.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of follow requests to return',
  })
  @ApiQuery({
    name: 'createdAt',
    required: false,
    type: String,
    format: 'date-time',
    example: '2026-09-23T08:00:00.000Z',
    description: 'Creation timestamp used as part of the pagination cursor',
  })
  @ApiQuery({
    name: 'followId',
    required: false,
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Follow ID used as part of the pagination cursor',
  })
  @ApiOkResponse({
    description: 'Sent follow requests fetched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(SentFollowRequestsResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Sent follow requests fetched successfully',
      data: {
        sentFollowRequests: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440000',
            username: 'john_doe',
            role: 'SELLER',
            profileImageUrl: 'https://example.com/profile.jpg',
            relation: {
              status: 'PENDING',
              friendshipId: '550e8400-e29b-41d4-a716-446655440001',
            },
            createdAt: '2026-09-23T08:00:00.000Z',
          },
        ],
        nextCursor: {
          createdAt: '2026-09-23T08:00:00.000Z',
          followId: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  async getSentFollowRequests(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('createdAt') createdAt?: string,
    @Query('followId') followId?: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const cursor =
      createdAt && followId
        ? {
            createdAt,
            followId,
          }
        : undefined;

    const result = await this.followService.getSentFollowRequests(
      userId as string,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Sent follow requests fetched successfully',
      data: result,
    };
  }
}
