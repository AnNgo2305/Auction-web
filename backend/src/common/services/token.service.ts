import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import {
  AccessTokenPayload,
  AccessTokenPayloadInput,
  RefreshTokenPayloadInput,
  RefreshTokenPayload,
} from '@common/types/token-payload.interface';
import {
  ERROR_ACCESS_TOKEN_EXPIRED,
  ERROR_INVALID_ACCESS_TOKEN,
  ERROR_INVALID_REFRESH_TOKEN,
  ERROR_REFRESH_TOKEN_EXPIRED,
  ERROR_UNKNOWN_ACCESS_TOKEN,
  ERROR_UNKNOWN_REFRESH_TOKEN,
} from '@common/constants/error.constant';
import jwtConfig from '@common/config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class TokenService {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;
  private readonly accessTokenExpiresIn: string | number;
  private readonly refreshTokenExpiresIn: string | number;

  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfigValue: ConfigType<typeof jwtConfig>,
  ) {
    this.accessTokenKey = this.jwtConfigValue.accessTokenKey;
    this.refreshTokenKey = this.jwtConfigValue.refreshTokenKey;
    this.accessTokenExpiresIn = this.jwtConfigValue.accessTokenExpiresIn;
    this.refreshTokenExpiresIn = this.jwtConfigValue.refreshTokenExpiresIn;
  }

  async generateAccessToken(payload: AccessTokenPayloadInput): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.accessTokenKey,
        expiresIn: this.accessTokenExpiresIn,
        algorithm: 'HS256',
      });
    } catch {
      throw new Error('Failed to generate access token');
    }
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.accessTokenKey,
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(ERROR_ACCESS_TOKEN_EXPIRED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(ERROR_INVALID_ACCESS_TOKEN);
      }
      throw new UnauthorizedException(ERROR_UNKNOWN_ACCESS_TOKEN);
    }
  }

  async generateRefreshToken(
    payload: RefreshTokenPayloadInput,
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.refreshTokenKey,
        expiresIn: this.refreshTokenExpiresIn,
        algorithm: 'HS256',
      });
    } catch {
      throw new Error('Failed to generate refresh token');
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.refreshTokenKey,
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(ERROR_REFRESH_TOKEN_EXPIRED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(ERROR_INVALID_REFRESH_TOKEN);
      }
      throw new UnauthorizedException(ERROR_UNKNOWN_REFRESH_TOKEN);
    }
  }
}
