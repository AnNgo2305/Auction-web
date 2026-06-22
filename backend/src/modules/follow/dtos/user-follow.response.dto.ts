import type { Role } from '@generated/prisma/enums';

export class FollowUserDto {
  userId!: string;
  username!: string;
  role!: Role;
  profileImageUrl?: string | null;
}
