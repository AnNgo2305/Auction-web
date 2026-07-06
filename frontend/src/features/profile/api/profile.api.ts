import { api } from '@/shared/api/axios';

import type { UpdateProfileBody } from '@/features/profile/schemas/update-profile.schema';
import type { UpdateImageBody } from '@/features/profile/schemas/update-image.schema';

import type { GetProfileResponse } from '@/features/profile/types/get-profile.response';
import type { UpdateProfileResponse } from '@/features/profile/types/update-profile.response';
import type { UpdateProfileImageResponse } from '@/features/profile/types/update-profile-image.response';
import type { UpdateCoverImageResponse } from '@/features/profile/types/update-cover-image.response';
import type { DeleteProfileImageResponse } from '@/features/profile/types/delete-profile-image.response';
import type { DeleteCoverImageResponse } from '@/features/profile/types/delete-cover-image.response';

const PROFILE_API_PREFIX = '/profile';

export const profileApi = {
  getProfile: async (userId: string): Promise<GetProfileResponse> => {
    const res = await api.get<GetProfileResponse>(
      `${PROFILE_API_PREFIX}/${userId}`,
    );

    return res.data;
  },

  updateProfile: async (
    body: UpdateProfileBody,
  ): Promise<UpdateProfileResponse> => {
    const res = await api.put<UpdateProfileResponse>(PROFILE_API_PREFIX, body);

    return res.data;
  },

  updateAvatar: async (
    body: UpdateImageBody,
  ): Promise<UpdateProfileImageResponse> => {
    const res = await api.patch<UpdateProfileImageResponse>(
      `${PROFILE_API_PREFIX}/avatar`,
      body,
    );

    return res.data;
  },

  updateCover: async (
    body: UpdateImageBody,
  ): Promise<UpdateCoverImageResponse> => {
    const res = await api.patch<UpdateCoverImageResponse>(
      `${PROFILE_API_PREFIX}/cover`,
      body,
    );

    return res.data;
  },

  deleteAvatar: async (): Promise<DeleteProfileImageResponse> => {
    const res = await api.delete<DeleteProfileImageResponse>(
      `${PROFILE_API_PREFIX}/avatar`,
    );

    return res.data;
  },

  deleteCover: async (): Promise<DeleteCoverImageResponse> => {
    const res = await api.delete<DeleteCoverImageResponse>(
      `${PROFILE_API_PREFIX}/cover`,
    );

    return res.data;
  },
};
