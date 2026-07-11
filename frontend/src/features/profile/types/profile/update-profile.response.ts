import type { ApiResponse } from '@/shared/types/response.ts';

export class UpdateProfileData {
  fullName!: string | null;

  phoneNumber!: string | null;

  bio!: string | null;

  dateOfBirth!: string | null;

  gender!: 'MALE' | 'FEMALE' | 'OTHER' | null;
}

export type UpdateProfileResponse = ApiResponse<UpdateProfileData>;
