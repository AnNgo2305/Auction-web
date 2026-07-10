import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/features/profile/api/profile.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import {
  GetProfileData,
  type GetProfileResponse,
} from '@/features/profile/types/get-profile.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useGetProfile(userId: string) {
  return useQuery<GetProfileResponse, ApiResponseError, GetProfileData>({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileApi.getProfile(userId),
    enabled: !!userId,
    select: (response) => response.data,
    staleTime: 1000 * 30,
  });
}
