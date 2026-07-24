import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { ProfilePermissionService } from '@modules/permission/profile-permission.service';
import { ProductPermissionService } from '@modules/permission/product-permission.service';
import { FollowModule } from '@modules/follow/follow.module';

@Module({
  imports: [CommonModule, FollowModule],
  providers: [ProfilePermissionService, ProductPermissionService],
  exports: [ProfilePermissionService, ProductPermissionService],
})
export class PermissionModule {}
