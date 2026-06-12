import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from '@common/services/password.service';
import { UserService } from '@modules/user/user.service';
import { TokenService } from '@common/services/token.service';
import {
  ERROR_EMAIL_ALREADY_EXISTS,
  ERROR_EMAIL_ALREADY_VERIFIED,
  ERROR_USER_NOT_FOUND,
  ERROR_INVALID_PASSWORD,
  ERROR_PASSWORD_CONFIRM_MISMATCH,
  ERROR_REFRESH_TOKEN_NOT_FOUND,
  ERROR_USER_BLOCKED,
  ERROR_USERNAME_ALREADY_EXISTS,
  ERROR_ACCOUNT_LOCKED,
  ERROR_TOO_MANY_LOGIN_ATTEMPTS,
  ERROR_INVALID_RESET_TOKEN,
  ERROR_RESET_TOKEN_EXPIRED,
  ERROR_RESET_TOKEN_ALREADY_USED,
  ERROR_MISSING_REFRESH_TOKEN,
  ERROR_EMAIL_NEED_VERIFIED,
} from '@modules/auth/auth.constant';
import {
  AccessTokenPayloadInput,
  RefreshTokenPayloadInput,
} from '@common/types/token-payload.interface';
import { LoginBodyDto } from '@modules/auth/dtos/login.body.dto';
import { LoginResponseDto } from '@modules/auth/dtos/login.response.dto';
import { RegisterBodyDto } from '@modules/auth/dtos/register.body.dto';
import { RegisterResponseDto } from '@modules/auth/dtos/register.response.dto';
import { RefreshTokenService } from '@modules/refresh-token/refresh-token.service';
import { OtpService } from '@modules/otp/otp.service';
import { OtpType } from '@generated/prisma/enums';
import { PrismaService } from '@common/services/prisma.service';
import { VerifyOtpDto } from '@modules/auth/dtos/verify-otp.body.dto';
import { ForgotPasswordBodyDto } from '@modules/auth/dtos/forgot-password.body.dto';
import { ForgotPasswordResponseDto } from '@modules/auth/dtos/forgot-password.response.dto';
import { ResetPasswordDto } from '@modules/auth/dtos/reset-password.body.dto';
import { MailService } from '@common/services/mail.service';
import { MailType } from '@common/constants/mail.constant';
import { LoggerService } from '@common/services/logger.service';
import { Request, Response } from 'express';
import { VerifyResetPasswordOtpResponseDto } from '@modules/auth/dtos/verify-reset-password-otp.body.response';
import { ResendOtpEmailDto } from '@modules/auth/dtos/resend-otp.body.dto';

