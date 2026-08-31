import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Req,
} from '@nestjs/common';
import { ProfileService } from '@modules/profile/profile.service';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Request } from 'express';
import { GetProfileResponseDto } from '@modules/profile/dtos/get-profile.response.dto';
import { UpdateProfileDto } from '@modules/profile/dtos/update-profile.body.dto';
import { ResponsePayload } from '@common/types/response.interface';
import { ChangePasswordDto } from '@modules/profile/dtos/change-password.body.dto';
import { UpdateCoverImageDto } from '@modules/profile/dtos/update-cover-image.body.dto';
import { UpdateProfileImageDto } from '@modules/profile/dtos/update-profile-image.body.dto';
import { RefreshTokenService } from '@modules/refresh-token/refresh-token.service';
import { Throttle } from '@nestjs/throttler';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Patch('password')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 1 },
    medium: { ttl: 10_000, limit: 3 },
    long: { ttl: 60_000, limit: 5 },
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() request: Request,
    @Body() dto: ChangePasswordDto,
  ): Promise<ResponsePayload> {
    const userId = request.user!.userId;

    await this.profileService.changePassword(userId, dto, request);

    return {
      message: 'Password changed successfully',
      data: {},
    };
  }

  @Get('sessions')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Req() request: Request): Promise<ResponsePayload> {
    const userId = request.user!.userId;
    const currentSessionId = request.sessionId!;

    const sessions = await this.refreshTokenService.getActiveSessions(
      userId,
      currentSessionId,
    );

    return {
      message: 'Active sessions retrieved successfully',
      data: sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Req() request: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<ResponsePayload> {
    const userId = request.user!.userId;

    await this.refreshTokenService.revokeSession(userId, sessionId);

    return {
      message: 'Session revoked successfully',
      data: {},
    };
  }

  @Get(':userId')
  @Auth(AuthType.OPTIONAL)
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 500 },
  })
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ): Promise<ResponsePayload> {
    const currentUserId = request.user?.userId;
    const profile: GetProfileResponseDto =
      await this.profileService.getUserProfile(userId, currentUserId);
    return {
      message: 'Get profile successfully',
      data: profile,
    };
  }

  @Put()
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    const updatedProfile = await this.profileService.updateProfile(
      userId,
      updateProfileDto,
    );

    return {
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }

  @Patch('avatar')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  async updateProfileImage(
    @Req() request: Request,
    @Body() dto: UpdateProfileImageDto,
  ): Promise<ResponsePayload> {
    await this.profileService.updateProfileImage(
      request.user!.userId,
      dto.imageKey,
    );

    return {
      message: 'Profile image updated successfully',
      data: {},
    };
  }

  @Patch('cover')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  async updateCoverImage(
    @Req() request: Request,
    @Body() dto: UpdateCoverImageDto,
  ): Promise<ResponsePayload> {
    await this.profileService.updateCoverImage(
      request.user!.userId,
      dto.imageKey,
    );

    return {
      message: 'Cover image updated successfully',
      data: {},
    };
  }

  @Delete('avatar')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  async deleteProfileImage(@Req() request: Request): Promise<ResponsePayload> {
    const userId = request.user!.userId;

    await this.profileService.deleteProfileImage(userId);

    return {
      message: 'Profile image deleted successfully',
      data: {},
    };
  }

  @Delete('cover')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  async deleteCoverImage(@Req() request: Request): Promise<ResponsePayload> {
    const userId = request.user!.userId;

    await this.profileService.deleteCoverImage(userId);

    return {
      message: 'Cover image deleted successfully',
      data: {},
    };
  }
}
