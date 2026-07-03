import { Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { AuthService } from '@modules/auth/auth.service';
import { CommonModule } from '@common/common.module';
import { AuthController } from '@modules/auth/auth.controller';
import { RefreshTokenModule } from '@modules/refresh-token/refresh-token.module';
import { OtpModule } from '@modules/otp/otp.module';
import { ProfileModule } from '@modules/profile/profile.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    RefreshTokenModule,
    OtpModule,
    ProfileModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
