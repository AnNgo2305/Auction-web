import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { GetProfileResponseDto } from '@modules/profile/dtos/get-profile.response.dto';
import {
  ERROR_INVALID_CURRENT_PASSWORD,
  ERROR_PASSWORD_CONFIRM_MISMATCH,
  ERROR_PASSWORD_UNCHANGED,
  ERROR_PROFILE_NOT_FOUND,
  ERROR_USER_NOT_FOUND,
  ERROR_PROFILE_ALREADY_EXISTS,
} from '@modules/profile/profile.constant';
import { UpdateProfileDto } from '@modules/profile/dtos/update-profile.body.dto';
import { FileService } from '@common/services/file.service';
import { UpdateProfileResponseDto } from '@modules/profile/dtos/update-profile.response.dto';
import { Role } from '@generated/prisma/enums';
import { FollowService } from '@modules/follow/follow.service';
import { ChangePasswordDto } from '@modules/profile/dtos/change-password.body.dto';
import { PasswordService } from '@common/services/password.service';
import { LoggerService } from '@common/services/logger.service';
import { RelationshipStatus } from '@modules/follow/follow.constant';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly followService: FollowService,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService,
  ) {}

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    this.logger.log(`User ${userId} is attempting to change password`);
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      this.logger.warn(`Change password failed: user not found (${userId})`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      this.logger.warn(`Password confirmation mismatch for user ${userId}`);
      throw new BadRequestException(ERROR_PASSWORD_CONFIRM_MISMATCH);
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      this.logger.warn(`Invalid current password attempt for user ${userId}`);
      throw new UnauthorizedException(ERROR_INVALID_CURRENT_PASSWORD);
    }

    const isSamePassword = await this.passwordService.comparePassword(
      dto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      this.logger.warn(`User ${userId} tried to reuse the same password`);
      throw new ConflictException(ERROR_PASSWORD_UNCHANGED);
    }

    const passwordHash = await this.passwordService.hashPassword(
      dto.newPassword,
    );

    await this.prisma.user.update({
      where: { userId },
      data: {
        password: passwordHash,
      },
    });
    this.logger.log(`Password changed successfully for user ${userId}`);
  }

  async createProfile(userId: string): Promise<void> {
    this.logger.log(`Create profile requested for userId=${userId}`);

    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      this.logger.warn(`Profile already exists for userId=${userId}`);
      throw new ConflictException(ERROR_PROFILE_ALREADY_EXISTS);
    }

    try {
      await this.prisma.profile.create({
        data: { userId },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`[Profile] race condition detected: ${userId}`);
          throw new ConflictException(ERROR_PROFILE_ALREADY_EXISTS);
        }
      }

      throw error;
    }

    this.logger.log(`Profile created successfully for userId=${userId}`);
  }

  async getUserProfile(
    userId: string,
    currentUserId?: string,
  ): Promise<GetProfileResponseDto> {
    this.logger.log(
      `Fetching profile for userId=${userId}${currentUserId ? `, requestedBy=${currentUserId}` : ''}`,
    );

    const relationship = await this.followService.getFollowStatus(
      userId,
      currentUserId,
    );

    if (relationship.status === RelationshipStatus.BLOCKED) {
      this.logger.warn(
        `User ${currentUserId} is blocked by user ${userId} and cannot view the profile`,
      );

      throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
    }

    const info = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        profile: {
          select: {
            fullName: true,
            phoneNumber: true,
            profileImageUrl: true,
            bio: true,
            dateOfBirth: true,
            gender: true,
            coverImageUrl: true,
          },
        },
      },
    });

    if (!info) {
      this.logger.warn(`Profile not found for userId=${userId}`);
      throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
    }

    const profileImageUrl = info.profile?.profileImageUrl
      ? this.fileService.getPublicUrl(info.profile.profileImageUrl)
      : null;

    const coverImageUrl = info.profile?.coverImageUrl
      ? this.fileService.getPublicUrl(info.profile.coverImageUrl)
      : null;

    let followerCount: number | undefined;
    let followingCount: number | undefined;

    if (info.role === Role.SELLER) {
      followerCount = await this.followService.countFollowers(userId);
    } else if (info.role === Role.BIDDER) {
      followingCount = await this.followService.countFollowings(userId);
    }

    let mutualFollowedSellerCount: number | undefined;
    if (
      currentUserId &&
      currentUserId !== userId &&
      info.role === Role.BIDDER
    ) {
      mutualFollowedSellerCount =
        await this.followService.countMutualFollowedSellers(
          currentUserId,
          userId,
        );
    }

    this.logger.log(`Profile fetched successfully for userId=${userId}`);
    return {
      userId: info.userId,
      email: info.email,
      username: info.username,
      role: info.role,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      fullName: info.profile?.fullName,
      phoneNumber: info.profile?.phoneNumber,
      bio: info.profile?.bio ?? null,
      dateOfBirth: info.profile?.dateOfBirth ?? null,
      gender: info.profile?.gender ?? null,
      profileImageUrl: profileImageUrl ?? null,
      coverImageUrl: coverImageUrl ?? null,
      followerCount,
      followingCount,
      relationship: {
        status: relationship.status,
        friendshipId: relationship.friendshipId,
      },
      mutualFollowedSellerCount,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    this.logger.log(`Update profile started for userId=${userId}`);

    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      this.logger.warn(`Profile not found for userId=${userId}`);
      throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        bio: dto.bio,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
      },
    });

    this.logger.log(`Profile updated for userId=${userId}`);

    return {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      bio: profile.bio,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
    };
  }

  async updateProfileImage(userId: string, imageKey: string): Promise<void> {
    this.logger.log(`Update profile image for userId=${userId}`);

    const oldImageKey = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId },
        select: {
          profileImageUrl: true,
        },
      });

      if (!profile) {
        throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
      }

      await tx.profile.update({
        where: { userId },
        data: {
          profileImageUrl: imageKey,
        },
      });

      return profile.profileImageUrl;
    });

    if (oldImageKey) {
      try {
        await this.fileService.deleteObject(oldImageKey);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to delete old profile image "${oldImageKey}" for userId=${userId}`,
        );

        throw error;
      }
    }

    this.logger.log(`Profile image updated for userId=${userId}`);
  }

  async updateCoverImage(userId: string, imageKey: string): Promise<void> {
    this.logger.log(`Update cover image for userId=${userId}`);

    const oldImageKey = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId },
        select: {
          coverImageUrl: true,
        },
      });

      if (!profile) {
        throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
      }

      await tx.profile.update({
        where: { userId },
        data: {
          coverImageUrl: imageKey,
        },
      });

      return profile.coverImageUrl;
    });

    if (oldImageKey) {
      try {
        await this.fileService.deleteObject(oldImageKey);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to delete old cover image "${oldImageKey}" for userId=${userId}`,
        );

        throw error;
      }
    }

    this.logger.log(`Cover image updated for userId=${userId}`);
  }

  async deleteProfileImage(userId: string): Promise<void> {
    this.logger.log(`Delete profile image requested for userId=${userId}`);

    const oldImageKey = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId },
        select: {
          profileImageUrl: true,
        },
      });

      if (!profile) {
        this.logger.warn(`Profile not found for userId=${userId}`);
        throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
      }

      if (!profile.profileImageUrl) {
        this.logger.log(`No profile image to delete for userId=${userId}`);
        return null;
      }

      await tx.profile.update({
        where: { userId },
        data: {
          profileImageUrl: null,
        },
      });

      return profile.profileImageUrl;
    });

    if (oldImageKey) {
      try {
        await this.fileService.deleteObject(oldImageKey);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to delete profile image "${oldImageKey}" for userId=${userId}`,
        );

        throw error;
      }
    }

    this.logger.log(`Profile image deleted for userId=${userId}`);
  }

  async deleteCoverImage(userId: string): Promise<void> {
    this.logger.log(`Delete cover image requested for userId=${userId}`);

    const oldImageKey = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { userId },
        select: {
          coverImageUrl: true,
        },
      });

      if (!profile) {
        this.logger.warn(`Profile not found for userId=${userId}`);
        throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
      }

      if (!profile.coverImageUrl) {
        this.logger.log(`No cover image to delete for userId=${userId}`);
        return null;
      }

      await tx.profile.update({
        where: { userId },
        data: {
          coverImageUrl: null,
        },
      });

      return profile.coverImageUrl;
    });

    if (oldImageKey) {
      try {
        await this.fileService.deleteObject(oldImageKey);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to delete cover image "${oldImageKey}" for userId=${userId}`,
        );

        throw error;
      }
    }

    this.logger.log(`Cover image deleted for userId=${userId}`);
  }
}
