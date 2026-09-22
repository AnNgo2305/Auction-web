import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { LoginBodyDto } from '@modules/auth/dtos/login.body.dto';
import { LoginResponseDto } from '@modules/auth/dtos/login.response.dto';
import { Request, Response } from 'express';
import { RegisterBodyDto } from '@modules/auth/dtos/register.body.dto';
import { RegisterResponseDto } from '@modules/auth/dtos/register.response.dto';
import { ResponsePayload } from '@common/types/response.interface';
import { ResetPasswordDto } from '@modules/auth/dtos/reset-password.body.dto';
import { VerifyOtpDto } from '@modules/auth/dtos/verify-otp.body.dto';
import { ForgotPasswordResponseDto } from '@modules/auth/dtos/forgot-password.response.dto';
import { ForgotPasswordBodyDto } from '@modules/auth/dtos/forgot-password.body.dto';
import { ResendOtpEmailDto } from '@modules/auth/dtos/resend-otp-email.body.dto';
import { Throttle } from '@nestjs/throttler';
import { CsrfService } from '@common/services/csrf.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { ERROR_MISSING_ACCESS_TOKEN } from '@common/constants/error.constant';
import {
  ERROR_ACCOUNT_LOCKED,
  ERROR_EMAIL_ALREADY_EXISTS,
  ERROR_EMAIL_ALREADY_VERIFIED,
  ERROR_INVALID_PASSWORD,
  ERROR_INVALID_REFRESH_TOKEN,
  ERROR_INVALID_RESET_TOKEN,
  ERROR_MISSING_REFRESH_TOKEN,
  ERROR_PASSWORD_CONFIRM_MISMATCH,
  ERROR_REFRESH_TOKEN_NOT_FOUND,
  ERROR_RESET_TOKEN_ALREADY_USED,
  ERROR_RESET_TOKEN_EXPIRED,
  ERROR_TOO_MANY_LOGIN_ATTEMPTS,
  ERROR_USER_BLOCKED,
  ERROR_USER_NOT_FOUND,
  ERROR_USERNAME_ALREADY_EXISTS,
} from '@modules/auth/auth.constant';
import {
  ERROR_OTP_EXPIRED,
  ERROR_OTP_NOT_FOUND,
} from '@modules/otp/otp.constant';
import { ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED } from '@modules/refresh-token/refresh-token.constant';
import { VerifyResetPasswordOtpResponseDto } from '@modules/auth/dtos/verify-reset-password-otp.response';