@Injectable()
export class AuthService {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCK_DURATION_MINUTES = 30;
  private static readonly ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 1000;
  private static readonly REFRESH_TOKEN_COOKIE_MAX_AGE =
    7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async login(
    loginBodyDto: LoginBodyDto,
    req: Request,
    res: Response,
  ): Promise<LoginResponseDto> {
    const { email, password, provider = 'local' } = loginBodyDto;
    const user = await this.userService.findUser(email);
    this.logger.log(`Login attempt: ${email}`);

    if (!user) {
      this.logger.error(`Login failed - user not found: ${email}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (!user.isVerified) {
      this.logger.error(`Login blocked - email not verified: ${user.email}`);
      throw new ForbiddenException(ERROR_EMAIL_NEED_VERIFIED);
    }

    if (user.isBanned) {
      this.logger.error(`Login blocked - banned account: ${user.email}`);
      throw new ForbiddenException(ERROR_USER_BLOCKED);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      this.logger.error(
        `Login blocked - account locked (${minutesLeft}m left): ${user.email}`,
      );
      throw new ForbiddenException(ERROR_ACCOUNT_LOCKED(minutesLeft));
    }

    if (provider === 'local') {
      const isPasswordValid = await this.passwordService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        const attempts = await this.userService.incrementFailedLoginAttempts(
          user.userId,
        );
        this.logger.error(
          `Invalid password: ${user.email} (${attempts}/${AuthService.MAX_ATTEMPTS})`,
        );

        if (attempts >= AuthService.MAX_ATTEMPTS) {
          const lockUntil = new Date(
            Date.now() + AuthService.LOCK_DURATION_MINUTES * 60 * 1000,
          );

          await this.userService.lockUser(user.userId, lockUntil);

          this.logger.error(
            `Account locked for ${AuthService.LOCK_DURATION_MINUTES} minutes: ${user.email}`,
          );
          throw new ForbiddenException(
            ERROR_TOO_MANY_LOGIN_ATTEMPTS(AuthService.LOCK_DURATION_MINUTES),
          );
        }

        const attemptsLeft = AuthService.MAX_ATTEMPTS - attempts;

        throw new UnauthorizedException(ERROR_INVALID_PASSWORD(attemptsLeft));
      }
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.userService.resetLoginAttempts(user.userId);
    }

    this.logger.log(`Login attempts reset: ${user.email}`);
    const { accessToken, refreshToken } = await this.generateTokens(
      user.userId,
      user.email,
      user.role,
      user.username,
      provider,
      user.isVerified,
      user.isBanned,
    );

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['x-device-id'] as string | undefined;

    await this.refreshTokenService.saveRefreshToken(
      user.userId,
      refreshToken,
      deviceId,
      provider,
      ip,
      userAgent,
    );

    this.logger.log(`Login successful: ${user.email}`);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AuthService.ACCESS_TOKEN_COOKIE_MAX_AGE,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AuthService.REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: '/',
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        provider,
      },
    };
  }

  async register(
    registerBodyDto: RegisterBodyDto,
  ): Promise<RegisterResponseDto> {
    const { email, username, password, isSeller } = registerBodyDto;
    this.logger.log(`Register attempt: ${email}`);

    const emailExists = await this.userService.checkEmailExists(email);
    if (emailExists) {
      this.logger.error(`Register failed - email already exists: ${email}`);
      throw new ConflictException(ERROR_EMAIL_ALREADY_EXISTS);
    }

    const usernameExists = await this.userService.checkUsernameExists(username);
    if (usernameExists) {
      this.logger.error(
        `Register failed - username already exists: ${username}`,
      );
      throw new ConflictException(ERROR_USERNAME_ALREADY_EXISTS);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);
    const newUser = await this.userService.createUser(
      email,
      username,
      hashedPassword,
      isSeller,
    );
    this.logger.log(`User created successfully: ${newUser.userId}`);

    const otpCode = await this.otpService.createOrUpdateOtp(
      newUser.userId,
      OtpType.VERIFY_EMAIL,
    );
    this.logger.log(`Verification OTP generated for ${newUser.email}`);

    try {
      await this.mailService.sendMail(
        newUser.email,
        otpCode,
        MailType.VERIFY_EMAIL,
      );
    } catch {
      this.logger.error(
        `Failed to send verification email to ${newUser.email}`,
      );
      return {
        userId: newUser.userId,
        email: newUser.email,
        message:
          'Registration was successful, but we could not send the verification email. Please use the resend verification email option.',
      };
    }

    this.logger.log(`User ${username} registered successfully`);
    return {
      userId: newUser.userId,
      email: newUser.email,
      message:
        'Registration successful. Please check your email for verification.',
    };
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken: string | null = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.logger.error('Refresh token missing');
      throw new UnauthorizedException(ERROR_MISSING_REFRESH_TOKEN);
    }
    this.logger.log('Refresh token request received');

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { userId, provider } = payload;
    this.logger.log('Refresh token request validated');
    const tokenExists = await this.refreshTokenService.findRefreshToken(
      userId,
      refreshToken,
      provider,
    );

    if (!tokenExists) {
      this.logger.error(
        `Refresh token not found in DB | userId=${userId} | provider=${provider}`,
      );
      throw new UnauthorizedException(ERROR_REFRESH_TOKEN_NOT_FOUND);
    }

    const user = await this.userService.findUserById(payload.userId);
    if (!user) {
      this.logger.error(`User not found during refresh | userId=${userId}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(
        user.userId,
        user.email,
        user.role,
        user.username,
        provider,
        user.isVerified,
        user.isBanned,
      );

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['x-device-id'] as string | undefined;

    await this.refreshTokenService.saveRefreshToken(
      userId,
      newRefreshToken,
      deviceId,
      provider,
      ip,
      userAgent,
    );

    this.logger.log(`Refresh token rotated successfully | userId=${userId}`);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    this.logger.log(`Cookies updated successfully | userId=${userId}`);
  }

  async verifyEmailOtp(dto: VerifyOtpDto): Promise<void> {
    const { userId, type, code } = dto;

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        isVerified: true,
      },
    });

    if (!user) {
      this.logger.warn(`Verify OTP failed - user not found: ${userId}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (user.isVerified) {
      this.logger.warn(`Verify OTP failed - email already verified: ${userId}`);
      throw new ConflictException(ERROR_EMAIL_ALREADY_VERIFIED);
    }

    await this.otpService.checkOtp(userId, type, code);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId },
        data: {
          isVerified: true,
        },
      });

      await this.otpService.invalidateOtp(userId, type);
    });

    this.logger.log(`OTP verified successfully for user ${userId} (${type})`);
  }

  async verifyResetPasswordOtp(
    dto: VerifyOtpDto,
  ): Promise<VerifyResetPasswordOtpResponseDto> {
    const { userId, type, code } = dto;

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        isVerified: true,
        isBanned: true,
      },
    });

    if (!user) {
      this.logger.warn(`Reset Password OTP failed - user not found: ${userId}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    await this.otpService.checkOtp(userId, type, code);

    const token = crypto.randomUUID();

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await this.otpService.invalidateOtp(userId, OtpType.RESET_PASSWORD);
    });

    this.logger.log(`Reset OTP verified | userId=${userId}`);

