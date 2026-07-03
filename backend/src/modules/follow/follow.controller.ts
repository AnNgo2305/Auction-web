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

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow/:sellerId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getPendingReceivedFollowRequests(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;

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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getSentFollowRequests(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

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
