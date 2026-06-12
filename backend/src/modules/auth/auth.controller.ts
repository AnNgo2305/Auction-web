import {
  Body,
  Controller,
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
import { ResendOtpEmailDto } from '@modules/auth/dtos/resend-otp.body.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
      data: loginResponse.user,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponsePayload> {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password reset successfully',
      data: {},
    };
  }

  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() dto: VerifyOtpDto): Promise<ResponsePayload> {
    await this.authService.verifyEmailOtp(dto);
    return {
      message: 'Email verified successfully',
      data: {},
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpEmailDto): Promise<ResponsePayload> {
    await this.authService.resendOtpEmail(dto);
    return {
      message: 'OTP has been sent successfully',
      data: {},
    };
  }
}
