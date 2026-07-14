import type { Role } from '@/shared/types/user.ts';

export interface CurrentUser {
  userId: string;
  email: string;
  username: string;
  role: Role;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
}
