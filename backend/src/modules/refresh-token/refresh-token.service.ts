import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED } from '@modules/refresh-token/refresh-token.constant';
import { ActiveSessionResponseDto } from '@modules/refresh-token/dtos/active-session.response.dto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async saveRefreshToken(
    userId: string,
    token: string,
    deviceId?: string,
    provider = 'local',
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const existingSession = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        deviceId,
        provider,
      },
    });

    if (existingSession) {
      await this.prisma.refreshToken.update({
        where: {
          id: existingSession.id,
        },
        data: {
          token,
          ip,
          userAgent,
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          revokedAt: null,
        },
      });

      return;
    }

    await this.prisma.refreshToken.create({
      data: {
        userId,
        deviceId,
        provider,
        token,
        ip,
        userAgent,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async existsRefreshToken(
    userId: string,
    token: string,
    provider = 'local',
  ): Promise<boolean> {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        userId: userId,
        token: token,
        provider: provider,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    return !!tokenRecord;
  }

  async revokeRefreshToken(
    userId: string,
    token: string,
    provider = 'local',
  ): Promise<void> {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token,
        provider,
        revokedAt: null,
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException(ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED);
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });
  }

  async getActiveSessions(userId: string): Promise<ActiveSessionResponseDto[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
      select: {
        id: true,
        provider: true,
        deviceId: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
    });

    if (!session) {
      throw new UnauthorizedException(ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED);
    }

    await this.prisma.refreshToken.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });
  }
}
