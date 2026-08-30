import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '@common/services/token.service';
import { Socket } from 'socket.io';
import {
  ERROR_MISSING_ACCESS_TOKEN,
  ERROR_MISSING_COOKIE_HEADER,
} from '@common/constants/error.constant';
import * as cookie from 'cookie';
import { AccessTokenPayload } from '@common/types/token-payload.interface';

@Injectable()
export class WebsocketAuthService {
  constructor(private readonly tokenService: TokenService) {}

  async authenticate(client: Socket): Promise<AccessTokenPayload> {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      throw new UnauthorizedException(ERROR_MISSING_COOKIE_HEADER);
    }

    const cookies = cookie.parse(cookieHeader);
    const accessToken = cookies['access_token'];

    if (!accessToken) {
      throw new UnauthorizedException(ERROR_MISSING_ACCESS_TOKEN);
    }

    return this.tokenService.verifyAccessToken(accessToken);
  }
}
