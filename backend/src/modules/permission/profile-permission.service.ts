import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
import { RelationshipStatus } from '@modules/follow/follow.constant';
import { ERROR_PROFILE_NOT_FOUND } from '@modules/profile/profile.constant';
import { RelationshipStatusResult } from '@modules/follow/dtos/user-follow.response.dto';

@Injectable()
export class ProfilePermissionService {
  constructor(private readonly logger: LoggerService) {}

  canViewProfile(
    relationship: RelationshipStatusResult,
    targetUserId: string,
    currentUserId?: string,
  ): void {
    if (relationship.status === RelationshipStatus.BLOCKED) {
      this.logger.warn(
        `User ${currentUserId} is blocked by user ${targetUserId}`,
      );

      throw new NotFoundException(ERROR_PROFILE_NOT_FOUND);
    }
  }
}
