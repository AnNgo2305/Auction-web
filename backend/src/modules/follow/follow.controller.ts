import {
  Controller,
  Post,
  Patch,
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
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

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
    const userId = req.user?.userId;
    await this.followService.follow(userId as string, sellerId);
    return {
      message: 'Follow request sent successfully',
      data: {},
    };
  }

  @Patch('unfollow/:sellerId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async unfollow(
    @Req() req: Request,
    @Param('sellerId') sellerId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    await this.followService.unfollow(userId as string, sellerId);
    return {
      message: 'Unfollow successful',
      data: {},
    };
  }

  @Patch('accept/:userId')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async accept(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.accept(sellerId as string, userId);

    return {
      message: 'Follow request accepted successfully',
      data: {},
    };
  }

  @Patch('decline/:userId')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async decline(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.decline(sellerId as string, userId);
    return {
      message: 'Decline successful',
      data: {},
    };
  }

  @Patch('block/:userId')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async block(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    await this.followService.block(sellerId as string, userId);
    return {
      message: 'Block successful',
      data: {},
    };
  }

  @Get('followers/:userId')
  @HttpCode(HttpStatus.OK)
  async getFollowers(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ResponsePayload> {
    const followers: FollowUserDto[] = await this.followService.getFollowers(
      userId,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0,
    );

    return {
      message: 'Followers fetched successfully',
      data: { followers },
    };
  }

  @Get('followings/:userId')
  @HttpCode(HttpStatus.OK)
  async getFollowings(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ResponsePayload> {
    const followings: FollowUserDto[] = await this.followService.getFollowings(
      userId,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0,
    );

    return {
      message: 'Followings fetched successfully',
      data: { followings },
    };
  }

  @Get('blocked')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getBlocked(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    const blocked: FollowUserDto[] = await this.followService.getBlocked(
      sellerId as string,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0,
    );

    return {
      message: 'Blocked users fetched successfully',
      data: { blocked },
    };
  }

  @Get('pending')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getPending(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ResponsePayload> {
    const sellerId = req.user?.userId;
    const pending: FollowUserDto[] = await this.followService.getPending(
      sellerId as string,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0,
    );

    return {
      message: 'Pending follow requests fetched successfully',
      data: { pending },
    };
  }
}
