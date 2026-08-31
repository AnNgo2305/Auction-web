import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OtpType } from '@generated/prisma/enums';
import { PrismaService } from '@common/services/prisma.service';
import { randomInt } from 'crypto';
import { EXPIRES_IN_MINUTES } from '@common/constants/mail.constant';
import {
  ERROR_OTP_EXPIRED,
  ERROR_OTP_NOT_FOUND,
} from '@modules/otp/otp.constant';
import { OtpCacheService } from '@common/cache/otp.cache.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpCacheService: OtpCacheService,
  ) {}

  private generateOtpCode(): string {
    return randomInt(100000, 999999).toString();
  }

  async createOrUpdateOtp(userId: string, type: OtpType): Promise<string> {
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);

    const existingOtp = await this.prisma.otp.findFirst({
      where: { userId, type },
    });

    if (existingOtp) {
      await this.prisma.otp.update({
        where: { id: existingOtp.id },
        data: { code: otpCode, expiresAt },
      });
    } else {
      await this.prisma.otp.create({
        data: { userId, type, code: otpCode, expiresAt },
      });
    }

    await this.otpCacheService.set(userId, type, otpCode);
    return otpCode;
  }

  async checkOtp(
    userId: string,
    type: OtpType,
    code: string,
  ): Promise<boolean> {
    const cachedCode = await this.otpCacheService.get(userId, type);
    if (cachedCode) {
      if (cachedCode !== code) {
        throw new UnauthorizedException(ERROR_OTP_NOT_FOUND);
      }

      return true;
    }

    const otp = await this.prisma.otp.findFirst({
      where: { userId, type, code },
    });

    if (!otp) {
      throw new UnauthorizedException(ERROR_OTP_NOT_FOUND);
    }

    if (otp.expiresAt && otp.expiresAt < new Date()) {
      throw new UnauthorizedException(ERROR_OTP_EXPIRED);
    }

    await this.otpCacheService.set(userId, type, otp.code!);
    return true;
  }

  async invalidateOtp(userId: string, type: OtpType): Promise<void> {
    await this.prisma.otp.updateMany({
      where: { userId, type },
      data: { code: null, expiresAt: null },
    });

    await this.otpCacheService.delete(userId, type);
  }
}
