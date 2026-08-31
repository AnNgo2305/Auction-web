import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { parse as parseCookie } from 'cookie';
import { TokenService } from '@common/services/token.service';
import { UserService } from '@modules/user/user.service';
import {
  ERROR_MISSING_ACCESS_TOKEN,
  ERROR_USER_BANNED,
  ERROR_USER_NOT_EXIST,
  ERROR_USER_UNVERIFIED,
} from '@common/constants/error.constant';
import { UserCacheService } from '@common/cache/user.cache.service';

interface SocketData {
  userId: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly userCacheService: UserCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const token = this.extractToken(client);
    if (!token) {
      throw new UnauthorizedException(ERROR_MISSING_ACCESS_TOKEN);
    }

    let payload: { userId: string };
    try {
      payload = await this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException(ERROR_MISSING_ACCESS_TOKEN);
    }

    let user = await this.userCacheService.get(payload.userId);
    if (!user) {
      const dbUser = await this.userService.findUserById(payload.userId);
      if (!dbUser) {
        throw new NotFoundException(ERROR_USER_NOT_EXIST);
      }

      user = {
        userId: dbUser.userId,
        role: dbUser.role,
        isVerified: dbUser.isVerified,
        isBanned: dbUser.isBanned,
      };
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(ERROR_USER_UNVERIFIED);
    }
    if (user.isBanned) {
      throw new ForbiddenException(ERROR_USER_BANNED);
    }

    await this.userCacheService.set(user);
    const data = client.data as SocketData;
    data.userId = payload.userId;

    return true;
  }

  private extractToken(client: Socket): string | undefined {
    const rawCookie = client.handshake.headers.cookie;
    if (!rawCookie) return undefined;
    const cookies = parseCookie(rawCookie);
    return cookies.access_token;
  }
}