    return {
      resetPasswordToken: token,
    };
  }

  async forgotPassword(
    dto: ForgotPasswordBodyDto,
  ): Promise<ForgotPasswordResponseDto> {
    const user = await this.userService.findUser(dto.email);

    if (!user) {
      this.logger.error(
        `CheckEmail failed - user not found | email=${dto.email}`,
      );
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    this.logger.log(`CheckEmail user found | userId=${user.userId}`);

    const otpCode = await this.otpService.createOrUpdateOtp(
      user.userId,
      OtpType.RESET_PASSWORD,
    );

    await this.mailService.sendMail(
      user.email,
      otpCode,
      MailType.RESET_PASSWORD,
    );

    return { userId: user.userId, email: user.email };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { resetPasswordToken, newPassword, confirmNewPassword } = dto;

    if (newPassword !== confirmNewPassword) {
      this.logger.error(`Password confirmation mismatch`);
      throw new BadRequestException(ERROR_PASSWORD_CONFIRM_MISMATCH);
    }

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: {
        token: resetPasswordToken,
      },
    });

    if (!resetRecord) {
      this.logger.error(`Invalid reset password token`);
      throw new UnauthorizedException(ERROR_INVALID_RESET_TOKEN);
    }

    if (resetRecord.usedAt) {
      this.logger.error(
        `Reset password token already used | userId=${resetRecord.userId}`,
      );
      throw new UnauthorizedException(ERROR_RESET_TOKEN_ALREADY_USED);
    }

    if (resetRecord.expiresAt < new Date()) {
      this.logger.warn(
        `Reset password token expired | userId=${resetRecord.userId}`,
      );
      throw new UnauthorizedException(ERROR_RESET_TOKEN_EXPIRED);
    }

    this.logger.log(
      `Reset password token validated | userId=${resetRecord.userId}`,
    );
    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          userId: resetRecord.userId,
        },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await tx.passwordResetToken.update({
        where: {
          id: resetRecord.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId: resetRecord.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
    });

    this.logger.log(
      `Reset password completed successfully | userId=${resetRecord.userId}`,
    );
  }

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken: string | null = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.logger.error('Refresh token missing');
      throw new UnauthorizedException(ERROR_MISSING_REFRESH_TOKEN);
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { userId, provider } = payload;

    const tokenExists = await this.refreshTokenService.findRefreshToken(
      userId,
      refreshToken,
      provider,
    );

    if (!tokenExists) {
      this.logger.error(
        `Refresh token not found | userId=${userId} | provider=${provider}`,
      );
      throw new UnauthorizedException(ERROR_REFRESH_TOKEN_NOT_FOUND);
    }

    await this.refreshTokenService.revokeRefreshToken(
      userId,
      refreshToken,
      provider,
    );

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    this.logger.log('Logout successfully');
  }

  async logoutAll(
    req: Request,
    res: Response,
  ): Promise<void> {
    const refreshToken: string | null = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.logger.error('Refresh token missing');
      throw new UnauthorizedException(ERROR_MISSING_REFRESH_TOKEN);
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { userId, provider } = payload;

    const tokenExists = await this.refreshTokenService.findRefreshToken(
      userId,
      refreshToken,
      provider,
    );

    if (!tokenExists) {
      this.logger.error(
        `Refresh token not found | userId=${userId} | provider=${provider}`,
      );
      throw new UnauthorizedException(ERROR_REFRESH_TOKEN_NOT_FOUND);
    }

    await this.refreshTokenService.revokeAllRefreshTokens(userId);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    this.logger.log(`Logout ALL devices successfully: ${userId}`);
  }

  async resendOtpEmail(dto: ResendOtpEmailDto): Promise<void> {
    const { email, type } = dto;
    const user = await this.userService.findUser(email);

    if (!user) {
      this.logger.warn(`OTP send failed - user not found: ${email}`);
      throw new NotFoundException(ERROR_USER_NOT_FOUND);
    }

    if (type === OtpType.VERIFY_EMAIL && user.isVerified) {
      this.logger.warn(
        `OTP send blocked - email already verified: ${user.userId}`,
      );
      throw new ConflictException(ERROR_EMAIL_ALREADY_VERIFIED);
    }

    const otpCode = await this.otpService.createOrUpdateOtp(user.userId, type);
    const mailType =
      type === OtpType.VERIFY_EMAIL
        ? MailType.VERIFY_EMAIL
        : MailType.RESET_PASSWORD;

    await this.mailService.sendMail(user.email, otpCode, mailType);
    this.logger.log(
      `OTP sent successfully | userId=${user.userId} | type=${type}`,
    );
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    username: string,
    provider = 'local',
    isVerified: boolean,
    isBanned: boolean,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenPayload: AccessTokenPayloadInput = {
      userId,
      email,
      role,
      username,
      provider,
      isVerified,
      isBanned,
    };

    const refreshTokenPayload: RefreshTokenPayloadInput = {
      userId,
      provider,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(accessTokenPayload),
      this.tokenService.generateRefreshToken(refreshTokenPayload),
    ]);

    return { accessToken, refreshToken };
  }
}
