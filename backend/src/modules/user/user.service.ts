import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { ERROR_USER_NOT_EXIST } from '@modules/user/user.constant';
import { UserInfoResponseDto } from '@modules/user/dtos/user-info.response.dto';
import { CreateUserResponseDto } from '@modules/user/dtos/create-user.response.dto';
import { Role } from '@generated/prisma/enums';
import { MeResponseDto } from '@modules/user/dtos/me.response.dto';
import { FileService } from '@common/services/file.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async findUser(email: string): Promise<UserInfoResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email: email },
      select: {
        userId: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isVerified: true,
        isBanned: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        profile: {
          select: {
            profileImageUrl: true,
            coverImageUrl: true,
          },
        },
      },
    });
  }

  async createUser(
    email: string,
    username: string,
    password: string,
    role: Role,
  ): Promise<CreateUserResponseDto> {
    return this.prisma.user.create({
      data: {
        email,
        username,
        password,
        role,
        isVerified: false,
        isBanned: false,
      },
      select: {
        userId: true,
        email: true,
      },
    });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { userId: true },
    });
    return !!user;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { userId: true },
    });
    return !!user;
  }

  async findUserById(
    userId: string,
  ): Promise<Omit<
    UserInfoResponseDto,
    'password' | 'failedLoginAttempts' | 'lockedUntil' | 'profile'
  > | null> {
    return this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async incrementFailedLoginAttempts(userId: string): Promise<number> {
    const user = await this.prisma.user.update({
      where: { userId },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
      select: {
        failedLoginAttempts: true,
      },
    });

    return user.failedLoginAttempts;
  }

  async lockUser(userId: string, lockedUntil: Date): Promise<void> {
    await this.prisma.user.update({
      where: { userId },
      data: {
        lockedUntil,
        failedLoginAttempts: 0,
      },
    });
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        username: true,
        role: true,
        profile: {
          select: {
            profileImageUrl: true,
            coverImageUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_EXIST);
    }

    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      profileImageUrl: user.profile?.profileImageUrl
        ? this.fileService.getPublicUrl(user.profile.profileImageUrl)
        : null,
      coverImageUrl: user.profile?.coverImageUrl
        ? this.fileService.getPublicUrl(user.profile.coverImageUrl)
        : null,
    };
  }
}
