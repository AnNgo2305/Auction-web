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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiSecurity,
  getSchemaPath,
  ApiTags,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  ERROR_PASSWORD_CONFIRM_MISMATCH,
  ERROR_USER_NOT_FOUND,
} from '@modules/auth/auth.constant';
import {
  ERROR_INVALID_CURRENT_PASSWORD,
  ERROR_PASSWORD_UNCHANGED,
  ERROR_PROFILE_NOT_FOUND,
} from '@modules/profile/profile.constant';
import { ActiveSessionResponseDto } from '@modules/refresh-token/dtos/active-session.response.dto';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { UpdateCoverImageResponseDto } from '@modules/profile/dtos/update-cover-image.response.dto';
import { UpdateProfileImageResponseDto } from '@modules/profile/dtos/update-profile-image.response.dto';
import { UpdateProfileResponseDto } from '@modules/profile/dtos/update-profile.response.dto';
import { ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED } from '@modules/refresh-token/refresh-token.constant';

@ApiTags('Profile')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  ActiveSessionResponseDto,
  GetProfileResponseDto,
  UpdateProfileResponseDto,
  UpdateProfileImageResponseDto,
  UpdateCoverImageResponseDto,
)
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
  @ApiOperation({
    summary: 'Change current user password',
    description: 'Changes the password of the currently authenticated user.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    description: 'Password changed successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Password changed successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PASSWORD_CONFIRM_MISMATCH.message,
    type: ErrorResponse,
    example: ERROR_PASSWORD_CONFIRM_MISMATCH,
  })
  @ApiUnauthorizedResponse({
    description: ERROR_INVALID_CURRENT_PASSWORD.message,
    type: ErrorResponse,
    example: ERROR_INVALID_CURRENT_PASSWORD,
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_PASSWORD_UNCHANGED.message,
    type: ErrorResponse,
    example: ERROR_PASSWORD_UNCHANGED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get active sessions',
    description: 'Returns all active sessions of the current user.',
  })
  @ApiOkResponse({
    description: 'Active sessions retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ActiveSessionResponseDto) },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Active sessions retrieved successfully',
      data: [
        {
          id: 'clx123abc456',
          provider: 'password',
          deviceId: 'device-abc-123',
          ip: '192.168.1.10',
          userAgent: 'Mozilla/5.0',
          createdAt: '2026-09-21T10:00:00.000Z',
          lastUsedAt: '2026-09-21T12:30:00.000Z',
          expiresAt: '2026-10-21T10:00:00.000Z',
          isCurrent: true,
        },
      ],
    },
  })
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
  @ApiOperation({
    summary: 'Revoke an active session',
    description:
      'Revokes an active session of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Session revoked successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Session revoked successfully',
      data: {},
    },
  })
  @ApiUnauthorizedResponse({
    description: ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED.message,
    type: ErrorResponse,
    example: ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the profile of a user.',
  })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetProfileResponseDto) },
          },
        },
      ],
      example: {
        statusCode: 200,
        message: 'Get profile successfully',
        data: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          username: 'nguyenvana',
          role: 'BIDDER',
          createdAt: '2026-01-15T08:30:00.000Z',
          updatedAt: '2026-09-22T05:30:00.000Z',
          fullName: 'Nguyen Van A',
          phoneNumber: '0123456789',
          bio: 'Software developer',
          profileImageUrl: 'https://example.com/avatar.jpg',
          dateOfBirth: '2000-01-01',
          gender: 'MALE',
          coverImageUrl: 'https://example.com/cover.jpg',
          followingCount: 85,
          mutualFollowedSellerCount: 5,
          relationship: {
            status: 'FOLLOWING',
            friendshipId: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates the profile information of the currently authenticated user.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(UpdateProfileResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        fullName: 'Nguyen Van A',
        phoneNumber: '0123456789',
        bio: 'Software developer',
        dateOfBirth: '2000-01-01',
        gender: 'MALE',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PROFILE_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PROFILE_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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
  @ApiOperation({
    summary: 'Update profile image',
    description: 'Updates the current user profile image.',
  })
  @ApiBody({ type: UpdateProfileImageDto })
  @ApiOkResponse({
    description: 'Profile image updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(UpdateProfileImageResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Profile image updated successfully',
      data: {
        profileImageUrl: 'https://example.com/avatar.jpg',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PROFILE_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PROFILE_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateProfileImage(
    @Req() request: Request,
    @Body() dto: UpdateProfileImageDto,
  ): Promise<ResponsePayload> {
    const result = await this.profileService.updateProfileImage(
      request.user!.userId,
      dto.imageKey,
    );

    return {
      message: 'Profile image updated successfully',
      data: result,
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
  @ApiOperation({
    summary: 'Update cover image',
    description: 'Updates the current user cover image.',
  })
  @ApiBody({ type: UpdateCoverImageDto })
  @ApiOkResponse({
    description: 'Cover image updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UpdateCoverImageResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Cover image updated successfully',
      data: {
        coverImageUrl: 'https://example.com/cover.jpg',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PROFILE_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PROFILE_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateCoverImage(
    @Req() request: Request,
    @Body() dto: UpdateCoverImageDto,
  ): Promise<ResponsePayload> {
    const result = await this.profileService.updateCoverImage(
      request.user!.userId,
      dto.imageKey,
    );

    return {
      message: 'Cover image updated successfully',
      data: result,
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
  @ApiOperation({
    summary: 'Delete profile image',
    description: 'Deletes the current user profile image.',
  })
  @ApiOkResponse({
    description: 'Cover image deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Cover image deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PROFILE_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PROFILE_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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
  @ApiOperation({
    summary: 'Delete cover image',
    description: 'Deletes the current user cover image.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiOkResponse({
    description: 'Cover image deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Cover image deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PROFILE_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PROFILE_NOT_FOUND,
  })
  async deleteCoverImage(@Req() request: Request): Promise<ResponsePayload> {
    const userId = request.user!.userId;

    await this.profileService.deleteCoverImage(userId);

    return {
      message: 'Cover image deleted successfully',
      data: {},
    };
  }
}
