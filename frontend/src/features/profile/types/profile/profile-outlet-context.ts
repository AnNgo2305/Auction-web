import type { GetProfileData } from '@/features/profile/types/profile/get-profile.response.ts';

export interface ProfileOutletContext {
  profile: GetProfileData;
  isOwner: boolean;
  isInitialProfileLoading: boolean;
  isProfileRefreshing: boolean;
}
