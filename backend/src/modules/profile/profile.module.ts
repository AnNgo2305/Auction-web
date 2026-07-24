import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { CommonModule } from '@common/common.module';
import { FollowModule } from '@modules/follow/follow.module';
import { RefreshTokenModule } from '@modules/refresh-token/refresh-token.module';
import { PermissionModule } from '@modules/permission/permission.module';

@Module({
  imports: [CommonModule, FollowModule, RefreshTokenModule, PermissionModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
