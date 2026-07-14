import type { ApiResponse } from '@/shared/types/response.ts';
import type { Gender } from '@/shared/types/user.ts';

export class UpdateProfileData {
  fullName!: string | null;

  phoneNumber!: string | null;

  bio!: string | null;

  dateOfBirth!: string | null;

  gender!: Gender | null;
}

export type UpdateProfileResponse = ApiResponse<UpdateProfileData>;