@Controller('auth')
@ApiTags('Auth')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  LoginResponseDto,
  RegisterResponseDto,
  ForgotPasswordResponseDto,
  VerifyResetPasswordOtpResponseDto,
)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Get('csrf-token')
  @ApiOperation({
    summary: 'Generate CSRF token',
    description:
      'Generates a CSRF token for authenticated state-changing requests.',
  })
  @ApiOkResponse({
    description: 'CSRF token generated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                csrfToken: {
                  type: 'string',
                  example: 'random-csrf-token',
                },
              },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'CSRF token generated successfully',
      data: {
        csrfToken: 'random-csrf-token',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: ERROR_MISSING_ACCESS_TOKEN.message,
    type: ErrorResponse,
    example: ERROR_MISSING_ACCESS_TOKEN,
  })
  @ApiCookieAuth('access_token')
  getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): ResponsePayload {
    const csrfToken = this.csrfService.generateToken(req, res);

    return {
      message: 'CSRF token generated successfully',
      data: {
        csrfToken,
      },
    };
  }

  @Post('login')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 60_000, limit: 10 },
    long: { ttl: 900_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Login to system with email and password.',
  })
  @ApiBody({ type: LoginBodyDto })
  @ApiOkResponse({
    description: 'Login successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(LoginResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Login successfully',
      data: {
        user: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          username: 'nguyenvana',
          role: 'BIDDER',
          isVerified: true,
          isBanned: false,
          profileImageUrl: 'https://example.com/avatar.jpg',
          coverImageUrl: 'https://example.com/cover.jpg',
          provider: 'local',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  @ApiUnauthorizedResponse({
    description: ERROR_INVALID_PASSWORD(2).message,
    type: ErrorResponse,
    example: ERROR_INVALID_PASSWORD(2),
  })
  @ApiForbiddenResponse({
    description: 'Authentication failed',
    type: ErrorResponse,
    examples: {
      blocked: {
        summary: 'User is blocked',
        value: ERROR_USER_BLOCKED,
      },
      accountLocked: {
        summary: 'Account is locked',
        value: ERROR_ACCOUNT_LOCKED(15),
      },
      tooManyLoginAttempts: {
        summary: 'Too many login attempts',
        value: ERROR_TOO_MANY_LOGIN_ATTEMPTS(15),
      },
    },
  })
  async login(
    @Body() loginBodyDto: LoginBodyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponsePayload> {
    const loginResponse: LoginResponseDto = await this.authService.login(
      loginBodyDto,
      req,
      res,
    );

    return {
      message: 'Login successfully',
      data: loginResponse,
    };
  }

  @Post('register')
  @Throttle({
    short: { ttl: 60_000, limit: 3 },
    medium: { ttl: 600_000, limit: 10 },
    long: { ttl: 3_600_000, limit: 20 },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sends an email verification OTP.',
  })
  @ApiBody({ type: RegisterBodyDto })
  @ApiCreatedResponse({
    description: 'Register successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        { properties: { data: { $ref: getSchemaPath(RegisterResponseDto) } } },
      ],
    },
    example: {
      statusCode: 201,
      message: 'Register successfully',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        message:
          'Registration successful. Please check your email for verification.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PASSWORD_CONFIRM_MISMATCH.message,
    type: ErrorResponse,
    example: ERROR_PASSWORD_CONFIRM_MISMATCH,
  })
  @ApiConflictResponse({
    description: 'Username or email already exists',
    type: ErrorResponse,
    examples: {
      usernameExists: {
        summary: 'Username already exists',
        value: ERROR_USERNAME_ALREADY_EXISTS,
      },
      emailExists: {
        summary: 'Email already exists',
        value: ERROR_EMAIL_ALREADY_EXISTS,
      },
    },
  })
  async register(
    @Body() registerBodyDto: RegisterBodyDto,
  ): Promise<ResponsePayload> {
    const registerResponse: RegisterResponseDto =
      await this.authService.register(registerBodyDto);
    return {
      message: 'Register successfully',
      data: registerResponse,
    };
  }

  @Post('refresh-token')
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 60_000, limit: 30 },
    long: { ttl: 900_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Rotates the refresh token and issues a new access token and refresh token.',
  })
  @ApiOkResponse({
    description: 'Refresh token successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Refresh token successfully',
      data: {},
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token authentication failed',
    type: ErrorResponse,
    examples: {
      missingRefreshToken: {
        summary: 'Refresh token is missing',
        value: ERROR_MISSING_REFRESH_TOKEN,
      },
      refreshTokenNotFound: {
        summary: 'Refresh token not found',
        value: ERROR_REFRESH_TOKEN_NOT_FOUND,
      },
      invalidRefreshToken: {
        summary: 'Refresh token is invalid',
        value: ERROR_INVALID_REFRESH_TOKEN,
      },
    },
  })
  @ApiCookieAuth('refresh_token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponsePayload> {
    await this.authService.refreshToken(req, res);

    return {
      message: 'Refresh token successfully',
      data: {},
    };
  }

  @Post('reset-password')
  @Throttle({
    short: { ttl: 60_000, limit: 3 },
    medium: { ttl: 600_000, limit: 10 },
    long: { ttl: 3_600_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password using a valid password reset token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Password reset successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Password reset successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PASSWORD_CONFIRM_MISMATCH.message,
    type: ErrorResponse,
    example: ERROR_PASSWORD_CONFIRM_MISMATCH,
  })
  @ApiUnauthorizedResponse({
    description: 'Password reset token validation failed',
    type: ErrorResponse,
    examples: {
      invalidResetToken: {
        summary: 'Reset token is invalid',
        value: ERROR_INVALID_RESET_TOKEN,
      },
      resetTokenAlreadyUsed: {
        summary: 'Reset token has already been used',
        value: ERROR_RESET_TOKEN_ALREADY_USED,
      },
      resetTokenExpired: {
        summary: 'Reset token has expired',
        value: ERROR_RESET_TOKEN_EXPIRED,
      },
    },
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponsePayload> {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password reset successfully',
      data: {},
    };
  }

  @Post('verify-email-otp')
  @Throttle({
    short: { ttl: 60_000, limit: 5 },
    medium: { ttl: 600_000, limit: 10 },
    long: { ttl: 3_600_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with OTP',
    description:
      'Verifies the user email address using the OTP sent to the user.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({
    description: 'Email verified successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Email verified successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_EMAIL_ALREADY_VERIFIED.message,
    type: ErrorResponse,
    example: ERROR_EMAIL_ALREADY_VERIFIED,
  })
  @ApiUnauthorizedResponse({
    description: 'OTP verification failed',
    type: ErrorResponse,
    examples: {
      otpNotFound: {
        summary: 'OTP is invalid or not found',
        value: ERROR_OTP_NOT_FOUND,
      },
      otpExpired: {
        summary: 'OTP has expired',
        value: ERROR_OTP_EXPIRED,
      },
    },
  })
  async verifyEmailOtp(@Body() dto: VerifyOtpDto): Promise<ResponsePayload> {
    await this.authService.verifyEmailOtp(dto);
    return {
      message: 'Email verified successfully',
      data: {},
    };
  }

  @Post('logout')
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 60_000, limit: 30 },
    long: { ttl: 900_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description:
      'Revokes the current refresh token and blacklists the current access token.',
  })
  @ApiOkResponse({
    description: 'Logout successfully',
    type: SuccessResponse,
    example: { statusCode: 200, message: 'Logout successfully', data: {} },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token authentication failed',
    type: ErrorResponse,
    examples: {
      missingRefreshToken: {
        summary: 'Refresh token is missing',
        value: ERROR_MISSING_REFRESH_TOKEN,
      },
      refreshTokenNotFound: {
        summary: 'Refresh token not found',
        value: ERROR_REFRESH_TOKEN_NOT_FOUND,
      },
      refreshTokenNotFoundOrRevoked: {
        summary: 'Refresh token was revoked during logout',
        value: ERROR_REFRESH_TOKEN_NOT_FOUND_OR_REVOKED,
      },
    },
  })
  @ApiCookieAuth('refresh_token')
  @ApiSecurity('csrf-token')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponsePayload> {
    await this.authService.logout(req, res);
    return {
      message: 'Logout successfully',
      data: {},
    };
  }

  @Post('logout-all')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 60_000, limit: 10 },
    long: { ttl: 900_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout all devices',
    description:
      'Revokes all active refresh tokens for the authenticated user, blacklists the current access token, and clears authentication cookies.',
  })
  @ApiOkResponse({
    description: 'Logout all devices successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Logout all devices successfully',
      data: {},
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token authentication failed',
    type: ErrorResponse,
    examples: {
      missingRefreshToken: {
        summary: 'Refresh token is missing',
        value: ERROR_MISSING_REFRESH_TOKEN,
      },
      refreshTokenNotFound: {
        summary: 'Refresh token not found',
        value: ERROR_REFRESH_TOKEN_NOT_FOUND,
      },
    },
  })
  @ApiCookieAuth('refresh_token')
  @ApiSecurity('csrf-token')
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponsePayload> {
    await this.authService.logoutAll(req, res);

    return {
      message: 'Logout all devices successfully',
      data: {},
    };
  }

  @Post('forgot-password')
  @Throttle({
    short: { ttl: 60_000, limit: 2 },
    medium: { ttl: 600_000, limit: 5 },
    long: { ttl: 3_600_000, limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Checks whether the email belongs to an existing user and sends a password reset OTP.',
  })
  @ApiBody({ type: ForgotPasswordBodyDto })
  @ApiOkResponse({
    description: 'Password reset OTP sent successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(ForgotPasswordResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Email exists',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordBodyDto,
  ): Promise<ResponsePayload> {
    const result: ForgotPasswordResponseDto =
      await this.authService.forgotPassword(dto);
    return {
      message: 'Email exists',
      data: result,
    };
  }

  @Post('verify-reset-password-otp')
  @Throttle({
    short: { ttl: 60_000, limit: 5 },
    medium: { ttl: 600_000, limit: 10 },
    long: { ttl: 3_600_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify password reset OTP',
    description:
      'Verifies the password reset OTP and generates a temporary token for resetting the password.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({
    description: 'OTP verified successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(VerifyResetPasswordOtpResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'OTP verified successfully',
      data: { resetPasswordToken: '550e8400-e29b-41d4-a716-446655440000' },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  @ApiUnauthorizedResponse({
    description: 'OTP verification failed',
    type: ErrorResponse,
    examples: {
      otpNotFound: {
        summary: 'OTP is invalid or not found',
        value: ERROR_OTP_NOT_FOUND,
      },
      otpExpired: { summary: 'OTP has expired', value: ERROR_OTP_EXPIRED },
    },
  })
  async verifyResetPasswordOtp(
    @Body() dto: VerifyOtpDto,
  ): Promise<ResponsePayload> {
    const result = await this.authService.verifyResetPasswordOtp(dto);

    return {
      message: 'OTP verified successfully',
      data: result,
    };
  }

  @Post('resend-otp')
  @Throttle({
    short: { ttl: 60_000, limit: 2 },
    medium: { ttl: 600_000, limit: 5 },
    long: { ttl: 3_600_000, limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP',
    description:
      'Generates and sends a new OTP to the user email for email verification or password reset.',
  })
  @ApiBody({ type: ResendOtpEmailDto })
  @ApiOkResponse({
    description: 'OTP has been sent successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'OTP has been sent successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_EMAIL_ALREADY_VERIFIED.message,
    type: ErrorResponse,
    example: ERROR_EMAIL_ALREADY_VERIFIED,
  })
  async resendOtp(@Body() dto: ResendOtpEmailDto): Promise<ResponsePayload> {
    await this.authService.resendOtpEmail(dto);
    return {
      message: 'OTP has been sent successfully',
      data: {},
    };
  }
}
