import type { CurrentUser } from '@/shared/types/current-user';
import type { Role } from '@/shared/types/user.ts';

export interface UserContextValue {
  currentUser: CurrentUser | null;

  isAuthenticated: boolean;

  setCurrentUser: (user: CurrentUser | null) => void;

  clearCurrentUser: () => void;

  updateProfileImageUrl: (profileImageUrl: string | null) => void;

  updateCoverImageUrl: (coverImageUrl: string | null) => void;

  isCurrentUser: (userId: string) => boolean;

  hasRole: (...roles: Role[]) => boolean;
}
