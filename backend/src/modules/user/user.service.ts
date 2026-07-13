import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import {
  ERROR_USER_ALREADY_BANNED,
  ERROR_USER_NOT_BANNED,
  ERROR_USER_NOT_FOUND,
  ERROR_WARNING_NOT_FOUND,
} from '@modules/user/user.constant';
import { UserInfoResponseDto } from '@modules/user/dtos/user-info.response.dto';
import { CreateUserResponseDto } from '@modules/user/dtos/create-user.response.dto';
import { UserQueryDto } from '@modules/user/dtos/get-users.query.dto';
import { Prisma, Role } from '../../../generated/prisma/client';
import { PaginationResult } from '@common/types/pagination.interface';
import { CreateWarningDto } from '@modules/user/dtos/create-warning.body.dto';
import { BanUserResponseDto } from '@modules/user/dtos/ban-user.response.dto';
import { UserWarningStatusDto } from '@modules/user/dtos/get-warning.response.dto';
import { MeResponseDto } from '@modules/user/dtos/me.response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findUsers(
    filter: UserQueryDto,
  ): Promise<
    PaginationResult<Omit<UserInfoResponseDto, 'password' | 'profile'>>
  > {
    const {
      email,
      username,
      role,
      isVerified,
      isBanned,
      createdAfter,
      createdBefore,
      limit = 10,
      offset = 0,
    } = filter;

    const where: Prisma.UserWhereInput = {};

    if (email) where.email = { contains: email };
    if (username) where.username = { contains: username };
    if (role) where.role = role;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (isBanned !== undefined) where.isBanned = isBanned;
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = new Date(createdAfter);
      if (createdBefore) where.createdAt.lte = new Date(createdBefore);
    }

    const [totalItems, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        select: {
          userId: true,
          email: true,
          username: true,
          role: true,
          isVerified: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      meta: {
        totalItems,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  async createWarning(
    userId: string,
    createWarningDto: CreateWarningDto,
    adminId: string,
  ): Promise<UserWarningStatusDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) throw new NotFoundException(ERROR_USER_NOT_FOUND);
    if (user.isBanned) throw new ConflictException(ERROR_USER_ALREADY_BANNED);

    return this.prisma.$transaction(async (prisma) => {
      await prisma.warning.create({
        data: {
          userId,
          adminId,
          reason: createWarningDto.reason,
          description: createWarningDto.description,
        },
      });

      const warningCount = await prisma.warning.count({ where: { userId } });
      const updatedUser = await prisma.user.update({
        where: { userId },
        data: {
          warningCount,
          isBanned: warningCount >= 3,
        },
        select: {
          userId: true,
          warningCount: true,
          isBanned: true,
          receivedWarnings: {
            select: {
              warningId: true,
              userId: true,
              adminId: true,
              reason: true,
              description: true,
              createdAt: true,
            },
          },
        },
      });

      return {
        userId: updatedUser.userId,
        warningCount: updatedUser.warningCount,
        isBanned: updatedUser.isBanned,
        warnings: updatedUser.receivedWarnings,
      };
    });
  }

  async banUser(userId: string): Promise<BanUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (user.isBanned) {
      throw new ConflictException(ERROR_USER_ALREADY_BANNED);
    }

    const updatedUser = await this.prisma.user.update({
      where: { userId },
      data: { isBanned: true },
    });

    return {
      userId: updatedUser.userId,
      email: updatedUser.email,
      isBanned: updatedUser.isBanned,
      warningCount: updatedUser.warningCount,
      bannedAt: updatedUser.updatedAt,
    };
  }

  async unbanUser(userId: string): Promise<BanUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (!user.isBanned) {
      throw new ConflictException(ERROR_USER_NOT_BANNED);
    }

    const updatedUser = await this.prisma.user.update({
      where: { userId },
      data: { isBanned: false },
    });

    return {
      userId: updatedUser.userId,
      email: updatedUser.email,
      isBanned: updatedUser.isBanned,
      warningCount: updatedUser.warningCount,
    };
  }

  async getUserWarnings(userId: string): Promise<UserWarningStatusDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        receivedWarnings: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    return {
      userId: user.userId,
      warningCount: user.warningCount,
      isBanned: user.isBanned,
      warnings: user.receivedWarnings.map((w) => ({
        warningId: w.warningId,
        userId: w.userId,
        adminId: w.adminId,
        reason: w.reason,
        description: w.description,
        createdAt: w.createdAt,
      })),
    };
  }

  async removeWarning(warningId: string): Promise<UserWarningStatusDto> {
    const warning = await this.prisma.warning.findUnique({
      where: { warningId },
    });
    if (!warning) throw new NotFoundException(ERROR_WARNING_NOT_FOUND);

    const result = await this.prisma.$transaction(async (prisma) => {
      await prisma.warning.delete({ where: { warningId } });
      const newWarningCount = await prisma.warning.count({
        where: { userId: warning.userId },
      });

      const updatedUser = await prisma.user.update({
        where: { userId: warning.userId },
        data: {
          warningCount: newWarningCount,
          isBanned: newWarningCount >= 3,
        },
      });

      const remainingWarnings = await prisma.warning.findMany({
        where: { userId: warning.userId },
        orderBy: { createdAt: 'asc' },
      });

      return {
        user: updatedUser,
        warnings: remainingWarnings,
      };
    });

    return {
      userId: result.user.userId,
      warningCount: result.user.warningCount,
      isBanned: result.user.isBanned,
      warnings: result.warnings.map((w) => ({
        warningId: w.warningId,
        userId: w.userId,
        adminId: w.adminId,
        reason: w.reason,
        description: w.description ?? undefined,
        createdAt: w.createdAt,
      })),
    };
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
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      profileImageUrl: user.profile?.profileImageUrl ?? null,
      coverImageUrl: user.profile?.coverImageUrl ?? null,
    };
  }
}
